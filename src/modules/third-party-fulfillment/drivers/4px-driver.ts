import { FourPXClient } from "../clients/4px-client";
import type {
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
  static CARRIER_ID = "fourpx";
  static CARRIER_NAME = "递四方";
  protected options_: Options;
  protected client: FourPXClient;

  constructor(options: Options) {
    this.client = new FourPXClient({
      appKey: options.fpxAppKey,
      appSecret: options.fpxAppSecret,
      baseURL: options.fpxBaseURL,
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

    const logisticsServiceInfo = {
      logistics_product_code: logistics_product_code,
    };
    const returnInfo = {
      is_return_on_domestic: carrierConfig.detail?.is_return_on_domestic,
      is_return_on_oversea: carrierConfig.detail?.is_return_on_oversea,
    };
    /**
     * 拼装 declare_product_info 数组
     */
    const declareProductInfo = items.reduce((acc, item) => {
      const orderItem = order?.items?.find((i) => i.id === item.line_item_id);
      if (!orderItem) {
        return acc;
      }
      const match = customsDeclarationTemplates.find(
        (c) => c.product_type_id === orderItem.product_type_id
      );
      if (!match) {
        return acc;
      } // TODO: 是否需要日志记录未匹配上的商品类型以便后续补充完善报关模板
      acc.push({
        declare_product_name_cn: match.name_cn,
        declare_product_name_en: match.name_en,
        unit_net_weight: match.unit_weight,
        declare_product_code_qty: item.quantity,
        declare_unit_price_export: match.unit_price,
        currency_export: match.currency,
        declare_unit_price_import: match.unit_price,
        currency_import: match.currency,
        brand_export: "none",
        brand_import: "none",
      });
      return acc;
    }, [] as any);
    /**
     * 拼装 parcel_list 数组
     */
    const totals = declareProductInfo.reduce(
      (acc, item) => {
        acc.totalWeight +=
          (item.unit_net_weight || 0) * (item.declare_product_code_qty || 0);
        acc.totalValue +=
          (item.declare_unit_price_export || 0) *
          (item.declare_product_code_qty || 0);
        return acc;
      },
      { totalWeight: 0, totalValue: 0 }
    );
    const parcelList = [
      {
        weight: totals.totalWeight,
        parcel_value: Math.round(totals.totalValue * 100) / 100, // 四舍五入保留两位小数
        currency: declareProductInfo[0]?.currency_export || "USD",
        include_battery: carrierConfig.detail?.include_battery || "N",
        declare_product_info: declareProductInfo,
      },
    ];
    /**
     * insurance info 为必填，目前默认不投保，故此处留空
     */
    const insuranceInfo = {};
    /**
     * 拼装 sender 对象
     */
    const sender = {
      first_name: carrierConfig.sender_en.first_name,
      last_name: carrierConfig.sender_en.last_name,
      company: carrierConfig.sender_en.company,
      phone: carrierConfig.sender_en.phone,
      email: carrierConfig.sender_en.email,
      post_code: carrierConfig.sender_en.postal_code,
      country: carrierConfig.sender_en.country_code,
      state: carrierConfig.sender_en.province,
      city: carrierConfig.sender_en.city,
    };
    /**
     * 拼接 recipient_info 对象
     */
    const recipientInfo = {
      first_name: order?.shipping_address?.first_name || "",
      last_name: order?.shipping_address?.last_name || "",
      phone: order?.shipping_address?.phone || "",
      post_code: order?.shipping_address?.postal_code,
      country: order?.shipping_address?.country_code || "",
      state: order?.shipping_address?.province,
      city: order?.shipping_address?.city || "",
      district: order?.shipping_address?.address_2,
      street: order?.shipping_address?.address_1 || "",
    };
    const deliverTypeInfo = {
      deliver_type: carrierConfig.detail?.deliver_type,
      //TODO: 检查是否选项会影响其他字段的必填性
    };
    const deliverToRecipientInfo = {
      deliver_type: "HOME_DELIVERY",
    };
    const refNo = `MEDUSA-${order.display_id}`;
    const payload = {
      ref_no: refNo,
      business_type: "BDS",
      duty_type: carrierConfig.detail?.duty_type,
      is_insure: carrierConfig.detail?.is_insure, //当前默认不投保
      vat_no: carrierConfig.vat_no,
      eori_no: carrierConfig.eori_no,
      logistics_service_info: logisticsServiceInfo,
      return_info: returnInfo,
      parcel_list: parcelList,
      insurance_info: insuranceInfo,
      sender: sender,
      recipient_info: recipientInfo,
      deliver_type_info: deliverTypeInfo,
      deliver_to_recipient_info: deliverToRecipientInfo,
    };

    return await this.client.createOrder(payload);
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
    const logistics_product_id = `${carrierId}_$logistics_product_code`;
    const logistics_product_name = `$carrierName-联邮通标准挂号-普货`;
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
