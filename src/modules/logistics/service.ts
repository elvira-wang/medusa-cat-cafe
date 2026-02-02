import { MedusaService } from "@medusajs/utils";
import CarrierConfig from "./models/carrier-config";
import CustomsDeclaration from "./models/customs-declaration";

class LogisticsModuleService extends MedusaService({
  CarrierConfig,
  CustomsDeclaration,
}) {}

export default LogisticsModuleService;
