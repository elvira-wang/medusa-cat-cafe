import { YuntuClient } from "../clients/yuntu-client";
import { BaseDriver, ListProductsResponse } from "./base-driver";

type Options = {
  yuntuAppId: string;
  yuntuAppSecret: string;
  yuntuSourceKey: string;
  yuntuBaseURL: string;
};

export class YuntuDriver implements BaseDriver {
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

  async createOrder(data: any): Promise<any> {}

  async getOrder(data: any): Promise<any> {}

  async cancelOrder(data: any): Promise<any> {}

  async holdOrder(data: any): Promise<any> {}

  async getLabel(data: any): Promise<any> {}

  async listLabels(data: any): Promise<any> {}

  async listLogisticsProducts(data?: any): Promise<ListProductsResponse> {
    const res = await this.client.listLogisticsProducts();
    return res.map((product: any) => ({
      logistics_product_id: `yuntu_${product.code}`,
      logistics_product_code: product.code,
      logistics_product_name: `云途-${product.name}`,
    }));
  }

  async getEstimatedCost(data: any): Promise<any> {}

  async getTracking(data: any): Promise<any> {}
}
