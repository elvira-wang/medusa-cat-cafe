## 消息通知设计文档

消息通知会新增两个表：消息模板，发送记录；
消息模板表用于制定发送的消息内容和时间段
消息记录表用于识别用户接收消息的具体情况及读取情况

新增sse模块用于管理sse连接，message模块用于管理两张表及实现具体的消息功能

api包含建立sse连接、获取用户消息列表、标记消息已读、创建消息模板、编辑消息模板

定时器包含每小时扫描消息模板表发送需要定时发送的消息，每天扫描消息记录清理过期消息（30d）

#### 消息/模板表

| 字段名           | 类型                                                | 说明       | 是否必填 | 备注             |
|---------------|---------------------------------------------------|----------|------|----------------|
| id            | uuid                                              | 主键       | 是    | 自动生成           |
| type          | text                                              | 模板类型     | 是    | 运营选择           |
| title         | varchar(255)                                      | 消息标题     | 是    | 运营填写           |
| content       | text                                              | 消息正文     | 是    | 运营填写           |
| cover_image   | varchar(255)                                      | 封面图      | 否    | 可选             |
| target_type   | enum('all','user')                                | 推送目标类型   | 是    | 全站 / 指定用户      |
| target_filter | json                                              | 推送对象信息   | 否    | {"userIds":[]} |
| scheduled_at  | timestamptz                                       | 定时发送时间   | 否    | null 表示立即发送    |
| expire_at     | timestamptz                                       | 消息过期时间   | 否    | null 表示长期有效    |
| status        | enum('draft', 'available', 'disabled', 'expired') | 消息/模板状态  | 是    | 消息状态           |
| created_at    | timestamptz                                       | 创建时间     | 是    | 系统生成           |
| updated_at    | timestamptz                                       | 更新时间     | 是    | 系统生成           |
| delivered_at  | timestamptz                                       | 消息实际发送时间 | 否    | 定时发送完成后更新      |

#### 消息记录表

| 字段名          | 类型                       | 说明      | 是否必填 | 备注                      |
|--------------|--------------------------|---------|------|-------------------------|
| id           | uuid                     | 主键      | 是    | 自动生成                    |
| user_id      | varchar                  | 接收用户    | 是    | FK → User / Customer    |
| user_type    | enum('user', 'customer') | 接收用户的类型 | 是    | 后台用户 / 前台用户             |
| message_id   | uuid                     | 消息模板 ID | 是    | FK → MessageTemplate.id |
| delivered_at | timestamptz              | 实际推送时间  | 否    | SSE Hub 发送时填            |
| status       | enum('unread', 'read')   | 阅读时间    | 否    | 用户点击已读时更新               |
| created_at   | timestamptz              | 创建时间    | 是    | 系统生成                    |
| updated_at   | timestamptz              | 更新时间    | 是    | 系统生成                    |
