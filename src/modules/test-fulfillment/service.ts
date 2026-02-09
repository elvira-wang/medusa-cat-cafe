import type {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  CreateShippingOptionDTO,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOption,
  FulfillmentOrderDTO,
  Logger,
} from "@medusajs/framework/types";
import { AbstractFulfillmentProviderService } from "@medusajs/utils";

type InjectedDependencies = { logger: Logger };

class TestFulfillmentProviderService extends AbstractFulfillmentProviderService {
  static identifier = "test-fulfillment";
  protected logger_: Logger;

  constructor(
    { logger }: InjectedDependencies,
    options: Record<string, unknown>
  ) {
    super(...arguments);
    this.logger_ = logger;
  }

  async canCalculate(data: CreateShippingOptionDTO): Promise<boolean> {
    // assuming you have a client
    return true;
  }

  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"],
    data: CalculateShippingOptionPriceDTO["data"],
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    // For testing purposes, return a fixed price
    return { calculated_amount: 999, is_calculated_price_tax_inclusive: true };
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      {
        id: "gabriel-paradise-line",
        name: "Gabriel Paradise Line",
        logistics_product_code: "WILL_BE_FINE",
        carrier_id: "Gabriel",
      },
      {
        id: "lucifer-hell-line",
        name: "Lucifer Hell Line",
        logistics_product_code: "GO_TO_HELL",
        carrier_id: "Lucifer",
      },
    ];
  }

  /**
   * @param optionData shipping_option 的 data 字段
   * @param data 将要写入 order_shipping_method 的数据
   * @param context 当前结算购物车的上下文信息
   */
  async validateFulfillmentData(
    optionData: any,
    data: any,
    context: any
  ): Promise<any> {
    this.logger_.info(
      `Validating fulfillment data with optionData: ${JSON.stringify(optionData)}`
    );
    const { logistics_product_code, carrier_id } = optionData;
    return { ...data, logistics_product_code, carrier_id };
  }

  async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<any> {
    this.logger_.info(
      `Creating fulfillment with method data: ${JSON.stringify(data)}`
    );
    this.logger_.info(`本次发货的商品项: ${JSON.stringify(items)}`);
    this.logger_.info(`本次发货上下文： ${JSON.stringify(fulfillment)}`);
    const { carrier_id } = data;
    const itemsList = items.map((item) => item.sku).join(", ");
    if (!carrier_id) {
      const { shipping_option_id } = fulfillment;
      throw new Error("Carrier ID is required");
    }

    // Simulate fulfillment creation
    if (carrier_id === "Gabriel") {
      this.logger_.info(
        `🎉 Fulfillment created with Gabriel's Paradise Line. items:${itemsList}`
      );
    } else if (carrier_id === "Lucifer") {
      this.logger_.info(
        `🎉 Fulfillment created with Lucifer's Hell Line. Items:${itemsList}`
      );
    } else {
      this.logger_.warn(
        `Unknown carrier_id: ${carrier_id}. Proceeding with default handling.`
      );
    }
    return {
      data: {
        data,
      },
    };
  }

  async cancelFulfillment(): Promise<any> {
    return {};
  }

  async createReturnFulfillment(): Promise<any> {
    return {};
  }

  async getFulfillmentDocuments(data: any): Promise<never[]> {
    return [];
  }

  async getShipmentDocuments(data: any): Promise<never[]> {
    return [];
  }

  async retrieveDocuments(
    fulfillmentData: any,
    documentType: any
  ): Promise<void> {
    return;
  }

  async validateOption(data: any): Promise<boolean> {
    return true;
  }
}

export default TestFulfillmentProviderService;
