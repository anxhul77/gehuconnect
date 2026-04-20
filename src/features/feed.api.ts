import { api } from "../store/api";
import { CommunityPostsRes, FeedType } from "../types/types";


export const feedApi=api.injectEndpoints({
  endpoints:(builder)=>({
  getFeedPosts: builder.query<
  {post:CommunityPostsRes},
  { feedtype:FeedType;cursor:string;keyword:string;courseId:string;limit:string }
>({
  query: ({ feedtype,cursor,keyword,courseId,limit }) => ({
    url: "feed/getFeed",
    method: "GET",
    params:{feedType:feedtype,cursor,keyword,courseId,limit}
  }),

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
