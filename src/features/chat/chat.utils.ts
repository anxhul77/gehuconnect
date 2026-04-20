import { Message, MessageType } from "./chat.types";

export const mergeMessage = (draft: { messages: Message[] }, data: Message) => {
  const index = draft.messages.findIndex((m: Message) => m.clientId === data.clientId);
  if (index !== -1) {
    draft.messages[index] = data;
  } else {
    draft.messages.push(data);
  }
};

function resolveLayoutType(messageType: MessageType, content?: string): string {
  if (messageType === "SYSTEM") return "system";
  const len = content?.length ?? 0;
  if (len <= 80) return "textSmall";
  if (len <= 200) return "textMedium";
  return "textLarge";
}

const GROUP_THRESHOLD_MS = 5 * 60 * 1000;

export const computeMessageUI = (
  createdAt: string,
  messageType: MessageType,
  content?: string
): Pick<Message, "createdAtMs" | "formattedTime" | "formattedDate" | "isGrouped" | "layoutType"> => {
  const date = new Date(createdAt);
  const now = new Date();
  const createdAtMs = date.getTime();

  const formattedTime = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  let formattedDate = "Today";
  if (isYesterday) {
    formattedDate = "Yesterday";
  } else if (!isToday) {
    formattedDate = date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  return {
    createdAtMs,
    formattedTime,
    formattedDate,
    isGrouped: false, // applyGrouping() sets the real value
    layoutType: resolveLayoutType(messageType, content),
  };
};

/**
 * Walk a sorted (ascending) message array and set isGrouped correctly.
 * A message is grouped when it shares senderId with the previous message
 * AND was sent within GROUP_THRESHOLD_MS of it.
 */
export function applyGrouping(messages: Message[]): Message[] {
  return messages.map((msg, i) => {
    if (i === 0 || msg.messageType === "SYSTEM") {
      return { ...msg, isGrouped: false };
    }
    const prev = messages[i - 1];
    const sameAuthor = String(prev.senderId) === String(msg.senderId);
    const withinWindow = msg.createdAtMs - prev.createdAtMs < GROUP_THRESHOLD_MS;
    return { ...msg, isGrouped: sameAuthor && withinWindow };
  });
}