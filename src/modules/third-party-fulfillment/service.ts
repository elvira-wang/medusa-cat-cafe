import type {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  CreateFulfillmentResult,
  CreateShippingOptionDTO,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOption,
  FulfillmentOrderDTO,
  IFulfillmentModuleService,
  Logger,
} from "@medusajs/framework/types";
import { MedusaError } from "@medusajs/framework/utils";
import { AbstractFulfillmentProviderService } from "@medusajs/utils";
import type LogisticsModuleService from "../logistics/service";
import { FourPXDriver } from "./drivers/4px-driver";
import { YuntuDriver } from "./drivers/yuntu-driver";

type InjectedDependencies = {
  logger: Logger;
  logistics: LogisticsModuleService;
  fulfillmentModuleService: IFulfillmentModuleService;
};

type Options = {
  fpxAppKey: string;
  fpxAppSecret: string;
  fpxBaseURL: string;
  yuntuAppId: string;
  yuntuAppSecret: string;
  yuntuSourceKey: string;
  yuntuBaseURL: string;
};

type shippingOptionData = {
  id: string;
  name: string;
  logistics_product_code: string;
  carrier_id: unknown;
};

class ThirdPartyFulfillmentProviderService extends AbstractFulfillmentProviderService {
  static identifier = "fourpx";
  protected logger_: Logger;
  protected options_: Options;
  protected logistics_: LogisticsModuleService;
  protected fulfillmentModuleService_: IFulfillmentModuleService;
  protected fpxDriver: FourPXDriver;
  protected yuntuDriver: YuntuDriver;
  private driverMap: Record<string, FourPXDriver | YuntuDriver>;

  constructor(deps: InjectedDependencies, options: Options) {
    super(...arguments);
    this.logger_ = deps.logger;
    this.options_ = options;
    this.logistics_ = deps.logistics;
    this.fulfillmentModuleService_ = deps.fulfillmentModuleService;
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
    this.driverMap = {
      [FourPXDriver.CARRIER_ID]: this.fpxDriver,
      [YuntuDriver.CARRIER_ID]: this.yuntuDriver,
      // can add more drivers here in the future
    };
  }

  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"], //来自shipping option
    data: CalculateShippingOptionPriceDTO["data"], //本次使用该 shipping method 时的具体上下文。shipping method 从 shipping option 创建，记录具体金额、税、以及发货所需的自定义数据
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    //TODO: implement the logic to calculate shipping price using 4px API
    throw Error();
  }

  /**
   * 判断该配送选项是否支持“Calculated”运费动态计算。
   * 当返回值为 true，选中管理后台 create shipping option > price type > calculated 选项即可生效
   */
  async canCaculate(data: CreateShippingOptionDTO): Promise<boolean> {
    return true;
  }

  async cancelFulfillment(data: Record<string, unknown>): Promise<any> {
    const { external_id } = data as { external_id: string };
  }

  async createReturnFulfillment(
    fulfillment: Record<string, unknown>
  ): Promise<CreateFulfillmentResult> {
    // assuming the client creates a third-party-fulfillment for a return
    // in the third-party service
    throw Error();
  }

  async getFulfillmentDocuments(data: any): Promise<never[]> {
    // assuming the client retrieves documents
    // from a third-party service
    throw Error();
  }

  /**
   * 获取可用的配送选项。
   */
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    const fpxProducts = await this.fpxDriver.listLogisticsProducts();
    const yuntuProducts = await this.yuntuDriver.listLogisticsProducts();
    const products = [...fpxProducts, ...yuntuProducts];

    return products.map((p) => ({
      id: p.logistics_product_id,
      name: p.logistics_product_name,
      logistics_product_code: p.logistics_product_code,
      carrier_id: p.carrier_id,
    }));
  }

  async validateOption(data: shippingOptionData): Promise<boolean> {
    return !(
      !data ||
      !data.id ||
      !data.name ||
      !data.logistics_product_code ||
      !data.carrier_id
    );
  }

  /**
   * @param optionData shipping_option 的 data 字段
   * @param data 将要写入 order_shipping_method 的数据
   * @param context 当前结算购物车的上下文信息
   */
  async validateFulfillmentData(
    optionData: shippingOptionData,
    data: any,
    context: any
  ): Promise<any> {
    const { logistics_product_code, carrier_id } = optionData;
    return { ...data, logistics_product_code, carrier_id };
  }

  /**
   * @param data order_shipping_method 表中的 data 字段。
   * @param items 本次 fulfillment 要发的商品项。
   * @param order 整个订单的上下文信息，包含订单层面的行项目。
   * @param fulfillment 当前要创建的 fulfillment 的上下文信息。
   */
  async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<any> {
    let carrier_id = data.carrier_id; // 当后台手动修改 shipping method 时，data 字段为空，此时无法获取 carrier_id。需要从 fulfillment 的 shipping_option_id 反查 shipping option 获取 carrier_id。
    let logistics_product_code = data.logistics_product_code;
    if (!carrier_id || !logistics_product_code) {
      const res = await this.findCarrierAndProduct(fulfillment);
      carrier_id = res.carrier_id;
      logistics_product_code = res.logistics_product_code;
    }

    const carrierConfig = await this.logistics_.getConfigByCarrierAndProduct(
      carrier_id as string,
      logistics_product_code as string
    );
    const productTypeIds = await this.findProductTypeIds(items, order);
    const customsDeclarationTemplates =
      await this.logistics_.listCustomsDeclaration(productTypeIds);

    const logisticsData = {
      carrierConfig,
      logistics_product_code,
      customsDeclarationTemplates,
    };
    const medusaData = { data, items, order, fulfillment };
    const driver = this.driverMap[carrier_id as string];
    if (!driver) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `No support driver for carrier_id: ${carrier_id}. Please make sure the carrier_id is correct.`
      );
    }
    const response = await driver.createOrder(medusaData, logisticsData);
    return {
      data: {
        ...response,
      },
    };
  }

  async retrieveDocuments(
    fulfillmentData: any,
    documentType: any
  ): Promise<void> {}

  async getReturnDocuments(data: any): Promise<never[]> {
    throw Error();
  }

  async getShipmentDocuments(data: any): Promise<never[]> {
    // assuming the client retrieves documents
    // from a third-party service
    throw Error();
  }

  private async findCarrierAndProduct(
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ) {
    const { shipping_option_id } = fulfillment;
    if (!shipping_option_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Shipping option id is missing in fulfillment data. Please make sure to provide shipping_option_id when creating fulfillment.`
      );
    }
    const shippingOption =
      await this.fulfillmentModuleService_.retrieveShippingOption(
        shipping_option_id
      );
    if (!shippingOption) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Shipping option not found for id: ${shipping_option_id}`
      );
    }
    const shippingOptionData = shippingOption.data;
    if (!shippingOptionData || Object.keys(shippingOptionData).length === 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Shipping option data is empty for id: ${shipping_option_id}`
      );
    }
    const carrier_id = shippingOptionData.carrier_id;
    const logistics_product_code = shippingOptionData.logistics_product_code;
    if (
      carrier_id === null ||
      carrier_id === undefined ||
      logistics_product_code === null ||
      logistics_product_code === undefined
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Carrier ID is missing in shipping option data for id: ${shipping_option_id}. Please make sure the shipping option data has carrier_id.`
      );
    }
    return { carrier_id, logistics_product_code };
  }

  private async findProductTypeIds(
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined
  ) {
    const productTypeIds = new Set<string>();
    if (!order || !order.items) {
      return [];
    }
    const itemTypeMap = new Map<string, string>();
    order.items.forEach((orderItem) => {
      if (orderItem.id && orderItem.product_type_id) {
        itemTypeMap.set(orderItem.id, orderItem.product_type_id);
      } else {
        this.logger_.warn(
          `Order item with id ${orderItem.id} is missing product_type_id. This item will be skipped when finding product types for customs declaration.`
        );
      } // TODO: 是否需要日志记录缺失 product_type_id 的订单项或报错处理
    });
    items.forEach((item) => {
      if (item.line_item_id) {
        const productTypeId = itemTypeMap.get(item.line_item_id);
        if (productTypeId) {
          productTypeIds.add(productTypeId);
        }
      }
    });
    return Array.from(productTypeIds);
  }
}
export default ThirdPartyFulfillmentProviderService;
