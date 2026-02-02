/* 订单创建-请求参数 */
export interface CreateYuntuOrderRequest {
  product_code: string;
  receiver: Receiver;
  packages: Package[];
  declaration_info: DeclarationInfo[];
  customer_order_number?: string; // 客户唯一订单号,最大长度50
  extra_services?: ExtraService[];
  order_numbers?: OrderNumbers;
  sender?: Sender;
  customs_number?: CustomsNumber; // 清关税号
  weight_unit?: "KG" | "G" | "LBS"; // 包裹重量单位 默认KG(KG、G)
  size_unit?: "CM" | "INCH"; // 包裹尺寸单位 默认CM(CM|INCH)
  dangerous_goods_type?: string;
  platform_account_code?: string;
  source_code?: string;
  sensitive_type?: string; // 特殊货品类型 1枚举: W 包裹,D 文件,F 分单,L 信封
  label_type?: string; // 期望的标签类型
  point_relais_num?: string; // 自提点编码
}

export interface OrderNumbers {
  waybill_number?: string;
  platform_order_number?: string;
  tracking_number?: string;
  reference_numbers?: string[];
}

export interface Package {
  length?: number;
  width?: number;
  height?: number;
  weight: number;
}

export interface Receiver {
  first_name: string;
  last_name?: string;
  company?: string;
  country_code: string;
  province: string;
  city: string;
  address_lines: string[]; // 1-3行地址
  postal_code: string;
  phone_number: string;
  email?: string;
  certificate_type?: string;
  certificate_code?: string;
  short_address?: string; // 最大长度200,沙特国家最大长度为8，并且必填
}

export interface DeclarationInfo {
  quantity: number; // 申报数量
  unit_price: number; // 申报价格(FOB价),用于目的国进口清关
  unit_weight: number; // 申报单重
  name_local?: string; // 申报信息名称(进口）
  name_en: string; // 申报信息名称(出口)
  sku_code?: string; // 存在多个包裹信息时，该字段必填
  hs_code?: string; // 海关编码
  sales_url?: string; // 销售链接
  currency?: string; // 申报币种,默认USD
  material?: string; // 材质
  purpose?: string; // 用途
  brand?: string; // 品牌
  spec?: string; // 规格
  model?: string; // 型号
  remark?: string; // 备注
}

export interface Sender {
  first_name: string;
  last_name?: string;
  company?: string;
  country_code: string;
  province: string;
  city: string;
  address_lines: string[];
  postal_code: string;
  phone_number: string;
  email?: string;
  certificate_type?: string;
  certificate_code?: string;
  usci_code?: string; // 统一社会信用代码
}

export interface CustomsNumber {
  tax_number?: string;
  ioss_code?: string;
  vat_code?: string;
  eori_number?: string;
}

export interface ExtraService {
  extra_code: string;
  extra_value?: string;
  extra_cost?: number;
}

/* 订单创建-响应参数 */
export interface CreateYuntuOrderResponse {
  customer_order_number: string; // 客户单号
  track_type: "Y" | "N" | "W"; // 跟踪号分配类型。枚举: Y,N,W 枚举备注: Y-已产生跟踪号，W-等待后续更新跟踪号,N-不需要跟踪号
  waybill_number: string; // 运单号
  tracking_number?: string; // 跟踪号
  bar_codes?: string; // 标签条码号集合
  remote_area?: "Y" | "N"; // 偏远区标识。枚举: Y,N 枚举备注: Y-偏远地址,N-非偏远地址
}

/* 查询订单详情-响应参数 */
export interface GetYuntuOrderResponse {
  waybill_number?: string;
  customer_order_number?: string;
  product_code?: string;
  tracking_number?: string;
  platform_account_code?: string;
  packages: Package[];
  pieces?: number; // 包裹件数
  weight_unit?: string; // 包裹重量单位 （只返回KG）
  size_unit?: string; // 包裹尺寸单位 （只返回CM）
  status?: string;
  sensitive_type?: number;
  source_code?: string;
  chargeWeight?: number;
  receiver: Partial<Receiver>;
  sender: Partial<Sender>;
  declaration_info: Partial<DeclarationInfoWithExtra>[];
}
export interface DeclarationInfoWithExtra extends DeclarationInfo {
  attachment?: string; // sku附件
}

/* 拦截订单-请求参数 */
export interface HoldYuntuOrderRequest {
  waybill_number: string;
  remark: string;
}

/* 获取标签-响应参数 */
export interface GetYuntuLabelResponse {
  order_number?: string; // 客户输入的查询号（与入参保持一致）
  url?: string; // 标签下载地址
  label_type?: string;
  label_string?: string;
}

/* 获取物流产品列表-响应参数 */
export type ListYuntuProductsResponse = YuntuProductList[];

export interface YuntuProductList {
  product_code: string;
  product_name: string;
}

/* 运费试算-请求参数 */
export interface GetYuntuEstimatedCostRequest {
  country_code: string;
  weight: number;
  weight_unit?: "KG" | "G" | "LBS"; // 包裹重量单位 默认KG
  package_type?: "C" | "E" | "F"; // 包裹类型枚举：C:普货 E:带电 F:特货
  postal_code?: string;
  product_group_code?: string;
  pieces?: number;
  length?: number;
  width?: number;
  height?: number;
  size_unit?: "CM" | "INCH"; // 包裹尺寸单位 默认CM
  origin?: string; // 计费地点(云途默认:YT-SZ ）
}

export type GetYuntuEstimatedCostResponse = GetYuntuEstimatedCostItem[];

export interface GetYuntuEstimatedCostItem {
  product_code: string;
  product_name: string;
  fee_name: string;
  calculate_amount: number; // 试算金额
  currency: string;
  interval_day: string; // 派送时效
  price_name: string;
  price_type: string;
  convert_currency: string;
  rate: number;
  convert_amount: number;
}

export type GetYuntuTrackingResponse = GetYuntuTrackingResponseItem[];

export interface GetYuntuTrackingResponseItem {
  order_number: string;
  package_status: string; // 包裹状态 N: 未找到订单, F: 电子预报信息接收, T: 运输中, D: 成功投递, E: 可能异常, R: 包裹退回, C: 订单取消
  track_Info?: TrackInfo;
}

export interface TrackInfo {
  waybill_number: string;
  tracking_number?: string; // 末端服务商单号(跟踪号)
  customer_order_number?: string;
  product_code: string; // 物流产品编码
  product_name?: string;
  channel_code: string; // 服务渠道编码
  check_in_time?: string; // 签入时间，格式： yyyy-MM-dd'T'HH:mm:ss.SSS'Z'， 示例： 2022-11-01T11:33:26.562Z
  check_out_time?: string; // 签出时间
  pick_up_time?: string; // 揽收时间
  customer_code?: string;
  origin_code?: string;
  destination_code?: string;
  postal_code?: string;
  actual_weight?: number;
  interval_day?: number; // 妥投时效（非工作日天数）
  interval_work_day?: number; // 妥投时效（工作日天数）
  last_mile_site?: string; // 末端服务商网站
  last_mile_name?: string; // 末端服务商名称
  phone_number: string; // 末端服务商联系电话
  track_events?: TrackEvent[];
  pod_url: string;
  pod_urls: any[];
  IsSignature: boolean;
  SignatureUrls: any[];
}

export interface TrackEvent {
  process_time?: string; // 轨迹发生时间，格式：yyyy-MM-dd'T'HH:mm:ss.SSS'Z'， 示例：2022-11-01T11:33:26.562Z
  process_utc_time?: string; // 轨迹发生utc时间
  process_content?: string; // 轨迹内容
  process_country?: string; // 轨迹发生国家/地区
  process_province?: string; // 轨迹发生省份/州
  process_city?: string; // 轨迹发生城市
  process_location?: string; // 轨迹发生地
  track_node_code?: string; // 轨迹节点代码，可查阅云途物流轨迹节点表
  track_node_description?: string;
  node_labels?: NodeLabel[]; // 轨迹节点标签集合
  pod_url?: string; // 签收证明文件Url链接地址
  pod_urls?: any[]; // 签收证明文件Url链接地址集合
  IsSignature?: boolean; // 是否购买签名服务
  SignatureUrls?: any[]; // 付费-签名服务-podUrls集合
}

export interface NodeLabel {
  label_code?: string;
  label_name?: string;
  label_name_en?: string;
}
