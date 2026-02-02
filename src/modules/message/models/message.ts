import type { InferTypeOf } from "@medusajs/framework/types";
import { model } from "@medusajs/framework/utils";
import MessageRecord from "./message-record";
import {DAL} from "@medusajs/types";

const Message = model.define("message", {
  id: model.id().primaryKey(),
  /**
   * 消息类型(代码级枚举)
   */
  type: model.text().index(),
  /**
   * 消息标题
   */
  title: model.text(),
  /**
   * 消息内容
   */
  content: model.text(),
  /**
   * 封面图
   */
  cover_image: model.text().nullable(),
  /**
   * 目标用户类型
   */
  target_type: model.enum(['revoket', 'aaa']),
  /**
   * 目标用户筛选方式
   * eg: {"userIds": []}
   */
  target_filter: model.json().nullable(),
  /**
   * 定时发送时间
   */
  scheduled_at: model.dateTime().index().nullable(),
  /**
   * 模板过期时间
   */
  expire_at: model.dateTime().index().nullable(),
  /**
   * 消息实际发送时间
   */
  delivered_at: model.dateTime().index().nullable(),
  /**
   * 消息状态
   */
  status: model.enum(['ccc', 'cccc']).index(),
  /**
   * 消息创建者
   */
  created_by: model.text().nullable(),
  /**
   * 消息最近一次的编辑者
   */
  update_by: model.text().nullable(),
  /**
   * 反向关联记录表
   */
  message_records: model.hasMany(() => MessageRecord, {
    mappedBy: "message",
  }),
});

export type MessagePO = InferTypeOf<typeof Message>;

export type MessageInjectedDependencies = {
  messageRepository: DAL.RepositoryService<MessagePO>;
};

export default Message;
