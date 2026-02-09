import { Logger } from "@medusajs/framework/types";
import { MedusaError } from "@medusajs/framework/utils";
import { DAL } from "@medusajs/types";
import { MedusaService } from "@medusajs/utils";
import { FourPXDriver } from "../third-party-fulfillment/drivers/4px-driver";
import { YuntuDriver } from "../third-party-fulfillment/drivers/yuntu-driver";
import CarrierConfig from "./models/carrier-config";
import CustomsDeclaration from "./models/customs-declaration";

// type InjectedDependencies = {
//   logger: Logger;
//   // baseRepository: DAL.RepositoryService;
// };

type Options = {
  fpxAppKey: string;
  fpxAppSecret: string;
  fpxBaseURL: string;
  yuntuAppId: string;
  yuntuAppSecret: string;
  yuntuSourceKey: string;
  yuntuBaseURL: string;
};

class LogisticsModuleService extends MedusaService({
  CarrierConfig,
  CustomsDeclaration,
}) {
  protected logger_: Logger;
  protected options_: Options;
  protected fpxDriver: FourPXDriver;
  protected yuntuDriver: YuntuDriver;
  private driverMap: Record<string, FourPXDriver | YuntuDriver>;

  constructor(logger: Logger, options: Options) {
    super(...arguments);
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
    this.driverMap = {
      [FourPXDriver.CARRIER_ID]: this.fpxDriver,
      [YuntuDriver.CARRIER_ID]: this.yuntuDriver,
      // can add more drivers here in the future
    };
  }

  async getConfigByCarrierAndProduct(carrierId: string, productCode: string) {
    const configs = await this.listCarrierConfigs({
      carrier_id: carrierId,
      logistics_product_code: productCode,
    });
    if (!configs.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `No carrier config found for carrier ${carrierId} and product ${productCode}.Please make sure you have set up the carrier config correctly.`
      );
    }
    return configs[0]; // Only one config per carrier and product
  }

  async listLogisticsProductsByCarrier(carrierId: string) {
    const driver = this.driverMap[carrierId];
    if (!driver) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `No driver found for carrier ${carrierId}. Please make sure the carrier is supported.`
      );
    }
    return await driver.listLogisticsProducts();
  }

  async getTrackingInfo(trackingNumber: string, carrierId: string) {}
}

export default LogisticsModuleService;
