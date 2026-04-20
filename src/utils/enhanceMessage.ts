import { Message } from "../features/chat/chat.types";
import { formatDateLabel, formatTime } from "./ChatTImeFormmater";

export function predictLayout(
  content?:string
){

  const l = content?.length ?? 0;

  if(l<40) return "textSmall";

  if(l<140) return "textMedium";

  return "textLarge";

}

export function enhanceMessage(
  msg:Message,
  previous?:Message
){

  const createdAtMs =
    Date.parse(msg.createdAt);

  const grouped =
    previous &&
    previous.senderId===msg.senderId &&
    createdAtMs-previous.createdAtMs < 300000;

  return{

    ...msg,

    createdAtMs,

    formattedTime:
      formatTime(msg.createdAt),

    formattedDate:
      formatDateLabel(msg.createdAt),

    isGrouped:!!grouped,

    layoutType:
      msg.system
        ? "system"
        : predictLayout(msg.content)

  };

}

export function recomputeGrouping(
  list:Message[],
  index:number
){

  if(index<=0) return;

  const prev =
    list[index-1];

  const cur =
    list[index];

  list[index] = {

    ...cur,

    isGrouped:
      prev &&
      prev.senderId===cur.senderId &&
      cur.createdAtMs-prev.createdAtMs < 300000

  };

}