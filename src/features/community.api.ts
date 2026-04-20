import { api } from "../store/api";
import { Communities, Community, CommunityPostsRes } from "../types/types";

export const communityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCommunities: builder.query<Communities[], void>({
      query: () => ({
        method: "GET",
        url: "/community/getAllCommunities",
      }),
    }),
    getCommunity: builder.query<Community, string>({
      query: (id) => ({
        method: "GET",
        url: `/community/getCommunity/${id}`,
      }),
    }),
    addCommunityPost: builder.mutation<
      void,
      {
        title: string;
        channelId: string;
        communityId: string;
        content: string;
        tags: string[];
        uploadIds: string[];
        courseId: string[];
      }
    >({
      query: (data) => ({
        method: "POST",
        url: "/feed/addPost",
        body: data,
      }),
    }),
    getCommunityPosts:builder.query<CommunityPostsRes,{channelId:string;cursor:string;limit:string}>(
      {
    query:({channelId,cursor,limit})=>({
        method:"GET",
        url:"/feed/getCommunityPosts",
        params:{channelId:channelId,cursor:cursor,limit:limit}
    })
      }
    )
  }),
});
export const { useGetCommunitiesQuery, useGetCommunityQuery, useAddCommunityPostMutation ,useGetCommunityPostsQuery} = communityApi;