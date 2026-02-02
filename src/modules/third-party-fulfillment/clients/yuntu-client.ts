import { MedusaError } from "@medusajs/framework/utils";
import axios, { AxiosHeaders, AxiosInstance, AxiosResponse } from "axios";
import crypto from "crypto";
import { YuntuTypes } from "../types";

interface YuntuConfig {
  appId: string;
  appSecret: string;
  sourceKey: string;
  baseURL: string;
}

interface YuntuResponse<T = any> {
  t: string;
  request_id?: string; //文档为必定返回，实际未返回
  result?: T; //响应成功信息 （异常时此字段为空）
  msg?: string; // 请求响应描述(成功响应时该字段为空）
  code?: string; // 异常响应错误码
  success: boolean; // 响应成功标识（true：成功，false：失败）
  detail?: T; // 查询物流产品接口返回字段
}

interface TokenResponse {
  expiresIn: number;
  accessToken: string;
}

export class YuntuClient {
  private axiosInstance: AxiosInstance;
  private appId: string;
  private appSecret: string;
  private sourceKey: string;
  private accessToken: string | null = null; // 初始值为 null
  private expiresAt: number = 0; // 初始值为 0
  private isRefreshing: boolean = false;
  private subscribers: ((token: string) => void)[] = [];

  constructor(options: YuntuConfig) {
    this.appId = options.appId;
    this.appSecret = options.appSecret;
    this.sourceKey = options.sourceKey;

    this.axiosInstance = axios.create({
      baseURL: options.baseURL || "https://openapi.yunexpress.cn",
    });

    /* Error handling and automatic token refetching */
    this.axiosInstance.interceptors.request.use(async (axiosConfig) => {
      if (axiosConfig.url === "/openapi/oauth2/token") {
        return axiosConfig;
      }
      if (!this.accessToken || Date.now() >= this.expiresAt - 60000) {
        await this.refreshAccessToken();
      }
      if (this.accessToken) {
        axiosConfig.headers.set("token", this.accessToken);
      }
      return axiosConfig;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalConfig = error.config;
        if (
          !error.response ||
          error.response.status !== 401 ||
          originalConfig.url === "/openapi/oauth2/token" ||
          originalConfig._retry
        ) {
          return Promise.reject(error);
        }
        if (!this.isRefreshing) {
          /**
           *  并发锁-判断请求队列是否已开始
           *  本次请求是第一个触发 token refresh 的请求
           */
          this.isRefreshing = true;
          originalConfig._retry = true;
          try {
            const newTokenData = await this.refreshAccessToken();
            const newToken = newTokenData.accessToken;
            this.isRefreshing = false;
            this.onTokenRefreshed(newToken); // 通知所有订阅者，token 已刷新
            originalConfig.headers.set("token", newToken);
            return this.axiosInstance(originalConfig);
          } catch (refreshError) {
            this.isRefreshing = false;
            return Promise.reject(refreshError);
          }
        }
        /**
         * 本次请求不是第一个触发 token refresh 的请求
         * 将请求加入订阅队列，等待 token 刷新后重新发起请求
         */
        return new Promise((resolve) => {
          this.subscribers.push((newToken: string) => {
            originalConfig._retry = true;
            originalConfig.headers.set("token", newToken);
            resolve(this.axiosInstance(originalConfig));
          });
        });
      }
    );
  }

  private generateSignature(
    date: string,
    method: string,
    url: string,
    body?: string
  ): string {
    const rawString = body
      ? `body=${body}&date=${date}&method=${method}&uri=${url}`
      : `date=${date}&method=${method}&uri=${url}`;
    return crypto
      .createHmac("sha256", this.appSecret)
      .update(rawString)
      .digest("base64");
  }

  private async request<T>(
    method: "POST" | "GET",
    url: string,
    options?: { data?: any; params?: any }
  ): Promise<AxiosResponse<T>> {
    const headers = new AxiosHeaders();
    const date = Date.now().toString();
    const body = options?.data ? JSON.stringify(options.data) : undefined;
    const sign = this.generateSignature(date, method, url, body);
    headers.set("date", date);
    headers.set("sign", sign);
    return await this.axiosInstance.request<T>({
      method,
      url,
      ...options,
      headers,
    });
  }

  private async post<T>(
    url: string,
    data?: any,
    options?: { params?: any }
  ): Promise<T> {
    const res = await this.request<YuntuResponse>("POST", url, {
      data,
      params: options?.params,
    });
    return res.data.result;
  }

  private async get<T>(url, options?: { params?: any }): Promise<T> {
    const res = await this.request<YuntuResponse>("GET", url, {
      params: options?.params,
    });
    return res.data.result || res.data.detail;
  }

  private async refreshAccessToken() {
    const payload = {
      grantType: "client_credentials",
      appId: this.appId,
      appSecret: this.appSecret,
      sourceKey: this.sourceKey,
    };
    const res = await this.request<TokenResponse>(
      "POST",
      "/openapi/oauth2/token",
      {
        data: payload,
      }
    );
    this.accessToken = res.data.accessToken;
    this.expiresAt = Date.now() + res.data.expiresIn * 1000;
    return res.data;
  }

  private onTokenRefreshed(newToken: string) {
    this.subscribers.forEach((c) => {
      c(newToken);
    });
    this.subscribers = [];
  }

  async createOrder(
    payload: YuntuTypes.CreateYuntuOrderRequest
  ): Promise<YuntuTypes.CreateYuntuOrderResponse> {
    return await this.post("/v1/order/package/create", payload);
  }

  async getOrder(
    orderNumber: string
  ): Promise<YuntuTypes.GetYuntuOrderResponse> {
    return await this.get("/v1/order/info/get", {
      params: { order_number: orderNumber },
    });
  }

  /**
   * 仅支持对已预报或草稿状态下的运单进行撤销
   * @param waybillNumber 运单号
   */
  async cancelOrder(waybillNumber: string) {
    return await this.post("/v1/order/cancel", {
      waybill_number: waybillNumber,
    });
  }

  async holdOrder(payload: YuntuTypes.HoldYuntuOrderRequest) {
    return await this.post("/v1/order/hold", payload);
  }

  /**
   *  获取运单标签，文件以 PDF 格式返回
   * @param orderNumber 支持运单号、客户单号、跟踪号
   */
  async getLabel(
    orderNumber: string
  ): Promise<YuntuTypes.GetYuntuLabelResponse> {
    return await this.get("/v1/order/label/get", {
      params: { order_number: orderNumber },
    });
  }

  async listLogisticsProducts(
    countryCode?: string
  ): Promise<YuntuTypes.ListYuntuProductsResponse> {
    return this.get("/v1/basic-data/products/getlist", {
      params: { country_code: countryCode },
    });
  }

  /**
   * 运费试算-疑似仅支持生产环境调用此接口。
   * @param payload 国家二字码和重量必传
   */
  async getEstimatedCost(
    payload: YuntuTypes.GetYuntuEstimatedCostRequest
  ): Promise<YuntuTypes.GetYuntuEstimatedCostResponse> {
    return await this.get("/v1/price-trial/get", { params: payload });
  }

  /**
   * 查询运单轨迹
   * @param orderNumber 支持运单号、客户单号、跟踪号
   */
  async getTracking(
    orderNumber: string
  ): Promise<YuntuTypes.GetYuntuTrackingResponse> {
    return this.get("/v1/track-service/info/get", {
      params: { order_number: orderNumber },
    });
  }
}
