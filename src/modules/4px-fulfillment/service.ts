import {AbstractFulfillmentProviderService} from "@medusajs/utils";
import {
    CalculatedShippingOptionPrice,
    CalculateShippingOptionPriceDTO, CreateFulfillmentResult,
    CreateShippingOptionDTO, FulfillmentDTO, FulfillmentItemDTO,
    FulfillmentOption, FulfillmentOrderDTO,
    Logger
} from "@medusajs/framework/types";
import {FourPXClient} from "./client";

type InjectedDependencies = { logger: Logger };

type Options = {
    appKey: string;
    appSecret: string;
    baseURL: string;
};

class FourPXProviderService extends AbstractFulfillmentProviderService {
    static identifier = "fourpx";
    protected logger_: Logger;
    protected options_: Options;
    protected client: FourPXClient;

    constructor(
        /* 声明成员 */
        {logger}: InjectedDependencies, // 通过解构拿到局部变量
        options: Options,
    ) {
        super();
        this.logger_ = logger;
        this.options_ = options;
        this.client = new FourPXClient({
            appKey: options.appKey,
            appSecret: options.appSecret,
            baseURL: options.baseURL,
        })

    }

    async calculatePrice(
        optionData: CalculateShippingOptionPriceDTO ["optionData"],//来自shipping option
        data: CalculateShippingOptionPriceDTO ["data"], //本次使用该 shipping method 时的具体上下文。shipping method 从 shipping option 创建，记录具体金额、税、以及发货所需的自定义数据
        context: CalculateShippingOptionPriceDTO ["context"]
    ): Promise<CalculatedShippingOptionPrice> {
        //TODO: implement the logic to calculate shipping price using 4px API
        const price = await this.client.getEstimatedCost()
        return {calculated_amount: price, is_calculated_price_tax_inclusive: false}
    }

    /**
     * 此方法始终返回 true ，因为当前使用的 4px 物流产品均支持运费计算。
     * 当返回值为 true，管理后台 create shipping option > price type > calculated 选项即可生效
     */
    async canCaculate(data: CreateShippingOptionDTO): Promise<boolean> {
        return true
    }

    async cancelFulfillment(data: Record<string, unknown>): Promise<any> {
        const {external_id} = data as { external_id: string };
        await this.client.cancel(external_id);
    }

    /**
     *
     * @param data order_shipping_method 表中的 data 字段。
     * @param items 本次 fulfillment 要发的商品项，
     * @param order
     * @param fulfillment
     */
    async createFulfillment(
        data: Record<string, unknown>,
        items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
        order: Partial<FulfillmentOrderDTO> | undefined,
        fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
    ): Promise<CreateFulfillmentResult> {
        const externalData = await this.client.create(
            fulfillment,
            items)

        return {
            data: {
                ...(fulfillment.data as object || {}),
                ...externalData
            }
        }
    }

    /* 退货 */
    async createReturnFulfillment(fulfillment: Record<string, unknown>): Promise<CreateFulfillmentResult> {
        // assuming the client creates a fulfillment for a return
        // in the third-party service
        const externalData = await this.client.createReturn(
            fulfillment
        )

        return {
            data: {
                ...(fulfillment.data as object || {}),
                ...externalData
            }
        }
    }

    async getFulfillmentDocuments(data: any): Promise<never[]> {
        // assuming the client retrieves documents
        // from a third-party service
        return await this.client.documents(data)
    }

    /* 获取可用的配送选项 */
    async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
        // assuming you have a client
        const services = await this.client.getServices()

        return services.map((service) => ({
            id: service.service_id,
            name: service.name,
            service_code: service.code,
            // can add other relevant data for the provider to later process the shipping option.
        }))
    }

    async getReturnDocuments(data: any): Promise<never[]> {
        // assuming the client retrieves documents
        // from a third-party service
        return await this.client.documents(data)
    }

    async getShipmentDocuments(data: any): Promise<never[]> {
        // assuming the client retrieves documents
        // from a third-party service
        return await this.client.documents(data)
    }

    async retrieveDocuments(
        fulfillmentData: any,
        documentType: any
    ): Promise<void> {
        // assuming the client retrieves documents
        // from a third-party service
        return await this.client.documents(
            fulfillmentData,
            documentType
        )
    }

    async validateFulfillmentData(
        optionData: any,
        data: any,
        context: any
    ): Promise<any> {
        // assuming your client retrieves an ID from the
        // third-party service
        const externalId = await this.client.getId()

        return {
            ...data,
            externalId
        }
    }

    async validateOption(data: any): Promise<boolean> {
        return data.external_id !== undefined
    }

}

export default FourPXProviderService;