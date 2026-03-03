/* 创建直发委托单-请求参数（method=ds.xms.order.create） */
export interface Create4pxOrderRequest {
  "4px_tracking_no"?: string; // 4PX跟踪号（预分配号段的客户可传此值）
  ref_no: string; // 参考号（客户自有系统的单号，如客户单号）。客户单号只能是数字、字母及中横线的组合，长度不超过32个字符
  business_type: string; // 业务类型(4PX内部调度所需，如需对接传值将说明，默认值：BDS。)
  duty_type: DutyType; // 税费费用承担方式(可选值：U、P、F)
  cargo_type?: CargoType; // 货物类型（1：礼品;2：文件;3：商品货样;5：其它；默认值：5）
  vat_no?: string; // 增值税号(数字或字母)；欧盟国家(含英国)使用的增值税号；
  eori_no?: string; // EORI号码(数字或字母)；欧盟入关时需要EORI号码，用于商品货物的清关
  logistics_service_info: LogisticsServiceInfo;
  label_barcode?: string; // 面单条码（预分配号段的客户可传此值）
  return_info: ReturnInfo;
  parcel_list: ParcelList[];
  is_insure: "Y" | "N"; // 是否投保（Y：投保；N：不投保）；默认值：N
  insurance_info: InsuranceInfo; // 保险信息（投保时必须填写）
  sender: Sender;
  recipient_info: RecipientInfo;
  deliver_type_info: DeliverTypeInfo;
  deliver_to_recipient_info: DeliverToRecipientInfo;
  ext?: string; // 扩展字段
  sort_code?: string; // 分拣分区
  order_attachment_info?: OrderAttachmentInfo[]; // 订单附件列表
  payment_info?: PaymentInfo; // 指定产品需要提供付款信息
  platform_tax_number?: string; // 平台税号
}

/* 税费费用承担方式
 * （如果物流产品只提供其中一种，则以4PX提供的为准） */
export enum DutyType {
  PAID_BY_SENDER = "P", // Delivered Duty Paid，寄件人承担
  PAID_BY_RECIPIENT = "U", // Delivered Duty Unpaid，收件人承担
  CHARGED_BY_PLATFORM = "F", // 平台代收代缴增值税
}

/* 货物类型 */
export enum CargoType {
  GIFT = "1", // 礼品
  DOCUMENT = "2", // 文件
  SAMPLE = "3", // 商品货样
  OTHER = "5", // 其它
}

/* 物流服务信息 */
export interface LogisticsServiceInfo {
  logistics_product_code: string; // 物流产品代码
  customs_service?: string; //单独报关（Y：单独报关；N：不单独报关） 默认值：N
  signature_service?: string; //签名服务（Y/N)；默认值：N
}

/* 退件信息 */
export interface ReturnInfo {
  is_return_on_domestic: "Y" | "N" | "U"; // 国内异常处理策略（Y：退件；N：销毁；U：其他-等待客户指令）；默认值：N
  domestic_return_addr?: DomesticReturnAddr;
  is_return_on_oversea: "Y" | "N" | "U"; // 国外异常处理策略（Y：退件；N：销毁；U：其他-等待客户指令）；默认值：N
  oversea_return_addr?: OverseaReturnAddr;
}

/* 国内退件地址 */
export interface DomesticReturnAddr {
  first_name: string;
  last_name?: string;
  company?: string;
  phone: string;
  phone2?: string;
  email?: string;
  post_code: string;
  country: string;
  state?: string;
  city: string;
  district?: string;
  street: string;
  house_number?: string;
}

/* 国外退件地址 */
export interface OverseaReturnAddr {
  first_name: string;
  last_name?: string;
  company?: string;
  phone: string;
  phone2?: string;
  email?: string;
  post_code: string;
  country: string;
  state?: string;
  city: string;
  district?: string;
  street: string;
  house_number?: string;
}

/* 包裹列表 */
export interface ParcelList {
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  parcel_value: number;
  currency: string; // 包裹申报价值币别（按照ISO标准三字码；支持的币种，根据物流产品+收件人国家配置；币种需和进出口国申报币种一致）
  include_battery: string;
  battery_type?: string;
  product_list?: ProductList[]; // 即将废弃
  declare_product_info: DeclareProductInfo[];
}

export interface ProductList {
  sku_code: string;
  standard_product_barcode: string;
  product_name: string;
  product_description: string;
  product_unit_price: number;
  currency: string;
  qty: number;
}

/* 海关申报信息
 * (每个包裹的申报信息，方式1：填写申报产品代码和申报数量；方式2：填写其他详细申报信息) */
export interface DeclareProductInfo {
  declare_product_code?: string;
  declare_product_name_cn?: string;
  declare_product_name_en?: string;
  uses?: string;
  specification?: string;
  component?: string;
  unit_net_weight?: number;
  unit_gross_weight?: number;
  material?: string;
  declare_product_code_qty: number;
  unit_declare_product?: string;
  origin_country?: string;
  country_export?: string;
  country_import?: string;
  hscode_export?: string;
  hscode_import?: string;
  declare_unit_price_export: number; // 出口国/起始国/发件人国家_申报单价（按对应币别的法定单位，最多2位小数点）
  currency_export: string; // 出口国/起始国/发件人国家_申报单价币种（按照ISO标准；支持的币种，根据物流产品+收件人国家配置；币种需和进口国申报币种一致）
  declare_unit_price_import: number; // 进口国/目的国/收件人国家_申报单价（按对应币别的法定单位，最多2位小数点）
  currency_import: string; // 进口国/目的国/收件人国家_申报单价币种（按照ISO标准；支持的币种，根据物流产品+收件人国家配置；币种需和出口国申报币种一致）
  brand_export: string; // 出口国/起始国/发件人国家_品牌(必填；若无，填none即可)
  brand_import: string; // 进口国/目的国/收件人国家_品牌(必填；若无，填none即可)
  sales_url?: string;
  package_remarks?: string;
}

export interface InsuranceInfo {
  insure_type?: string;
  insure_value?: number;
  currency?: string;
  insure_person?: string;
  certificate_type?: string;
  certificate_no?: string;
  category_code?: string;
  insure_product_name?: string;
  package_qty?: string;
}

/* 发件人信息 */
export interface Sender {
  first_name: string;
  last_name?: string;
  company?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  post_code?: string;
  country: string; // 国家（国际二字码 标准ISO 3166-2 ）
  state?: string;
  city: string;
  district?: string;
  street?: string;
  house_number?: string;
  certificate_info?: CertificateInfo;
}

/* 证件信息 */
export interface CertificateInfo {
  id_type?: string;
  id_no?: string;
  id_front_url?: string;
  id_back_url?: string;
}

/* 收件人信息 */
export interface RecipientInfo {
  first_name: string;
  last_name?: string;
  company?: string;
  phone: string;
  phone2?: string;
  email?: string;
  post_code?: string;
  country: string;
  state?: string;
  city: string;
  district?: string;
  street: string;
  house_number?: string;
  second_name?: string; // 非必填，备用名字，一般用于有两个名字的国家，比如日本清关要求必需片假名
  certificate_info?: CertificateInfo;
}

export enum DeliverType {
  PICK_UP = "1", // 上门揽收
  EXPRESS_TO_WAREHOUSE = "2", // 快递到仓
  SELF_DELIVER_TO_WAREHOUSE = "3", // 自送到仓
  SELF_DELIVER_TO_STORE = "5", // 自送门店
}

/* 货物到仓方式 */
export interface DeliverTypeInfo {
  deliver_type: DeliverType;
  warehouse_code?: string; // 收货仓库/门店代码
  pick_up_info?: PickUpInfo; // 上门揽收信息
  express_to_4px_info?: ExpressTo4pxInfo; // 快递到仓信息
  self_send_to_4px_info?: SelfSendTo4pxInfo; // 自送到仓信息
}

/* 上门揽收信息 */
export interface PickUpInfo {
  expect_pick_up_earliest_time?: string; // 期望提货最早时间，传入值需要转换为long类型格式
  expect_pick_up_latest_time?: string; // 期望提货最晚时间，传入值需要转换为long类型格式
  pick_up_address_info?: PickUpAddressInfo;
}

export interface PickUpAddressInfo {
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  post_code?: string;
  country?: string;
  state?: string;
  city?: string;
  district?: string;
  street?: string;
  house_number?: string;
}

/* 快递到仓信息 */
export interface ExpressTo4pxInfo {
  express_company?: string;
  tracking_no?: string;
}

/* 自送到仓信息 */
export interface SelfSendTo4pxInfo {
  booking_earliest_time?: string; // 预约送仓最早时间，传入值需要转换为long类型格式
  booking_latest_time?: string; // 预约送仓最晚时间，传入值需要转换为long类型格式
}

/* 投递信息 */
export interface DeliverToRecipientInfo {
  deliver_type?: string; // 默认 HOME_DELIVERY，其他类型暂不支持
  station_code?: string;
}

export interface OrderAttachmentInfo {
  file_data?: string; // 文件的Base64编码字符串
  file_url?: string; // 文件的URL链接
  file_type?: string; // 文件类型，如 pdf、jpg 等
  attachment_format?: string; // 附件格式（url、base64）
  attachment_type: "1" | "2"; // 附件类型 1|2（1:商业发票 2:交易图片）。文档非必填，实际必填
}

export interface PaymentInfo {
  payment_method?: string;
  issuing_entity?: string;
  last_four_digits_payment_method?: string;
  birth_date?: string;
}

/* 创建直发委托单-响应参数（method=ds.xms.order.create） */
export interface Create4pxOrderResponse {
  ds_consignment_no: string; // 直发委托单号
  "4px_tracking_no": string; // 4PX跟踪号
  ref_no: string; // 参考号
  logistics_channel_no: string; // 物流渠道号。如果结果返回为空字符，表示暂无物流渠道号，需稍后主动调用查询直发委托单接口查询
  oda_result_sign: string; // 偏远地区标识(Y:偏远地区;N:非偏远地区)
}

/* 查询直发委托单-请求参数（method=ds.xms.order.get） */
export interface Get4pxOrderRequest {
  request_no?: string; // 请求单号(支持4PX单号/客户单号)
  start_time_of_create_consignment?: string; // 委托单创建时间-开始时间（*注：时间格式的传入值需要转换为long类型格式。）时间差为7天
  end_time_of_create_consignment?: string; // 委托单创建时间-结束时间（*注：时间格式的传入值需要转换为long类型格式。）时间差为7天
  consignment_status?: string; // 委托单状态：已预报：P；已交接/已交货：V；库内作业中/已入库：H；已出库：C；已完成：F；已退件：R；已关闭：X；所有：ALL（默认）
}

/* 查询直发委托单-响应参数（method=ds.xms.order.get） */
export type Get4pxOrderResponse = Get4pxOrderResponseItem[];

export interface Get4pxOrderResponseItem {
  consignment_info: ConsignmentInfo;
  parcel_confirm_info: ParcelConfirmInfo;
  parcel_list_confirm_info: ParcelListConfirmInfo[];
}

/* 委托单信息 */
export interface ConsignmentInfo {
  ds_consignment_no: string; // 客户委托单号
  "4px_tracking_no": string; // 4PX单号
  ref_no: string; // 客户单号
  get_no_mode: string; // 获取末端服务商单号的方式(创建订单时取号：C；仓库作业时取号：U)
  logistics_channel_no: string; // 末端服务商单号（(若此字段为空：①表示系统在异步取号中--再次查询即可获取；②取号失败--此时字段get_no_exmsg会返回相应的报错内容)）
  get_no_exmsg: string; // 获取服务商单号抛的异常信息（若取号失败/取号异常，此字段将服务商的报错内容，同时logistics_channel_no字段将为空）
  logistics_product_code: string; // 运输方式代码
  logistics_product_name: string; // 运输方式名称
  consignment_status: string; // 委托单状态（草稿：D；已预报：P；已交接/已交货：V；库内作业中：H；已出库：C；已关闭：X；）
  insure_status: "Y" | "N"; // 投保状态（Y 已投保；N 未投保）
  insure_type: string; // 投保类型
  has_check_oda: "Y" | "N"; // 是否已核实偏远地区(Y:已核实;N:未核实)
  oda_result_sign: "Y" | "N";
  is_hold_sign: string; // 拦截标识（申请拦截：Y ；拦截成功：S； 放行：N ）
  consignment_create_date: number; // 创建委托单时间（*注：时间格式的传入值需要转换为long类型格式。）
  "4px_inbound_date": number; // 4PX收货时间（*注：时间格式的传入值需要转换为long类型格式。）
  "4px_outbound_date": number; // 4PX出库时间（*注：时间格式的传入值需要转换为long类型格式。）
}

/* 订单信息 */
export interface ParcelConfirmInfo {
  confirm_parcel_qty: string; // 订单的实际包裹数
  confirm_parcel_weight: number; // 订单实重（默认g）
  confirm_parcel_volume_weight?: number; // 订单体积重（默认g，若有才返回）
  confirm_parcel_charge_weight: number; // 订单计费重（默认g）
}

/* 包裹列表 */
export interface ParcelListConfirmInfo {
  confirm_weight: string; // 核实重量（默认g）
  confirm_volume_weight: number; // 包裹体积重（默认g）
  confirm_length?: number; // 核实包裹长（mm，只有库内进行了测量，才有值）
  confirm_width?: number; // 核实包裹宽（mm，只有库内进行了测量，才有值）
  confirm_high?: number; // 核实包裹高（mm，只有库内进行了测量，才有值）
  confirm_charge_weight: number; // 包裹计费重（默认g）
  confirm_include_battery: string; // 核实是否含电池（Y/N）
  confirm_battery_type: string; // 核实带电类型（内置电池966：1；配套电池967：2）
  parcel_total_value_confirm: number; // 核实包裹价值
  currency_code: string; // 币别（按照ISO标准，目前只支持USD）
}

/* 取消直发委托单-请求参数（method=ds.xms.order.cancel） */
export interface Cancel4pxOrderRequest {
  request_no: string; // 请求单号(支持4PX单号/客户单号)
  cancel_reason: string; // 取消原因
}

/* 申请/取消拦截订单-请求参数（method=ds.xms.order.hold） */
export interface Hold4pxOrderRequest {
  request_no: string; // 请求单号(支持4PX单号/客户单号)
  is_hold: IsHold; // 是否拦截(Y:申请拦截;N:取消拦截)
  hold_reason: string; // 拦截原因
}

export enum IsHold {
  HOLD = "Y", // 申请拦截
  RELEASE = "N", // 取消拦截
}

/* 获取标签-请求参数（method=ds.xms.label.get） */
export interface Get4pxLabelRequest {
  request_no: string; // 请求单号(支持4PX单号/客户单号/服务商单号)
  response_label_format?: string;
  is_print_time?: "Y" | "N"; // 是否打印当前时间(Y:打印;N:不打印)默认值：N
  is_print_buyer_id?: "Y" | "N"; // 是否打印买家 ID (Y:打印;N:不打印)默认值：N
  is_print_pick_info?: "Y" | "N"; // 是否在标签上打印配货信息（Y：打印；N：不打印）；默认为N。
  is_print_declaration_list?: "Y" | "N"; // 是否打印报关单(Y:打印;N:不打印)默认值：N
  is_print_customer_weight?: "Y" | "N"; // 报关单上是否打印客户预报重(Y:打印;N:不打印)默认值：N
  create_package_label?: "Y" | "N"; // 是否单独打印配货单(Y:生成;N:不生成)默认值：N
  is_print_pick_barcode?: "Y" | "N"; // 配货单上是否打印配货条形码（Y：打印；N：不打印） 默认为N。 注：针对单独打印配货单功能
  is_print_merge?: "Y" | "N"; // 是否合并打印(Y：合并；N：不合并)默认为N； 注：合并打印，指若报关单和配货单打印为Y时，是否和标签合并到同一个URL进行返回
  bar_code_order_type?: "0" | "1"; // 指定条码单号类型（0：默认类型；1：4PX单号），默认为0。注：只对通用面单有效。
}

/* 获取标签-响应参数（method=ds.xms.label.get） */
export interface Get4pxLabelResponse {
  label_barcode: string; // 面单条码(①普通客户返回面单号(可能是4PX单号，也可能是服务商单号)；②特定客户且特定产品，直接返回物流服务商单号)
  child_label_barcode?: string[]; // 子面单号列表
  label_url_info: LabelUrlInfo;
}

export interface LabelUrlInfo {
  logistics_label: string; // 面单链接(①普通客户：返回4PX标准物流链接；若需打印报关标签&配货标签，也在此链接中；即多标签合并成了一个文件，返回一个链接②特定客户且特定产品，返回物流服务商标签链接
  custom_label?: string;
  package_label?: string;
  invoice_label?: string;
}

/* 批量获取标签-请求参数（method=ds.xms.label.getlist） */
export interface Get4pxLabelListRequest {
  request_no: string[];
  logistics_product_code: string;
  label_size?: string; // 如需要10*15的面单（CM）和10*10的面单（CM）一起打印，大小需要传 label_100x150 才可以
  is_print_time?: "Y" | "N"; // 是否打印当前时间（Y：打印；N：不打印） 默认为N；
  is_print_buyer_id?: "Y" | "N";
  is_print_pick_info?: "Y" | "N";
  is_print_declaration_list?: "Y" | "N"; // 是否打印报关单(Y:打印;N:不打印)默认值：N
  is_print_customer_weight?: "Y" | "N"; // 报关单上是否打印客户预报重（Y：打印；N：不打印） 默认为N。 注：针对单独打印报关单功能
  create_package_label?: "Y" | "N"; //是否单独打印配货单（Y：打印；N：不打印） 默认为N。
  is_print_pick_barcode?: "Y" | "N"; // 配货单上是否打印配货条形码（Y：打印；N：不打印） 默认为N。 注：针对单独打印配货单功能
}

/* 预估费用查询/费用试算-请求参数（method=ds.xms.estimated_cost.get）*/
export interface Get4pxEstimatedCostRequest {
  request_no?: string; // 请求单号(支持4PX单号、面单号、客户单号)；若填写了请求单号，则其余请求字段将不会生效
  country_code?: string; // 目的国家二字码（未填写请求单号时，必填）
  weight?: string; // 实重(单位g，未填写请求单号时，必填)，填写实重需小于1000000g
  length?: string; // 长(单位cm)；长宽高3个字段，填写了其中一个字段，其他2个字段需必填；小于1000cm并且保留2位小数
  width?: string; // 宽(单位cm)；
  height?: string; // 高(单位cm)；
  cargocode?: string; // 货物类型(包裹：P；文件：D）默认值：P；
  logistics_product_code?: any[]; // 物流产品代码列表。如填写了产品代码，则只会返回填写的产品代码的试算结果，最大200个产品
  recipient_post_code?: string; // 收件人邮编
}

/* 预估费用查询/费用试算-响应参数（method=ds.xms.estimated_cost.get） */
export type Get4pxEstimatedCostResponse = GetEstimatedCostResponseItem[];

export interface GetEstimatedCostResponseItem {
  "4px_tracking_no": string; // 4PX单号
  ref_no: string; // 客户单号
  logistics_channel_no: string; // 服务商单号
  logistics_product_code: string; // 物流产品代码
  lump_sum_fee: number; // 总费用(CNY)
  is_volume_cargo: "Y" | "N"; // 是否泡货(Y:是;N:否)
  charge_weight: string; // 计费重/体积重(若是泡货，则返回相应的体积重；若非泡货，则不返回)
  estimated_time: string; // 预计送达天数
  is_show_track: "Y" | "N"; // 轨迹是否可跟踪 (Y:可跟踪;N:不可跟踪)
  remarks: string; // 备注说明。如：无目的国轨迹及签收信息
}

/* 查询物流轨迹-响应参数（method=tr.order.tracking.get） */
export interface Get4pxTrackingResponse {
  deliveryOrderNo: string; // 传入的物流单号 (4PX单号/服务商单号)
  destinationCountry: string; // 目的国家
  serverName: string; // 服务商名称
  serverNum: string; // 服务商单号
  trackingList: TrackingList[]; // 轨迹列表
}

export interface TrackingList {
  businessLinkCode: string; //轨迹代码 （详见帮助中心-业务数据-轨迹代码)
  occurDatetime: string; // 轨迹发生时间(格式：yyyy-MM-dd HH:mm:ss)
  occurLocation: string; // 轨迹发生地点
  country: string; // 轨迹国家
  city: string; // 轨迹城市
  timeZone: string; // 轨迹发生时区
  trackingContent: string; // 轨迹描述
}
