// ─────────────────────────────────────────────
//  chat.api.ts
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
import { computeMessageUI, applyGrouping } from "./chat.utils";
import { api } from "@/src/store/api";

const LOG_TAG = "[ChatAPI]";
const PAGE_SIZE = 30;

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({


    getMessages: builder.query<MessagesResponse, { channelId: string }>({
      query: ({ channelId }) =>
        `/messages/getAllMessages/${channelId}?limit=${PAGE_SIZE}`,

      transformResponse: (res: any): MessagesResponse => {
        const rawMessages: Message[] = Array.isArray(res) ? res : res.messages ?? [];
        const nextCursor: string | null = Array.isArray(res) ? null : (res.nextCursor ?? null);

        let messages = rawMessages.map((m) => ({
          ...m,
          // Normalise senderId to string always
          senderId: String(m.senderId ?? ""),
          clientId:
            m.clientId ??
            m.messageId?.toString() ??
            `srv-${m.createdAt}-${Math.random()}`,
          pending: false,
          failed: false,
          ...computeMessageUI(m.createdAt, m.messageType, m.content),
        }));

        messages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        messages = applyGrouping(messages);

        return { messages, nextCursor, hasMore: nextCursor !== null };
      },

      async onCacheEntryAdded(
        { channelId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        try {
          await cacheDataLoaded;
        } catch {
          return;
        }

        const token = (getState() as any).auth?.accessToken;
        if (!token) return;

        connectChatSocket(token);

        const unsubscribe = subscribeTopic(
          `/user/topic/channel/${channelId}`,
          (stompMessage) => {
            try {
              const data: SocketIncomingMessage = JSON.parse(stompMessage.body);

              // Always normalise senderId to string
              const incomingSenderId = String(data.senderId ?? "");

              console.debug(
                `${LOG_TAG} socket msg — clientId:${data.clientId} messageId:${data.messageId} senderId:${incomingSenderId}`
              );

              updateCachedData((draft) => {
                // ── STEP 1: match by clientId (string comparison both sides) ──
                const byClientId =
                  data.clientId != null
                    ? draft.messages.findIndex(
                      (m) => m.clientId === String(data.clientId)
                    )
                    : -1;

                // ── STEP 2: match by messageId ─────────────────────────────
                const byMessageId =
                  data.messageId != null
                    ? draft.messages.findIndex(
                      (m) => m.messageId === data.messageId
                    )
                    : -1;

                // ── STEP 3: match pending msg from same sender with same content ──
                // Fallback for when server doesn't echo clientId at all
                const byContent =
                  byClientId === -1 && byMessageId === -1
                    ? draft.messages.findIndex(
                      (m) =>
                        m.pending &&
                        m.content === data.content &&
                        String(m.senderId) === incomingSenderId
                    )
                    : -1;

                const existingIndex =
                  byClientId !== -1
                    ? byClientId
                    : byMessageId !== -1
                      ? byMessageId
                      : byContent;

                if (existingIndex !== -1) {
                  // Merge — keep our local clientId, update everything else
                  const preserved = draft.messages[existingIndex];
                  draft.messages[existingIndex] = {
                    ...preserved,
                    ...data,
                    clientId: preserved.clientId,
                    senderId: incomingSenderId,
                    pending: false,
                    failed: false,
                    ...computeMessageUI(
                      data.createdAt ?? preserved.createdAt,
                      data.messageType ?? preserved.messageType,
                      data.content ?? preserved.content
                    ),
                  };
                } else {
                  // Genuinely new message from someone else
                  draft.messages.push({
                    ...data,
                    senderId: incomingSenderId,
                    clientId:
                      data.clientId ??
                      data.messageId?.toString() ??
                      `srv-${Date.now()}`,
                    pending: false,
                    failed: false,
                    ...computeMessageUI(
                      data.createdAt,
                      data.messageType,
                      data.content
                    ),
                  });
                }

                // Recompute grouping after every change
                const regrouped = applyGrouping([...draft.messages]);
                draft.messages.length = 0;
                draft.messages.push(...regrouped);
              });
            } catch (err) {
              console.error(`${LOG_TAG} socket parse error`, err);
            }
          }
        );

        await cacheEntryRemoved;
        unsubscribe();
        disconnectChatSocket();
      },
    }),

    // ─── LOAD OLDER MESSAGES ───────────────────────
    loadOlderMessages: builder.mutation<
      { messages: Message[]; nextCursor: string | null; hasMore: boolean },
      { channelId: string; cursor: string }
    >({
      async queryFn({ channelId, cursor }, _api, _extraOptions, baseQuery) {
        const result = await baseQuery(
          `/messages/getAllMessages/${channelId}?cursor=${cursor}&limit=${PAGE_SIZE}`
        );
        if (result.error) return { error: result.error };

        const res = result.data as any;
        const rawMessages: Message[] = Array.isArray(res) ? res : res.messages ?? [];
        const nextCursor: string | null = Array.isArray(res) ? null : (res.nextCursor ?? null);

        const messages = rawMessages
          .map((m) => ({
            ...m,
            senderId: String(m.senderId ?? ""),
            clientId:
              m.clientId ?? m.messageId?.toString() ?? `srv-${m.createdAt}`,
            pending: false,
            failed: false,
            ...computeMessageUI(m.createdAt, m.messageType, m.content),
          }))
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        return { data: { messages, nextCursor, hasMore: nextCursor !== null } };
      },

      async onQueryStarted({ channelId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            chatApi.util.updateQueryData("getMessages", { channelId }, (draft) => {
              const existingIds = new Set(draft.messages.map((m) => m.clientId));
              const newMsgs = data.messages.filter(
                (m) => !existingIds.has(m.clientId)
              );
              const combined = applyGrouping([...newMsgs, ...draft.messages]);
              draft.messages.length = 0;
              draft.messages.push(...combined);
              draft.nextCursor = data.nextCursor;
              draft.hasMore = data.hasMore;
            })
          );
        } catch (err) {
          console.error(`${LOG_TAG} loadOlderMessages failed`, err);
        }
      },
    }),

    // ─── SEND MESSAGE ──────────────────────────────
    sendMessage: builder.mutation<boolean, SendMessagePayload>({
      async onQueryStarted(
        { channelId, content, messageType = "TEXT", attachmentUploadIds },
        { dispatch, getState }
      ) {
        const currentUserId = String(
          (getState() as any).auth?.userId ??
          (getState() as any).auth?.user?.id ??
          "me"
        );
        const clientId = `local-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

        console.debug(
          `${LOG_TAG} sendMessage clientId:${clientId} sender:${currentUserId}`
        );

        dispatch(
          chatApi.util.updateQueryData("getMessages", { channelId }, (draft) => {
            const createdAt = new Date().toISOString();
            const ui = computeMessageUI(createdAt, messageType, content);

            const prev =
              draft.messages.length > 0
                ? draft.messages[draft.messages.length - 1]
                : null;
            const isGrouped =
              prev != null &&
              prev.senderId === currentUserId &&
              ui.createdAtMs - prev.createdAtMs < 5 * 60 * 1000;

            draft.messages.push({
              clientId,
              content,
              createdAt,
              channelId: Number(channelId),
              senderId: currentUserId,
              messageType,
              pending: true,
              failed: false,
              ...ui,
              isGrouped,
            });
          })
        );

        publishWhenReady(
          `/app/chat.send/${channelId}`,
          // ← clientId goes in the payload so Spring can echo it back
          
          JSON.stringify({ content, clientId, attachmentUploadIds, messageType }),
          () => {
            console.debug(`${LOG_TAG} publish ✓ ${clientId}`);
          },
          (err) => {
            console.error(`${LOG_TAG} publish failed`, err);
            dispatch(
              chatApi.util.updateQueryData(
                "getMessages",
                { channelId },
                (draft) => {

                  const msg = draft.messages.find(
                    (m) => m.clientId === clientId
                  );
                  if (msg) {
                    msg.pending = false;
                    msg.failed = true;
                  }
                }
              )
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