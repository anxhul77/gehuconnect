import { api } from "../store/api"
import { Message } from "../types/types"
import { Client } from "@stomp/stompjs"
import { setStompClient, getStompClient } from "@/src/lib/socket"

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===============================
    // GET MESSAGES
    // ===============================
    getMessages: builder.query<
      { messages: Message[] },
      { channelId: string }
    >({
      query: ({ channelId }) => ({
        url: `/messages/getAllMessages/${channelId}`,
        method: "GET",
      }),

      transformResponse: (response: Message[]) => {
        return { messages: response }
      },

      async onCacheEntryAdded(
        { channelId },
        {
          updateCachedData,
          cacheDataLoaded,
          cacheEntryRemoved,
          getState,
        }
      ) {
        await cacheDataLoaded

        const token = (getState() as any).auth.accessToken

      const stompClient = new Client({
   
       
 webSocketFactory: () => {
    return new WebSocket(`${process.env.EXPO_PUBLIC_WS_URL}/ws`);
  },
  connectHeaders: {
    Authorization: `Bearer ${token}`,
  },

  reconnectDelay: 5000,
   forceBinaryWSFrames: true,
  appendMissingNULLonIncoming: true,
  debug: (str) => {
    console.log("STOMP:", str);
  },
    onStompError: (frame) => {
    console.error("STOMP error:", frame.headers['message'], frame.body);
  },
  onWebSocketError: (event) => {
    console.error("WebSocket error:", event);
  },
  onDisconnect: () => {
    console.log("STOMP disconnected");
  },
});

        stompClient.onConnect = () => {
           setStompClient(stompClient)
          stompClient.subscribe(
            `/topic/channel/${channelId}`,
            (message) => {
              const data: Message = JSON.parse(message.body)

              updateCachedData((draft) => {
                const exists = draft.messages.some(
                  (m) => m.messageId === data.messageId
                )

                if (!exists) {
                  draft.messages.push({
                    ...data,
                  })
                }
              })
            }
          )
        }

        stompClient.activate()
       

        await cacheEntryRemoved
        stompClient.deactivate()
      },
    }),


    sendMessage: builder.mutation<
      boolean,
      { channelId: string; content: string }
    >({
      async onQueryStarted(
        { channelId, content },
        { dispatch }
      ) {
        const tempId = Date.now()
          console.log("channelid",channelId,content)
        const patchResult = dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            { channelId },
            (draft) => {
              draft.messages.push({
                messageId: tempId, // temporary id
                content,
                createdAt: new Date().toISOString(),
                channelId: Number(channelId),
                messageType: "TEXT",
                senderId: "me",
                senderAvatar: "",
                attachmentResponseDto: [],
              })
            }
          )
        )

        try {
          const stompClient = getStompClient()

          if (!stompClient || !stompClient.connected) {
            throw new Error("Socket not connected")
          }

          stompClient.publish({
            destination: `/app/chat.send/${channelId}`,
            body: JSON.stringify({
              content,
              messageType: "TEXT",
              attachments: [],
            }),
          })
         console.log("published")
        } catch (error) {
          console.log(error)
          patchResult.undo()
        }
      },

      queryFn: async () => {
        return { data: true }
      },
    }),

  }),
  overrideExisting: true,
})

export const {
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApi