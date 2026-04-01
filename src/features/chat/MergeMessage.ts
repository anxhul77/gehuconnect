// ─────────────────────────────────────────────
//  mergeMessage.ts — Immer-safe, typed, dedup-safe
// ─────────────────────────────────────────────
import { Draft } from "@reduxjs/toolkit";
import { Message, MessagesResponse } from "./chat.types";

const LOG_TAG = "[mergeMessage]";

export function mergeMessage(
  draft: Draft<MessagesResponse>,
  incoming: Message
): void {
  const byClientId = incoming.clientId
    ? draft.messages.findIndex((m) => m.clientId === incoming.clientId)
    : -1;
  const byMessageId =
    incoming.messageId != null
      ? draft.messages.findIndex((m) => m.messageId === incoming.messageId)
      : -1;

  const index = byClientId !== -1 ? byClientId : byMessageId;

  if (index !== -1) {
    console.debug(`${LOG_TAG} Merging at index ${index}`, incoming.clientId);
    draft.messages[index] = {
      ...draft.messages[index],
      ...incoming,
      clientId: draft.messages[index].clientId, // preserve local clientId
      pending: false,
      failed: false,
    };
  } else {
    console.debug(`${LOG_TAG} Appending`, incoming.clientId ?? incoming.messageId);
    draft.messages.push({ ...incoming, pending: false });
  }
}