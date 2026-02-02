import {MedusaService} from "@medusajs/framework/utils";
import Message from "./models/message";
import MessageRecord from "./models/message-record";

 class MessageModuleService extends MedusaService({
  Message,
  MessageRecord: MessageRecord,
}) {}

export default MessageModuleService;