import ProductModule from "@medusajs/medusa/product";
import { defineLink } from "@medusajs/utils";
import LogisticsModule from "../modules/logistics";

export default defineLink(
  {
    linkable: LogisticsModule.linkable.customsDeclaration,
    filed: "product_type_id",
  },
  ProductModule.linkable.productType,
  { readOnly: true }
);
