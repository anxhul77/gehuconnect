export type MessageType = "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
 
export interface Message {
  messageId?: number;
  clientId: string;
  content: string;
  createdAt: string;
  channelId: number;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  messageType: MessageType;
  pending?: boolean;
  failed?: boolean;
  delivered?: boolean;
  seen?: boolean;
}
 
export interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}
 
export interface SendMessagePayload {
  channelId: string;
  content: string;
  messageType?: MessageType;
}
 
export interface SocketIncomingMessage extends Message {
  clientId: string;
}
 