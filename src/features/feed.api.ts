import { api } from "../store/api";
import { FeedPost } from "../types/types";

export const feedApi=api.injectEndpoints({
  endpoints:(builder)=>({
  getFeedPosts: builder.query<
  { posts: FeedPost[]; nextCursor?: string },
  { cursor?: string }
>({
  query: ({ cursor }) => ({
    url: "/getGlobalFeed",
    method: "GET",
    params: cursor ? { cursor } : undefined,
  }),

  serializeQueryArgs: ({ endpointName }) => endpointName,

  merge: (currentCache, newData) => {
    const existingIds = new Set(currentCache.posts.map(p => p.id));

    const uniquePosts = newData.posts.filter(
      p => !existingIds.has(p.id)
    );

    currentCache.posts.push(...uniquePosts);
    currentCache.nextCursor = newData.nextCursor;
  },

  forceRefetch({ currentArg, previousArg }) {
    return currentArg?.cursor !== previousArg?.cursor;
  },

  providesTags: result =>
    result
      ? [
          ...result.posts.map(({ id }) => ({
            type: "Post" as const,
            id,
          })),
          { type: "Post", id: "LIST" },
        ]
      : [{ type: "Post", id: "LIST" }],
}),
createPost: builder.mutation({
  query: body => ({
    url: "/posts",
    method: "POST",
    body,
  }),
  invalidatesTags: [{ type: "Post", id: "LIST" }],
}),

    
  })
})
export const { useGetFeedPostsQuery } = feedApi
