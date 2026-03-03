import type { Logger } from "@medusajs/framework/types";
import { MedusaError } from "@medusajs/framework/utils";
import { MedusaService } from "@medusajs/utils";
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

  constructor(logger: Logger, options: Options) {
    super(...arguments);
    this.logger_ = logger;
    this.options_ = options;
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

  async listCustomsDeclaration(productTypeIds: string[]) {
    return await this.listCustomsDeclarations({
      product_type_id: productTypeIds,
    });
  }

  async getTrackingInfo(trackingNumber: string, carrierId: string) {}
}

export default LogisticsModuleService;
