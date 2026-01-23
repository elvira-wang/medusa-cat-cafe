/*
 * 4px client
 * 实现 MD5 签名加密算法
 * 公共参数统一请求封装
 * 业务错误代码统一处理
 * 定义具体业务接口和对应方法
 */

import axios, {AxiosInstance} from "axios";
import crypto from "crypto";
import {MedusaError} from "@medusajs/framework/utils";
import {FourPXTypes} from "./types";

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
            baseURL: options.baseURL || "https://open.4px.com/v2/api/service",
        })

        /* Error handling logic can be further improved if necessary */
        this.axiosInstance.interceptors.response.use((response) => {
            const resData = response.data as FourPXResponse;
            if (resData.result === "0" || resData.errors && resData.errors.length > 0) {
                const errorMessage = resData.errors?.[0]?.error_msg;
                throw new MedusaError(MedusaError.Types.INVALID_DATA, `4PX API Error:${errorMessage}`)
            }
            return response;
        })
    }

    private generateSignature(method: string, timestamp: string, body: string, version: string, format: string): string {
        const rawString = `app_key${this.appKey}format${format}method${method}timestamp${timestamp}v${version}${body}${this.appSecret}`;
        return crypto.createHash("md5").update(rawString).digest("hex");
    }

    private async request<T>(method: string, data: any): Promise<T> {
        const version = this.DEFAULT_VERSION;
        const format = this.DEFAULT_FORMAT;
        const timestamp = Date.now().toString();
        const bodyStr = JSON.stringify(data);
        const sign = this.generateSignature(method, timestamp, bodyStr, version, format);
        const res = await this.axiosInstance.post("", data, {
            params: {
                method: method,
                app_key: this.appKey,
                v: version,
                timestamp: timestamp,
                format: format,
                sign: sign,
            },
        });
        return res.data.data;
    }

    async createOrder(payload: FourPXTypes.Create4pxOrderRequest): Promise<FourPXTypes.Create4pxOrderResponse> {
        return this.request(FourPXMethod.CREATE_ORDER, payload)
    }

    async getOrder(payload: FourPXTypes.Get4pxOrderRequest): Promise<FourPXTypes.Get4pxOrderResponse> {
        return this.request(FourPXMethod.GET_ORDER, payload)
    }

    async cancelOrder(payload: FourPXTypes.Cancel4pxOrderRequest) {
        return this.request(FourPXMethod.CANCEL_ORDER, payload)
    }

    async holdOrder(payload: FourPXTypes.Hold4pxOrderRequest) {
        return this.request(FourPXMethod.HOLD_ORDER, payload)
    }

    async getLabel(payload: FourPXTypes.GetLabelRequest): Promise<FourPXTypes.GetLabelResponse> {
        return this.request(FourPXMethod.GET_LABEL, payload)
    }

    async listLabels(payload: FourPXTypes.GetLabelListRequest): Promise<string> {
        return this.request(FourPXMethod.GET_LABEL_LIST, payload)
    }

    async listLogisticsProducts() {
    }

    /**
     * 仅支持生产环境调用此接口。
     * @param payload 其中 request_no 请求单号字段支持4PX单号、面单号、客户单号；若填写了请求单号，则其余请求字段将不会生效
     */
    async getEstimatedCost(payload: FourPXTypes.GetEstimatedCostRequest): Promise<FourPXTypes.GetEstimatedCostResponse> {
        return this.request(FourPXMethod.GET_ESTIMATED_COST, payload)
    }

    /**
     * 仅支持生产环境调用此接口。
     * @param deliveryOrderNo 物流单号，支持4PX单号/服务商单号
     */
    async getTracking(deliveryOrderNo: string): Promise<FourPXTypes.GetTrackingResponse> {
        return this.request(FourPXMethod.GET_TRACKING, deliveryOrderNo)
    }


}