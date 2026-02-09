import { FourPXClient } from "../clients/4px-client";
import {
  BaseDriver,
  CreateOrderData,
  ListProductsResponse,
} from "./base-driver";

type Options = {
  fpxAppKey: string;
  fpxAppSecret: string;
  fpxBaseURL: string;
};

export class FourPXDriver implements BaseDriver {
  protected options_: Options;
  protected client: FourPXClient;
  static CARRIER_ID = "fourpx";
  static CARRIER_NAME = "递四方";

  constructor(options: Options) {
    this.options_ = options;
    this.client = new FourPXClient({
      appKey: options.fpxAppKey,
      appSecret: options.fpxAppSecret,
      baseURL: options.fpxBaseURL,
    });
  }

  async createOrder(medusaData: CreateOrderData): Promise<any> {
    const { data, items, order, fulfillment } = medusaData;
    const orderIdwithoutPrefix = order?.id?.toString().replace("order_", "");
    const payload = {
      ref_no: orderIdwithoutPrefix,
      business_type: "BDS",
    };
  }

  async getOrder(data: any): Promise<any> {}

  async cancelOrder(data: any): Promise<any> {}

  async holdOrder(data: any): Promise<any> {}

  async getLabel(data: any): Promise<any> {}

  async listLabels(data: any): Promise<any> {}

  async listLogisticsProducts(data?: any): Promise<ListProductsResponse> {
    const carrierId = FourPXDriver.CARRIER_ID;
    const carrierName = FourPXDriver.CARRIER_NAME;
    /* 4px 物流产品列表接口不可用，故此处返回固定值。*/
    const logistics_product_code = "QC";
    const logistics_product_id = `${carrierId}_${logistics_product_code}`;
    const logistics_product_name = `${carrierName}-联邮通标准挂号-普货`;
    return [
      {
        logistics_product_id,
        logistics_product_code,
        logistics_product_name,
        carrier_id: carrierId,
      },
    ];
  }

  async getEstimatedCost(data: any): Promise<any> {}

  async getTracking(data: any): Promise<any> {}
}
