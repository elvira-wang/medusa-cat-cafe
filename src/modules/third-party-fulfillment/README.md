# Third-Party Fulfillment Module
本模块旨在集成第三方物流服务提供商，以实现订单一键发货和物流轨迹追踪功能。
架构设计如下：

## Clients
该目录下文件为向第三方物流商发送请求的客户端封装，主要职责包括：
- 实现不同物流商要求的Oauth2认证、加密算法等认证方式；
- 公共请求头、请求参数统一封装，API 错误统一处理；
- 定义具体业务接口所需调用的方法。
- 
## Drivers 
该目录下文件为衔接 Medusa 履约系统与第三方物流商 API 的驱动层，主要职责包括：
- 跨模块整合第三方物流商 API 所需数据，从 logistics 模块获取不同物流商配置和报关信息，从 Meudsa fullfillment provider 原生方法所传递的数据中获取订单、商品等信息；
- 调用 Clients 层封装的具体业务接口方法，与物流商 API 通信，完成订单创建、物流轨迹查询等功能；
- 处理并返回调用结果，供 Service 层使用。
- 
## Services
该目录下文件为第三方物流履约模块的服务层，主要职责包括：
- 对外暴露第三方物流履约相关功能接口，如创建履约订单、查询物流轨迹等；
- 根据不同物流商配置选择调用不同的 Driver；
- 与 Medusa 履约系统交互，更新订单履约状态。

## Medusa Fulfillment Provider 原生方法及使用场景说明
Medusa Fulfillment Provider Service 中的原生方法是即便不使用也必须实现的方法，参数固定，返回值也相对固定。以下方法按实际业务场景执行顺序进行说明：

### 1. getFulfillmentOptions
 - 调用时机：该方法用于获取可用的物流产品，其返回列表会在后台为仓库“创建 shipping options”的界面展示，供管理员选择。 
 - 数据流向：管理员选择的物流产品会存储在 shipping_option 表的 data 字段中，供后续创建订单时使用。
 - 注意事项：返回值必须至少包含 id （作为唯一标识） 和 name （用于后台展示）字段，其他字段可根据需要添加。 

### 2. canCalculate 
 - 调用时机：该方法用于判断 provider 是否支持自动计算运费。当前默认 return true。选项会在后台为仓库“创建 shipping options”的 Pice type 下展示，包括 Fixed 和 Calculated 两种。
 - 数据流向：管理员选择后会存储在 shipping_option 表的 price_type 字段中，作为启用 calculatePrice 方法的前置条件。

### 3. calculatePrice
 - 调用时机：该方法用于计算某个 shipping option 的价格。只要某个 Shipping Option 的 price_type = "calculated"，Medusa 在需要算价时就会走到 calculatePrice。
 - 数据流向：该方法接收 shipping_option 的 data 字段（即 getFulfillmentOptions 方法返回值存入的 data 字段）、cart shipping method 的数据以及购物车上下文。返回值会被写入 cart_shipping_method 的 amount 字段，作为前台用户结算时的运费价格。

### 4. validateFulfillmentData
```ts
/**
 * @param optionData shipping_option 的 data 字段
 * @param data 将要写入 order_shipping_method 的数据
 * @param context 当前结算购物车的上下文信息
 */
async validateFulfillmentData(
    optionData: shippingOptionData,
    data: any,
    context: any
): Promise<any> {
    const { logistics_product_code, carrier_id } = optionData;
    return { ...data, logistics_product_code, carrier_id };
}
```
 - 调用时机：该方法在前台用户结算流程进行到选择 shipping method 时被调用。Medusa 前台模板默认结算流程大致为：进入 checkout 页面>选择 shipping method>选择payment>确认下单。
 - 数据流向：该方法接收 shipping_option 的 data 字段（即 getFulfillmentOptions 方法返回值存入的 data 字段）和将要写入  cart_shipping_method 表的数据（后续会由 order_shipping_method 表继承）以及购物车上下文。返回值会被写入 cart_shipping_method 表的 data 字段并被 order_shipping_method 表的 data 字段继承。
 - 注意事项：目前测试该方法不会在后台管理员 create fulfillment 时被调用。亦即，后台如果更换物流配送方式（shipping method），既不会在 order_shipping_method 表中创建新纪录，也不会传递旧的 order_shipping_method 的 data 字段作为 method data，也不会在内存中创建一个新的order_shipping_method 实例来储存新的 method data 作为 validateFulfillmentData 的第二个参数。简言之，如果更换物流配送方式，从 option data 到 method data 的数据流会被跳过，导致物流产品编码和物流商编码等信息无法被正确传递。
 - 解决方案：设想是取 createFulfillment 的 fulfillment 参数中的 shipping_option_id，去 shipping_option 表中查询 data 字段，获取在
   创建 shipping option 阶段存入的第三方物流商信息。但由于 Medusa 的 module 严格隔离设计理念，不支持在第三方物流履约模块中直接访问 fulfillment 模块或注入相关服务。因此考虑是否可以通过向 fulfillment 模块发送 API 请求的方式获取 shipping option data。

### 5. createFulfillment
```ts
 /**
 * @param data order_shipping_method 表中的 data 字段。
 * @param items 本次 fulfillment 要发的商品项。
 * @param order 整个订单的上下文信息，包含订单层面的行项目。
 * @param fulfillment 当前要创建的 fulfillment 的上下文信息。
 */
async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
): Promise<CreateFulfillmentResult> {}
```
 - 调用时机：该方法用于在 Medusa 系统中创建履约记录，同时配合第三方物流商在物流商平台创建发货订单记录。后台管理员点击 Fufill itmes>Create fulfillment 时会调用此方法。
 - 数据流向：该方法接收 order_shipping_method 表的 data 字段、本次履约要发的商品项、订单上下文以及当前要创建的 fulfillment 上下文。该方法的返回值会被写入 fulfillment 表的 data 字段。原生方法 retrieveDocuments 接收 fulfillment 表的 data 字段作为参数，因此可以使用 createFulfillment 的返回值来为 retrieveDocuments 提供必须数据，向物流商发送请求，实现面单下载的功能。

### 补充说明：
 - 物流轨迹追踪功能，在当前 Medusa fulfillment provider 中没有合适的原生方法可以承载，因此计划在自定义 logistics module 中调用第三方物流履约模块的 driver 和 client 层方法来实现。
 - 不同物流商所需的创建订单数据和报关信息等存在差异，Medusa 原生方法传递的数据无法满足需要，因此自定义 logistics module，用于存储和管理不同物流商的配置和报关信息。如前所述，由于 Medusa 的 module 严格隔离设计理念，第三方物流履约模块无法直接访问 logistics module 中的数据，因此计划在第三方物流履约模块中向 logistics module 发送 API 请求来获取相关数据。
 - 其余原生方法如 cancelFulfillment、createReturnFulfillment 等，针对取消委托单、创建退货履约记录等业务场景，此处暂不作说明。