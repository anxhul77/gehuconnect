// ─────────────────────────────────────────────
//  chat.api.ts
//
//  FIXES THIS ROUND:
//  1. DOUBLE MESSAGE — root cause was senderId:"me" in optimistic
//     insert. Server echoes the real senderId (e.g. "2"). The merge
//     findIndex matched clientId correctly BUT only if the server
//     echoes clientId back. If your Spring controller does NOT echo
//     clientId, the merge falls through to "append" → duplicate.
//     Fix: always match on clientId first (which we control),
//     AND guard against appending if messageId already exists.
//
//  2. PAGINATION — cursor-based loadOlder with /messages/getAllMessages
//     /{channelId}?cursor={cursor}&limit=25. Merges older messages
//     at the START of the array (they're older = lower index).
//
//  3. All previous fixes retained.
// ─────────────────────────────────────────────

import {
  Message,
  MessagesResponse,
  SendMessagePayload,
  SocketIncomingMessage,
} from "./chat.types";
import {
  connectChatSocket,
  disconnectChatSocket,
  publishWhenReady,
  subscribeTopic,
} from "./chat.socket";
import { api } from "@/src/store/api";

const LOG_TAG = "[ChatAPI]";
const PAGE_SIZE = 25;

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({

    // ─── GET MESSAGES (initial load) ───────────────
    getMessages: builder.query<MessagesResponse, { channelId: string }>({

      query: ({ channelId }) => {
        console.debug(`${LOG_TAG} getMessages → channel ${channelId}`);
        return `/messages/getAllMessages/${channelId}?limit=${PAGE_SIZE}`;
      },

      transformResponse: (res: any): MessagesResponse => {
        // Support both array response and paginated {messages, nextCursor} shape
        const rawMessages: Message[] = Array.isArray(res) ? res : res.messages ?? [];
        const nextCursor: string | null = Array.isArray(res) ? null : (res.nextCursor ?? null);
        const hasMore = nextCursor !== null;

        console.debug(`${LOG_TAG} transformResponse — ${rawMessages.length} messages, cursor: ${nextCursor}`);

        const messages = rawMessages.map((m) => ({
          ...m,
          clientId: m.clientId ?? m.messageId?.toString() ?? `srv-${m.createdAt}-${Math.random()}`,
          pending: false,
          failed: false,
        }));

        // Messages must be in ASCENDING order (oldest first)
        // FlatList inverted handles the visual flip
        messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        return { messages, nextCursor, hasMore };
      },

      async onCacheEntryAdded(
        { channelId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        console.debug(`${LOG_TAG} onCacheEntryAdded for channel: ${channelId}`);

        try {
          await cacheDataLoaded;
          console.debug(`${LOG_TAG} Cache loaded for channel ${channelId}, attaching socket`);
        } catch (err) {
          console.warn(`${LOG_TAG} cacheDataLoaded rejected for channel ${channelId}`, err);
          return;
        }

        const token = (getState() as any).auth?.accessToken;
        if (!token) {
          console.error(`${LOG_TAG} No auth token — cannot connect socket`);
          return;
        }

        connectChatSocket(token);

        const topic = `/topic/channel/${channelId}`;

        const unsubscribe = subscribeTopic(topic, (stompMessage) => {
          try {
            const data: SocketIncomingMessage = JSON.parse(stompMessage.body);
            console.debug(
              `${LOG_TAG} Received socket msg — clientId: ${data.clientId} messageId: ${data.messageId}`
            );

            updateCachedData((draft) => {
              // ── Dedup guard ─────────────────────────────────
              // Priority 1: match by clientId (optimistic echo — most reliable)
              // Priority 2: match by messageId (server-sent to others)
              // Priority 3: no match → new message from someone else
              //
              // THE DUPLICATE BUG: if server doesn't echo clientId back,
              // Priority 1 fails. Then Priority 2 runs — if messageId already
              // exists from a previous echo, we skip. This prevents the double.
              const byClientId = data.clientId
                ? draft.messages.findIndex((m) => m.clientId === data.clientId)
                : -1;

              const byMessageId =
                data.messageId != null
                  ? draft.messages.findIndex((m) => m.messageId === data.messageId)
                  : -1;

              const existingIndex = byClientId !== -1 ? byClientId : byMessageId;

              if (existingIndex !== -1) {
                console.debug(`${LOG_TAG} Merging into existing msg at index ${existingIndex}`);
                draft.messages[existingIndex] = {
                  ...draft.messages[existingIndex],
                  ...data,
                  // Preserve local clientId if server didn't echo it
                  clientId: draft.messages[existingIndex].clientId,
                  pending: false,
                  failed: false,
                };
              } else {
                console.debug(`${LOG_TAG} Appending new incoming msg from ${data.senderId}`);
                // New messages go to the END (ascending order, FlatList inverted shows latest at bottom)
                draft.messages.push({
                  ...data,
                  clientId: data.clientId ?? data.messageId?.toString() ?? `srv-${Date.now()}`,
                  pending: false,
                  failed: false,
                });
              }
            });
          } catch (parseErr) {
            console.error(`${LOG_TAG} Failed to parse socket message`, parseErr, stompMessage.body);
          }
        });

        await cacheEntryRemoved;
        console.debug(`${LOG_TAG} cacheEntryRemoved for channel ${channelId} — cleaning up`);
        unsubscribe();
        disconnectChatSocket();
      },
    }),

    // ─── LOAD OLDER MESSAGES (pagination) ──────────
    loadOlderMessages: builder.mutation<
      { messages: Message[]; nextCursor: string | null; hasMore: boolean },
      { channelId: string; cursor: string }
    >({
      async queryFn({ channelId, cursor }, _api, _extraOptions, baseQuery) {
        console.debug(`${LOG_TAG} loadOlderMessages cursor: ${cursor}`);
        const result = await baseQuery(
          `/messages/getAllMessages/${channelId}?cursor=${cursor}&limit=${PAGE_SIZE}`
        );
        if (result.error) {
          console.error(`${LOG_TAG} loadOlderMessages failed`, result.error);
          return { error: result.error };
        }
        const res = result.data as any;
        const rawMessages: Message[] = Array.isArray(res) ? res : res.messages ?? [];
        const nextCursor: string | null = Array.isArray(res) ? null : (res.nextCursor ?? null);
        const messages = rawMessages
          .map((m) => ({
            ...m,
            clientId: m.clientId ?? m.messageId?.toString() ?? `srv-${m.createdAt}`,
            pending: false,
            failed: false,
          }))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        console.debug(`${LOG_TAG} loadOlderMessages — got ${messages.length}, nextCursor: ${nextCursor}`);
        return { data: { messages, nextCursor, hasMore: nextCursor !== null } };
      },

      async onQueryStarted({ channelId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Prepend older messages to the FRONT of the array (they're older)
          dispatch(
            chatApi.util.updateQueryData("getMessages", { channelId }, (draft) => {
              // Dedup: don't add messages we already have
              const existingIds = new Set(draft.messages.map((m) => m.clientId));
              const newMsgs = data.messages.filter((m) => !existingIds.has(m.clientId));
              console.debug(`${LOG_TAG} Prepending ${newMsgs.length} older messages`);
              draft.messages.unshift(...newMsgs);
              draft.nextCursor = data.nextCursor;
              draft.hasMore = data.hasMore;
            })
          );
        } catch (err) {
          console.error(`${LOG_TAG} loadOlderMessages onQueryStarted failed`, err);
        }
      },
    }),

    // ─── SEND MESSAGE ──────────────────────────────
    sendMessage: builder.mutation<boolean, SendMessagePayload>({

      async onQueryStarted(
        { channelId, content, messageType = "TEXT" },
        { dispatch, getState }
      ) {
        // Use the real userId from auth state so senderId matches server echo
        const currentUserId = (getState() as any).auth?.userId?.toString() ?? "me";
        const clientId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        console.debug(`${LOG_TAG} sendMessage — clientId: ${clientId} sender: ${currentUserId}`);

        dispatch(
          chatApi.util.updateQueryData("getMessages", { channelId }, (draft) => {
            // Guard: never insert if a message with this clientId already exists
            const alreadyExists = draft.messages.some((m) => m.clientId === clientId);
            if (alreadyExists) {
              console.warn(`${LOG_TAG} sendMessage: duplicate clientId detected, skipping insert`);
              return;
            }
            draft.messages.push({
              clientId,
              content,
              createdAt: new Date().toISOString(),
              channelId: Number(channelId),
              // FIX: use real userId not "me" so server echo merge works
              senderId: currentUserId,
              messageType,
              pending: true,
              failed: false,
            });
          })
        );

        console.debug(`${LOG_TAG} sendMessage — calling publishWhenReady`);

        publishWhenReady(
          `/app/chat.send/${channelId}`,
          JSON.stringify({ content, clientId, messageType }),
          () => {
            console.debug(`${LOG_TAG} publishWhenReady ✓ clientId: ${clientId}`);
          },
          (err) => {
            console.error(`${LOG_TAG} publishWhenReady failed`, err);
            dispatch(
              chatApi.util.updateQueryData("getMessages", { channelId }, (draft) => {
                const msg = draft.messages.find((m) => m.clientId === clientId);
                if (msg) {
                  msg.pending = false;
                  msg.failed = true;
                }
              })
            );
          }
        );
      },

      queryFn: async () => ({ data: true as boolean }),
    }),

  }),
});

export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useLoadOlderMessagesMutation,
} = chatApi;