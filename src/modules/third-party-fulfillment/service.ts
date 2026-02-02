import {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  CreateFulfillmentResult,
  CreateShippingOptionDTO,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOption,
  FulfillmentOrderDTO,
  Logger,
} from "@medusajs/framework/types";
import { AbstractFulfillmentProviderService } from "@medusajs/utils";
import { FourPXDriver } from "./drivers/4px-driver";
import { YuntuDriver } from "./drivers/yuntu-driver";

type InjectedDependencies = { logger: Logger };

type Options = {
  fpxAppKey: string;
  fpxAppSecret: string;
  fpxBaseURL: string;
  yuntuAppId: string;
  yuntuAppSecret: string;
  yuntuSourceKey: string;
  yuntuBaseURL: string;
};

class FourPXProviderService extends AbstractFulfillmentProviderService {
  static identifier = "fourpx";
  protected logger_: Logger;
  protected options_: Options;
  protected fpxDriver: FourPXDriver;
  protected yuntuDriver: YuntuDriver;

  constructor(
    /* 声明成员 */
    { logger }: InjectedDependencies, // 通过解构拿到局部变量
    options: Options
  ) {
    super();
    this.logger_ = logger;
    this.options_ = options;
    this.fpxDriver = new FourPXDriver({
      fpxAppKey: options.fpxAppKey,
      fpxAppSecret: options.fpxAppSecret,
      fpxBaseURL: options.fpxBaseURL,
    });
    this.yuntuDriver = new YuntuDriver({
      yuntuAppId: options.yuntuAppId,
      yuntuAppSecret: options.yuntuAppSecret,
      yuntuSourceKey: options.yuntuSourceKey,
      yuntuBaseURL: options.yuntuBaseURL,
    });
  }

  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"], //来自shipping option
    data: CalculateShippingOptionPriceDTO["data"], //本次使用该 shipping method 时的具体上下文。shipping method 从 shipping option 创建，记录具体金额、税、以及发货所需的自定义数据
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    //TODO: implement the logic to calculate shipping price using 4px API
  }

  /**
   * 判断该配送选项是否支持“Calculated”价格类型。
   * 当返回值为 true，管理后台 create shipping option > price type > calculated 选项即可生效
   */
  async canCaculate(data: CreateShippingOptionDTO): Promise<boolean> {
    return true;
  }

  async cancelFulfillment(data: Record<string, unknown>): Promise<any> {
    const { external_id } = data as { external_id: string };
  }

  /**
   *
   * @param data order_shipping_method 表中的 data 字段。
   * @param items 本次 third-party-fulfillment 要发的商品项。
   * @param order
   * @param fulfillment
   */
  async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<CreateFulfillmentResult> {
      const
  }

  /* 退货 */
  async createReturnFulfillment(
    fulfillment: Record<string, unknown>
  ): Promise<CreateFulfillmentResult> {
    // assuming the client creates a third-party-fulfillment for a return
    // in the third-party service
  }

  async getFulfillmentDocuments(data: any) {
    // assuming the client retrieves documents
    // from a third-party service
  }

  /**
   * 获取可用的配送选项。
   * 当前返回值固定为“联邮通标准挂号-普货”。
   */
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    const fpxProducts = await this.fpxDriver.listLogisticsProducts();
    /* 云途 物流产品列表 */
    const yuntuProducts = await this.yuntuDriver.listLogisticsProducts();

    const products = [...fpxProducts, ...yuntuProducts];

    return products.map((p) => ({
      id: p.logistics_product_code,
      name: p.logistics_product_name,
      logistics_product_code: p.logistics_product_code,
      // can add other relevant data for the provider to later process the shipping option.
    }));
  }

  async getReturnDocuments(data: any) {}

  async getShipmentDocuments(data: any) {
    // assuming the client retrieves documents
    // from a third-party service
  }

  async retrieveDocuments(
    fulfillmentData: any,
    documentType: any
  ): Promise<void> {
    // assuming the client retrieves documents
    // from a third-party service
  }

  async validateFulfillmentData(
    optionData: any,
    data: any,
    context: any
  ): Promise<any> {
    // assuming your client retrieves an ID from the
    // third-party service
  }

  async validateOption(data: any): Promise<boolean> {
    return data.external_id !== undefined;
  }
}

export default FourPXProviderService;
