import { api } from "../store/api";
import { CommunityPostsRes, FeedType } from "../types/types";


export const feedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFeedPosts: builder.query<
      CommunityPostsRes,
      { feedtype: FeedType; cursor: string; keyword: string; courseId: string; limit: string }
    >({
      query: ({ feedtype, cursor, keyword, courseId, limit }) => ({
        url: "feed/getFeed",
        method: "GET",
        params: { feedType: feedtype, cursor, keyword, courseId, limit }
      }),

      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },

      merge: (currentCache, newItems) => {
        currentCache.communityPosts.push(...newItems.communityPosts);
        currentCache.nextCursor = newItems.nextCursor;
        currentCache.hasNext = newItems.hasNext;
      },

      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.cursor !== previousArg?.cursor;
      },

    }),
    createPost: builder.mutation({
      query: body => ({
        url: "/posts",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),
    reactToPost: builder.mutation<void, { postId: number; postReactionType: "LIKE" | "DISLIKE" | "UNLIKE" | "UNDISLIKE" }>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        if (arg.postReactionType !== "LIKE") {

          return { data: null as any };
        }
        const result = await baseQuery({
          url: "/feed/reacttopost",
          method: "POST",
          params: { postId: arg.postId, postReactionType: arg.postReactionType },
        });
        if (result.error) return { error: result.error as any };
        return { data: null as any };
      },
      async onQueryStarted({ postId, postReactionType }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          feedApi.util.updateQueryData('getFeedPosts', undefined as any, (draft) => {
            const post = draft.communityPosts.find(p => String(p.postId) === String(postId));
            if (post) {
              if (postReactionType === "LIKE") {
                if (post.disliked) {
                  post.disliked = false;
                  post.statsDto.dislikes = Math.max(0, (post.statsDto.dislikes || 0) - 1);
                }
                post.liked = true;
                post.statsDto.likes = (post.statsDto.likes || 0) + 1;
              } else if (postReactionType === "UNLIKE") {
                post.liked = false;
                post.statsDto.likes = Math.max(0, (post.statsDto.likes || 0) - 1);
              } else if (postReactionType === "DISLIKE") {
                if (post.liked) {
                  post.liked = false;
                  post.statsDto.likes = Math.max(0, (post.statsDto.likes || 0) - 1);
                }
                post.disliked = true;
                post.statsDto.dislikes = (post.statsDto.dislikes || 0) + 1;
              } else if (postReactionType === "UNDISLIKE") {
                post.disliked = false;
                post.statsDto.dislikes = Math.max(0, (post.statsDto.dislikes || 0) - 1);
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    })
  })
})
export const { useGetFeedPostsQuery, useReactToPostMutation } = feedApi
