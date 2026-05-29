import { api } from "../store/api";
import { Communities, Community, CommunityCardResponse, CommunityProfileResponse, CommunityPostsRes, CommunitySortType, CommunityRailResponse, ChannelCategoryDto } from "../types/types";

export const communityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCommunities: builder.query<
      CommunityCardResponse,
      {
        cursor?: string;
        limit: number;
        keyword?: string;
        communitySortType: CommunitySortType;
      }
    >({
      query: ({ cursor, limit, keyword, communitySortType }) => ({
        method: "GET",
        url: "/community/getCommunities",
        params: { cursor, limit, keyword, communitySortType },
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { cursor, ...rest } = queryArgs;
        return { endpointName, ...rest };
      },
      merge: (currentCache, newItems) => {
        if (!currentCache.communities) {
          currentCache.communities = [];
        }
        const existingIds = new Set(currentCache.communities.map(c => c.communityId));
        newItems.communities.forEach(c => {
          if (!existingIds.has(c.communityId)) {
            currentCache.communities.push(c);
          }
        });
        currentCache.cursor = newItems.cursor;
        currentCache.hasNext = newItems.hasNext;
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.cursor !== previousArg?.cursor ||
          currentArg?.keyword !== previousArg?.keyword ||
          currentArg?.communitySortType !== previousArg?.communitySortType
        );
      }
    }),
    getCommunity: builder.query<Community, string>({
      query: (id) => ({
        method: "GET",
        url: `/community/getCommunity/${id}`,
      }),
    }),
    getCommunityRail: builder.query<CommunityRailResponse, { cursor?: string; limit?: number }>({
      query: ({ cursor, limit }) => ({
        method: "GET",
        url: `/community/communityRail`,
        params: { cursor, limit },
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
    getCommunityPosts: builder.query<CommunityPostsRes, { communityId: string; cursor: string; limit: string }>(
      {
        query: ({ communityId, cursor, limit }) => ({
          method: "GET",
          url: "/feed/getCommunityPosts",
          params: { communityId: communityId, cursor: cursor, limit: limit }
        }),
        serializeQueryArgs: ({ endpointName, queryArgs }) => ({
          endpointName,
          communityId: queryArgs.communityId,
        }),

        merge: (currentCache, newItems) => {
          const existing = new Map(
            currentCache.communityPosts.map((p) => [p.postId, p])
          );

          newItems.communityPosts.forEach((p) => {
            existing.set(p.postId, p);
          });

          currentCache.communityPosts = Array.from(existing.values());

          currentCache.nextCursor = newItems.nextCursor;
          currentCache.hasNext = newItems.hasNext;
        },

        forceRefetch({ currentArg, previousArg }) {
          return currentArg?.cursor !== previousArg?.cursor;
        },
      }
    ),
    createCommunity: builder.mutation<
      any,
      {
        name: string;
        description: string;
        profileAvatar: string;
        profileBanner: string;
        tags: string[];
      }
    >({
      query: (data) => ({
        method: "POST",
        url: "/community/create",
        body: data,
      }),
    }),
    getCommunityProfile: builder.query<CommunityProfileResponse, number>({
      query: (communityId) => ({
        method: "GET",
        url: "/community/profile",
        params: { communityId },
      }),
    }),
    getCommunityChannelCategories: builder.query<ChannelCategoryDto[], number>({
      query: (communityId) => ({
        method: "GET",
        url: "/community/getChannelCategories",
        params: { communityId },
      }),
    }),
    addChannel: builder.mutation<
      any,
      {
        channelDto: {
          name: string;
          description?: string;
          type: "TEXT" | "VOICE";
          status: "PUBLIC" | "PRIVATE";
        };
        channelCategoryId: number;
      }
    >({
      query: ({ channelDto, channelCategoryId }) => ({
        method: "POST",
        url: "/community/channel",
        body: channelDto,
        params: { channelCategoryId },
      }),
    }),
  }),
});
export const { useGetCommunityRailQuery, useGetCommunitiesQuery, useGetCommunityQuery,
  useAddCommunityPostMutation, useGetCommunityPostsQuery, useGetCommunityChannelCategoriesQuery,
  useCreateCommunityMutation, useGetCommunityProfileQuery, useAddChannelMutation } = communityApi