import { model } from "@medusajs/framework/utils";

const CarrierConfig = model
  .define("carrier_config", {
    id: model.id().primaryKey(),
    /**
     * 物流商 ID
     */
    carrier_id: model.text().index(),
    /**
     * 物流商产品代码
     */
    logistics_product_code: model.text().index(),
    /**
     * 用于欧盟 VAT
     */
    vat_no: model.text().nullable(),
    eori_no: model.text().nullable(),
    ioss_no: model.text().nullable(),
    /**
     * 用于美国 VAT
     */
    mid: model.text().nullable(),
    /**
     * 寄件人信息 - 中英文版本
     */
    sender_cn: model.json(),
    sender_en: model.json(),
    /**
     * 不同物流商个性化配置
     */
    detail: model.json(),
  })
  .indexes([{ on: ["carrier_id", "logistics_product_code"], unique: true }]);

export default CarrierConfig;
