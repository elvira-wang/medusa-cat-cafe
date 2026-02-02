/*
 * 4px client
 * 实现 MD5 签名加密算法
 * 公共参数统一请求封装
 * 业务错误代码统一处理
 * 定义具体业务接口和对应方法
 */

import { MedusaError } from "@medusajs/framework/utils";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import crypto from "crypto";
import { FourPXTypes } from "../types";

interface FourPXConfig {
  appKey: string;
  appSecret: string;
  baseURL?: string;
}

interface FourPXResponse<T = any> {
  result: string;
  msg: string;
  data?: T;
  errors?: any;
}

enum FourPXMethod {
  CREATE_ORDER = "ds.xms.order.create", // 创建直发委托单
  GET_ORDER = "ds.xms.order.get", // 查询直发委托单
  CANCEL_ORDER = "ds.xms.order.cancel", // 取消直发委托单
  HOLD_ORDER = "ds.xms.order.hold", // 拦截/取消拦截订单
  GET_LABEL = "ds.xms.label.get", // 获取标签（面单）
  GET_LABEL_LIST = "ds.xms.label.getlist", // 批量获取标签
  GET_LOGISTICS_PRODUCT = "ds.xms.logistics_product.getlist",
  GET_ESTIMATED_COST = "ds.xms.estimated_cost.get", // 预估费用查询/费用试算
  GET_TRACKING = "tr.order.tracking.get", // 查询物流轨迹
}

export class FourPXClient {
  private axiosInstance: AxiosInstance;
  private appKey: string;
  private appSecret: string;
  private readonly DEFAULT_VERSION = "1.1.0";
  private readonly DEFAULT_FORMAT = "json";

  constructor(options: FourPXConfig) {
    this.appKey = options.appKey;
    this.appSecret = options.appSecret;

    this.axiosInstance = axios.create({
      baseURL: options.baseURL || "https://open.4px.com/router/api/service",
    });

    /* Error handling logic can be further improved if necessary */
    this.axiosInstance.interceptors.response.use((response) => {
      const resData = response.data as FourPXResponse;
      if (
        resData.result === "0" ||
        (resData.errors && resData.errors.length > 0)
      ) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `4PX API Error:${resData.errors}`
        );
      }
      return response;
    });
  }

  private generateSignature(
    apiMethod: string,
    timestamp: string,
    body: string,
    version: string,
    format: string
  ): string {
    const rawString = `app_key${this.appKey}format${format}method${apiMethod}timestamp${timestamp}v${version}${body}${this.appSecret}`;
    return crypto.createHash("md5").update(rawString).digest("hex");
  }

  private async request<T>(
    httpMethod: "POST" | "GET",
    apiMethod: string,
    options?: {
      data?: any;
    }
  ): Promise<AxiosResponse<T>> {
    const version = this.DEFAULT_VERSION;
    const format = this.DEFAULT_FORMAT;
    const timestamp = Date.now().toString();
    const bodyStr = JSON.stringify(options?.data);
    const sign = this.generateSignature(
      apiMethod,
      timestamp,
      bodyStr,
      version,
      format
    );

    return await this.axiosInstance.request<T>({
      method: httpMethod,
      ...options,
      params: {
        method: apiMethod,
        app_key: this.appKey,
        v: version,
        timestamp: timestamp,
        format: format,
        sign: sign,
      },
    });
  }

  private async post<T>(
    apiMethod: string,
    data: any,
    options?: any
  ): Promise<T> {
    const res = await this.request<FourPXResponse>("POST", apiMethod, { data });
    return res.data.data;
  }

  async createOrder(
    payload: FourPXTypes.Create4pxOrderRequest
  ): Promise<FourPXTypes.Create4pxOrderResponse> {
    return this.post(FourPXMethod.CREATE_ORDER, payload);
  }

  async getOrder(
    payload: FourPXTypes.Get4pxOrderRequest
  ): Promise<FourPXTypes.Get4pxOrderResponse> {
    return this.post(FourPXMethod.GET_ORDER, payload);
  }

  async cancelOrder(payload: FourPXTypes.Cancel4pxOrderRequest) {
    return this.post(FourPXMethod.CANCEL_ORDER, payload);
  }

  /**
   *  申请|取消拦截订单
   *  适用场景：已调用创建并预报接口（订单已预报状态），货正在送往4PX仓的路上
   * @param payload is_hold 字段：Y-拦截，N-取消拦截
   */
  async holdOrder(payload: FourPXTypes.Hold4pxOrderRequest) {
    return this.post(FourPXMethod.HOLD_ORDER, payload);
  }

  async getLabel(
    payload: FourPXTypes.Get4pxLabelRequest
  ): Promise<FourPXTypes.Get4pxLabelResponse> {
    return this.post(FourPXMethod.GET_LABEL, payload);
  }

  async listLabels(
    payload: FourPXTypes.Get4pxLabelListRequest
  ): Promise<string> {
    return this.post(FourPXMethod.GET_LABEL_LIST, payload);
  }

  async listLogisticsProducts(transportMode: string) {
    return this.post(FourPXMethod.GET_LOGISTICS_PRODUCT, {
      transport_mode: transportMode,
    });
  }

  /**
   * 仅支持生产环境调用此接口。
   * @param payload 其中 request_no 请求单号字段支持4PX单号、面单号、客户单号；若填写了请求单号，则其余请求字段将不会生效
   */
  async getEstimatedCost(
    payload: FourPXTypes.Get4pxEstimatedCostRequest
  ): Promise<FourPXTypes.Get4pxEstimatedCostResponse> {
    return this.post(FourPXMethod.GET_ESTIMATED_COST, payload);
  }

  /**
   * 仅支持生产环境调用此接口。
   * @param deliveryOrderNo 物流单号，支持4PX单号/服务商单号
   */
  async getTracking(
    deliveryOrderNo: string
  ): Promise<FourPXTypes.Get4pxTrackingResponse> {
    return this.post(FourPXMethod.GET_TRACKING, {
      deliveryOrderNo: deliveryOrderNo,
    });
  }
}
