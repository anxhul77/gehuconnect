import { api } from "@/src/store/api";
import { connectChatSocket, disconnectChatSocket, publishWhenReady, subscribeTopic } from "./chat.socket";
import { ChatListItemDto, ChatRole, MarketplaceChatItemListResponse } from "@/src/types/types";

export const sortChats = (chats: ChatListItemDto[]) => {
  return [...chats].sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    const timeA = new Date(a.lastMessageTime || 0).getTime();
    const timeB = new Date(b.lastMessageTime || 0).getTime();
    return timeB - timeA;
  });
};

export enum MarketplaceMessageType {
  OFFER = "OFFER",
  TEXT = "TEXT",
  DEAL = "DEAL",
  SCHEDULE = "SCHEDULE",
  Review = "Review"
}

export enum OfferStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  COUNTERED = "COUNTERED"
}

export enum DealStatus {
  INITIATED = "INITIATED",
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum ReviewStatus {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  SCHEDULED = "SCHEDULED",
  NONE = "NONE"
}

export enum PinnedMessageType {
  OFFER = "OFFER",
  SCHEDULED = "SCHEDULED",
  REVIEW = "REVIEW",
  DEAL = "DEAL"
}

export interface MarketplacePinnedActivityDto<T = any> {
  pinnedActivity: T;
  pinnedMessageType: PinnedMessageType;
}

export interface ScheduledMeetingRes {
  scheduledMeetingId: number;
  scheduledMeetingLocation: string;
  scheduledAt: string;
  scheduledStatus: string;
  isExpired: boolean;
  scheduledType: string;
}

export interface OfferResDto {
  offerId: number;
  offerPrice: number;
  offerStatus: OfferStatus;
  isExpired: boolean;
  expiresAt: string;
  isScheduled: boolean;
  createdAt: string;
  scheduledMeeting?: ScheduledMeetingRes;
}

export interface DealRes {
  dealId: number;
  dealFinalPrice: number;
  dealStatus: DealStatus;
  isScheduled: boolean;
  createdAt: string;
  isExpired: boolean;
  expiresAt: string;
  scheduledMeeting?: ScheduledMeetingRes;
}

export interface ReviewRes {
  reviewId: number;
  reviewStatus: ReviewStatus;
  isScheduled: boolean;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  scheduledMeeting?: ScheduledMeetingRes;
}

export interface MarketplaceChatDto {
  messageId: number;
  chatId: number;
  senderId: number;
  type: MarketplaceMessageType;
  content: string;
  createdAt: string;
  offer?: OfferResDto;
  deal?: DealRes;
  review?: ReviewRes;
}

export interface MarketplaceChatResponse {
  messages: MarketplaceChatDto[];
  cursor: string;
  hasNext: boolean;
}

export enum EventType {
  NEW_MESSAGE = "NEW_MESSAGE",
  NEW_OFFER = "NEW_OFFER",
  NEW_DEAL = "NEW_DEAL",
  OFFER_UPDATED = "OFFER_UPDATED",
  DEAL_SCHEDULED = "DEAL_SCHEDULED",
  DEAL_COMPLETED = "DEAL_COMPLETED",
  DEAL_CANCELLED = "DEAL_CANCELLED",
  TYPING = "TYPING",
}

export interface MarketplaceSocketEventDto<T> {
  type: EventType;
  chatId: number;
  payload: T;
  senderId?: number;
  timestamp?: string;
}

export interface MarketplaceMessageResDto {
  content: string;
  [key: string]: any;
}

export const marketplaceChatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMarketplaceChatMessages: builder.query<MarketplaceChatResponse, { chatId: number; cursor?: string; limit?: number }>({
      query: ({ chatId, cursor, limit = 20 }) => ({
        url: `/getMarketplaceChatMessages`,
        method: "GET",
        params: { chatId, cursor, limit }
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return { endpointName, chatId: queryArgs.chatId };
      },
      merge: (currentCache, newItems) => {
        currentCache.messages.push(...newItems.messages);
        currentCache.cursor = newItems.cursor;
        currentCache.hasNext = newItems.hasNext;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.cursor !== previousArg?.cursor;
      }
    }),

    getPinnedMessage: builder.query<MarketplacePinnedActivityDto, { chatId: number }>({
      query: ({ chatId }) => ({
        url: `/getPinnedMessage`,
        method: "GET",
        params: { chatId }
      }),
    }),

    getChatLists: builder.query<MarketplaceChatItemListResponse, { chatRole?: ChatRole; cursor?: string; limit?: number }>({
      query: ({ chatRole, cursor, limit = 20 }) => ({
        url: `/getChats`,
        method: "GET",
        params: { chatRole, cursor, limit }
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return { endpointName, chatRole: queryArgs.chatRole };
      },
      merge: (currentCache, newItems) => {
        if (!currentCache.chats) {
          currentCache.chats = [];
        }
        // Deduplicate and merge
        const existingIds = new Set(currentCache.chats.map(c => c.chatId));
        newItems.chats.forEach(chat => {
          if (!existingIds.has(chat.chatId)) {
            currentCache.chats.push(chat);
          } else {
            // Update existing chat if it's in the new payload (e.g. unreadCount changed)
            const idx = currentCache.chats.findIndex(c => c.chatId === chat.chatId);
            if (idx !== -1) currentCache.chats[idx] = chat;
          }
        });

        currentCache.chats = sortChats(currentCache.chats);
        currentCache.cursor = newItems.cursor;
        currentCache.hasNext = newItems.hasNext;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.cursor !== previousArg?.cursor;
      }
    }),

    getChatListItem: builder.query<ChatListItemDto, { chatId: number }>({
      query: ({ chatId }) => ({
        url: `/chatListItem`,
        method: "GET",
        params: { chatId }
      }),
    }),


    sendChatMessageREST: builder.mutation<number, { productId: number; content: string }>({
      query: ({ productId, content }) => ({
        url: `/marketplace/sendMessage`,
        method: "POST",
        params: { productId, content }
      }),
    }),

    createOfferREST: builder.mutation<number, { productId: number; price: number; note: string }>({
      query: ({ productId, price, note }) => ({
        url: `marketplace/offer/create`,
        method: "POST",
        params: { productId, price },
        body: note,
        headers: {
          'Content-Type': 'text/plain',
        },
      }),
    }),

    sendMarketplaceMessage: builder.mutation<void, { chatId: number; content: string }>({
      queryFn: () => ({ data: null }),
      async onQueryStarted({ chatId, content }, { dispatch, queryFulfilled, getState }) {
        const payload = {
          type: "NEW_MESSAGE",
          chatId,
          payload: {
            content
          }
        };

        publishWhenReady(
          "/app/marketplace/chat.sendMessage",
          JSON.stringify(payload),
          () => {
            console.debug("[MarketplaceChat] Sent message", payload);
          },
          (err) => {
            console.error("[MarketplaceChat] Failed to send message", err);
          }
        );

        try {
          await queryFulfilled;
        } catch (err) {
          console.error("[MarketplaceChat] Mutation failed", err);
        }
      }
    }),

    openMarketplaceChat: builder.mutation<void, { chatId: number }>({
      queryFn: () => ({ data: null }),
      async onQueryStarted({ chatId }, { dispatch, queryFulfilled }) {
        const roles: (ChatRole | undefined)[] = [undefined, ChatRole.BUYER, ChatRole.SELLER];
        const patches = roles.map(role =>
          dispatch(
            marketplaceChatApi.util.updateQueryData('getChatLists', { chatRole: role }, (draft) => {
              if (!draft.chats) return;
              const chat = draft.chats.find(c => c.chatId === chatId);
              if (chat) {
                chat.unreadCount = 0;
                draft.chats = sortChats(draft.chats);
              }
            })
          )
        );

        publishWhenReady(
          "/app/marketplace/chat.open",
          JSON.stringify(chatId),
          () => console.debug("[MarketplaceChat] Opened chat", chatId)
        );

        try {
          await queryFulfilled;
        } catch {
          patches.forEach(p => p.undo());
        }
      }
    }),
    closeMarketplaceChat: builder.mutation<void, { chatId: number }>({
      queryFn: () => ({ data: null }),
      async onQueryStarted({ chatId }, { queryFulfilled }) {
        publishWhenReady(
          "/app/marketplace/chat.close",
          JSON.stringify(chatId),
          () => console.debug("[MarketplaceChat] Closed chat", chatId)
        );
      }
    }),

    markMarketplaceChatRead: builder.mutation<void, { chatId: number }>({
      queryFn: () => ({ data: null }),
      async onQueryStarted({ chatId }, { dispatch, queryFulfilled }) {
        const roles: (ChatRole | undefined)[] = [undefined, ChatRole.BUYER, ChatRole.SELLER];
        const patches = roles.map(role =>
          dispatch(
            marketplaceChatApi.util.updateQueryData('getChatLists', { chatRole: role }, (draft) => {
              if (!draft.chats) return;
              const chat = draft.chats.find(c => c.chatId === chatId);
              if (chat) {
                chat.unreadCount = 0;
                draft.chats = sortChats(draft.chats);
              }
            })
          )
        );

        publishWhenReady(
          "/app/marketplace/chat.read",
          JSON.stringify({ chatId }),
          () => console.debug("[MarketplaceChat] Marked chat read", chatId)
        );

        try {
          await queryFulfilled;
        } catch {
          patches.forEach(p => p.undo());
        }
      }
    }),
  }),
});

export const {
  useGetMarketplaceChatMessagesQuery,
  useGetChatListsQuery,
  useGetPinnedMessageQuery,
  useSendChatMessageRESTMutation,
  useCreateOfferRESTMutation,
  useSendMarketplaceMessageMutation,
  useOpenMarketplaceChatMutation,
  useCloseMarketplaceChatMutation,
  useMarkMarketplaceChatReadMutation,

} = marketplaceChatApi;
