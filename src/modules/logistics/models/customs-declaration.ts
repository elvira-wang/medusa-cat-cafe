import { model } from "@medusajs/framework/utils";

const CustomsDeclaration = model.define("customs_declaration", {
  id: model.id().primaryKey(),
  product_type_id: model.text().unique().index(), // 商品类型id，使用商品类型对应报关模板
  name_en: model.text(), // 英文报关名
  name_cn: model.text(), // 中文报关名
  unit_price: model.bigNumber(), // 申报单价/美元
  unit_weight: model.number(), // 申报单重/克
  currency: model.text().default("USD"), // 币种
});

export default CustomsDeclaration;
