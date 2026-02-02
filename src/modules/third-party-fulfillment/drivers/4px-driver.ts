import { FourPXClient } from "../clients/4px-client";
import { BaseDriver, ListProductsResponse } from "./base-driver";

type Options = {
  fpxAppKey: string;
  fpxAppSecret: string;
  fpxBaseURL: string;
};

export class FourPXDriver implements BaseDriver {
  protected options_: Options;
  protected client: FourPXClient;

  constructor(options: Options) {
    this.options_ = options;
    this.client = new FourPXClient({
      appKey: options.fpxAppKey,
      appSecret: options.fpxAppSecret,
      baseURL: options.fpxBaseURL,
    });
  }

  async createOrder(data: any): Promise<any> {}

  async getOrder(data: any): Promise<any> {}

  async cancelOrder(data: any): Promise<any> {}

  async holdOrder(data: any): Promise<any> {}

  async getLabel(data: any): Promise<any> {}

  async listLabels(data: any): Promise<any> {}

  async listLogisticsProducts(data?: any): Promise<ListProductsResponse> {
    /* 4px 物流产品列表接口不可用，故此处返回固定值。*/
    const logistics_product_id = "4px_QC";
    const logistics_product_code = "QC";
    const logistics_product_name = "4px-联邮通标准挂号-普货";
    return [
      {
        logistics_product_id,
        logistics_product_code,
        logistics_product_name,
      },
    ];
  }

  async getEstimatedCost(data: any): Promise<any> {}

  async getTracking(data: any): Promise<any> {}
}
