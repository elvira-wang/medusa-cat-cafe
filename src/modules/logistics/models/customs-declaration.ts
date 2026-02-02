import { model } from "@medusajs/framework/utils";

const CustomsDeclaration = model.define("customs_declaration", {
  id: model.id().primaryKey(),
  name_en: model.text(), // 英文报关名
  name_cn: model.text(), // 中文报关名
  unit_price: model.bigNumber(), // 申报单价/美元
  unit_weight: model.number(), // 申报单重/克
  quantity: model.bigNumber(), // 数量
  currency: model.text().default("USD"), // 币种
});

export default CustomsDeclaration;
