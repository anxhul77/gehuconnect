export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "FILE"
  | "SYSTEM"
  | "REPLY"
  | "DELETED"
  | "EDITED"
  | "REACTION"
  | "LINK"
  | "AUDIO"
  | "VIDEO";

export interface Message {

  messageId?: number;

  clientId: string;

  content: string;

  createdAt: string;

  createdAtMs:number;

  sequence?:number;

  channelId: number;

  senderId: string;

  senderName?: string;

  senderAvatar?: string;

  isMine?:boolean;

  messageType: MessageType;

/* state */

  pending?: boolean;

  failed?: boolean;

  delivered?: boolean;

  seen?: boolean;

/* UI */

  formattedTime:string;

  formattedDate:string;

  isGrouped:boolean;

  layoutType:string;

/* reply */

  replyToId?:number;

  replyPreview?:string;

/* attachments */

  attachmentUrl?:string;

  thumbnailUrl?:string;

  mimeType?:string;

  fileName?:string;

  fileSize?:number;

/* lifecycle */

  edited?:boolean;

  editedAt?:string;

  deleted?:boolean;

/* reactions */

  reactions?:Record<string,number>;

  system?:boolean;

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

/* future proof */
 attachmentUploadIds:string[]
  replyToId?:number;

   
      editMessageId?:number
}

export interface SocketIncomingMessage extends Message {

  clientId: string;

}