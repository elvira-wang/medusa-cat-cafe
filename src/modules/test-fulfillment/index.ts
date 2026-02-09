import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import TestFulfillmentProviderService from "./service";

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [TestFulfillmentProviderService],
});
