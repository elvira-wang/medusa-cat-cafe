import type {InferTypeOf} from "@medusajs/framework/types";
import {model} from "@medusajs/framework/utils";
import type {DAL} from "@medusajs/types";
import Message from "./message";

const MessageRecord = model.define("message_record", {
  id: model.id().primaryKey(),
  // /**
  //  * 用户id
  //  */
  // user_id: model.text().index(),
  // /**
  //  * 用户类型
  //  * user: 后台用户
  //  * customer: 前台用户
  //  */
  // user_type: model.enum(["user", "customer"]),
  // /**
  //  * 实际接收到消息的时间
  //  */
  // delivered_at: model.dateTime().nullable(),
  /**
   * 消息状态
   */
  status: model.enum(["unread", "read", "revoked"]).index(),
  /**
   * 关联消息模板表，声明外键
   */
  message: model.belongsTo(() => Message, {
    foreignKeyName: "message_id",
    mappedBy: "message_records",
  }),
});

export type MessageRecordPO = InferTypeOf<typeof MessageRecord>;

export type MessageRecordInjectedDependencies = {
  messageRecordRepository: DAL.RepositoryService<MessageRecordPO>;
};

export default MessageRecord;
