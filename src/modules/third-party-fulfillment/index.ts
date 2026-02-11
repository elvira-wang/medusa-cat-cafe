import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import ThirdPartyFulfillmentProviderService from "./service";

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [ThirdPartyFulfillmentProviderService],
});
