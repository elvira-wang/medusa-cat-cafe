import { YuntuClient } from "../clients/yuntu-client";
import { DeclarationInfo } from "../types/yuntu-types";
import type {
  BaseDriver,
  CreateOrderData,
  ListProductsResponse,
} from "./base-driver";

type Options = {
  yuntuAppId: string;
  yuntuAppSecret: string;
  yuntuSourceKey: string;
  yuntuBaseURL: string;
};

export class YuntuDriver implements BaseDriver {
  static CARRIER_ID = "yuntu";
  static CARRIER_NAME = "云途";
  protected options_: Options;
  protected client: YuntuClient;

  constructor(options: Options) {
    this.options_ = options;
    this.client = new YuntuClient({
      appId: options.yuntuAppId,
      appSecret: options.yuntuAppSecret,
      sourceKey: options.yuntuSourceKey,
      baseURL: options.yuntuBaseURL,
    });
  }

  async createOrder(
    medusaData: CreateOrderData,
    logisticsData: any
  ): Promise<any> {
    const { data, items, order, fulfillment } = medusaData;
    const {
      carrierConfig,
      logistics_product_code,
      customsDeclarationTemplates,
    } = logisticsData;
    const receiver = {};
    const packages = {};
    const declarationInfo = {};
    const payload = {
      product_code: logistics_product_code,
    };
  }

  async getOrder(data: any): Promise<any> {}

  async cancelOrder(data: any): Promise<any> {}

  async holdOrder(data: any): Promise<any> {}

  async getLabel(data: any): Promise<any> {}

  async listLabels(data: any): Promise<any> {}

  async listLogisticsProducts(data?: any): Promise<ListProductsResponse> {
    const res = await this.client.listLogisticsProducts();
    const carrierId = YuntuDriver.CARRIER_ID;
    const carrierName = YuntuDriver.CARRIER_NAME;
    return res.map((product) => ({
      logistics_product_id: `${carrierId}_${product.product_code}`,
      logistics_product_code: product.product_code,
      logistics_product_name: `${carrierName}-${product.product_name}`,
      carrier_id: carrierId,
    }));
  }

  async getEstimatedCost(data: any): Promise<any> {}

  async getTracking(data: any): Promise<any> {}
}
