import { Module } from "@medusajs/framework/utils";
import MessageModuleService from "./service";

// 消息通知模块
export const MESSAGE_MODULE = "message";

export default Module(MESSAGE_MODULE, {
  service: MessageModuleService,
});
