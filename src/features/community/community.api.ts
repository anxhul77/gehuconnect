
import { api } from "../../store/api";
import {
  CommunityCardResponse, CommunityProfileResponse, CommunityPostsRes,
  CommunitySortType, CommunityRailResponse, ChannelCategoryDto, CommunitySideBarDto,
  CommunityResponseDto, FeedSettingDto, EventSettingDto, ModerationSettingDto,
  CommunityMemberDto, CommunityMemberStatus, CommunityAuditLogDto
} from "../../types/types";
import { buildCommunityPost } from "../../utils/CommuityPostUtil";
import { eventSettings, feedSettings, hasPermission, moderationSettings } from "@/src/utils/RoleHelpers";

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
    getCommunitySideBar: builder.query<CommunitySideBarDto[], string>({
      query: (id) => ({
        method: "GET",
        url: `/community/getCommunitySideBar/${id}`,
      }),
    }),
    getCommunityRail: builder.query<{

      entities: Record<string, CommunityResponseDto>;
      ids: string[];
      cursor: string;
      hasNext: boolean;
    }, { cursor?: string; limit?: number }>({
      query: ({ cursor, limit }) => ({
        method: "GET",
        url: `/community/communityRail`,
        params: { cursor, limit },
      }),
      transformResponse: (response: CommunityRailResponse) => {
        const entities: Record<string, CommunityResponseDto> = {};
        const ids: string[] = [];

        for (const community of response.communities) {
          const id = String(community.id);

          entities[id] = community;
          ids.push(id);
        }

        return {
          ids,

          entities,
          cursor: response.cursor,
          hasNext: response.hasNext,
        };
      }
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
    getCommunityPosts: builder.query<CommunityPostsRes & { postIndexMap: Record<number, number> }, { communityId: string; cursor: string; limit: string }>(
      {
        query: ({ communityId, cursor, limit }) => ({
          method: "GET",
          url: "/feed/getCommunityPosts",
          params: { communityId: communityId, cursor: cursor, limit: limit }
        }),
        transformResponse: (response: CommunityPostsRes) => buildCommunityPost(response),
        serializeQueryArgs: ({ endpointName, queryArgs }) => ({
          endpointName,
          communityId: queryArgs.communityId,
        }),

        merge: (currentCache, newItems) => {
          for (const post of newItems.communityPosts) {

            currentCache.postIndexMap[post.postId] =
              currentCache.communityPosts.length;

            currentCache.communityPosts.push(post);
          }

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
    getCommunityChannelCategories: builder.query<{ textChannels: ChannelCategoryDto[], voiceChannels: ChannelCategoryDto[] }, number>({
      query: (communityId) => ({
        method: "GET",
        url: "/community/getChannelCategories",
        params: { communityId },
      }),
      transformResponse: (response: ChannelCategoryDto[]) => {
        const grouped = response.reduce(
          (acc, item) => {
            if (item.channelCategoryType === 'TEXT') {
              acc.textChannels.push(item)
            } else if (item.channelCategoryType === 'VOICE') {
              acc.voiceChannels.push(item)
            }

            return acc
          },
          {
            textChannels: [] as ChannelCategoryDto[],
            voiceChannels: [] as ChannelCategoryDto[],
          }
        )

        return grouped
      }
    }),
    joinCommunity: builder.mutation<
      any,
      {
        communityId: string;

      }
    >({
      query: (data) => ({
        method: "POST",
        url: "/community/joinCommunity",
        params: data
      }),
    }),

    getCommunityFeedSettings: builder.query<FeedSettingDto & { feedSettings: any[] }, number | string>({
      query: (communityId) => ({
        method: "GET",
        url: `/community/feed-settings/${communityId}`,
      }),
      transformResponse: (response: FeedSettingDto & { feedSettings: any[] }) => {
        return {
          ...response,
          feedSettings: feedSettings.map(group => ({
            ...group,
            permissions: group.permissions.map(permission => ({
              ...permission,
              isEnabled: hasPermission(response.permissionMask, permission.bit as string),
            })),
          })),
        };
      }
    }),
    getCommunityEventSettings: builder.query<EventSettingDto & { eventSettings: any[] }, number | string>({
      query: (communityId) => ({
        method: "GET",
        url: `/community/event-settings/${communityId}`,
      }),
      transformResponse: (response: EventSettingDto & { eventSettings: any[] }) => {
        return {
          ...response,
          eventSettings: eventSettings.map(group => ({
            ...group,
            permissions: group.permissions.map(permission => ({
              ...permission,
              isEnabled: hasPermission(response.permissionMask, permission.bit as string),
            })),
          })),
        };
      }
    }),
    getCommunityModerationSettings: builder.query<ModerationSettingDto & { moderationSettings: any[] }, number | string>({
      query: (communityId) => ({
        method: "GET",
        url: `/community/moderation-settings/${communityId}`,
      }),
      transformResponse: (response: ModerationSettingDto & { moderationSettings: any[] }) => {
        return {
          ...response,
          moderationSettings: moderationSettings.map(group => ({
            ...group,
            permissions: group.permissions.map(permission => ({
              ...permission,
              isEnabled: hasPermission(response.permissionMask, permission.bit as string),
            })),
          })),
        };
      }
    }),
    updateFeedSettings: builder.mutation<
      void,
      {
        communityId: number | string;
        dto: Record<string, any>;
        permissionMask?: string;
        groupIdx?: number;
        permissionIdx?: number;
        isOther?: boolean
      }
    >({
      query: ({ communityId, dto }) => ({
        method: "PATCH",
        url: `/community/feedSettings/${communityId}`,
        body: dto,
      }),

      onQueryStarted: async ({ communityId, groupIdx, permissionIdx, permissionMask, isOther = false, dto }, { queryFulfilled, dispatch }) => {
        const patch = dispatch(communityApi.util.updateQueryData("getCommunityFeedSettings", communityId, (draft) => {
          if (!isOther) {
            draft.permissionMask = permissionMask!;
            draft.feedSettings[groupIdx!].permissions[permissionIdx!].isEnabled = !draft.feedSettings[groupIdx!].permissions[permissionIdx!].isEnabled;
          }
          else {
            draft.maximumPostLength = dto.maximumPostLength

          }
        }))
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      }
    }),
    updateEventSettings: builder.mutation<
      void,
      {
        communityId: number | string;
        dto: Record<string, any>;
        permissionMask?: string;
        groupIdx?: number;
        permissionIdx?: number;
        isOther?: boolean
      }
    >({
      query: ({ communityId, dto }) => ({
        method: "PATCH",
        url: `/community/eventSettings/${communityId}`,
        body: dto,
      }),
      onQueryStarted: async ({ communityId, groupIdx, permissionIdx, permissionMask, isOther = false, dto }, { queryFulfilled, dispatch }) => {
        const patch = dispatch(communityApi.util.updateQueryData("getCommunityEventSettings", communityId, (draft) => {
          if (!isOther) {
            draft.permissionMask = permissionMask!;
            draft.eventSettings[groupIdx!].permissions[permissionIdx!].isEnabled = !draft.eventSettings[groupIdx!].permissions[permissionIdx!].isEnabled;
          } else {
            if (dto.remainderDuration !== undefined) {
              draft.remainderDuration = dto.remainderDuration;
            }
            if (dto.maximumParticipants !== undefined) {
              draft.maximumParticipants = dto.maximumParticipants;
            }
          }
        }))
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      }
    }),
    updateModerationSettings: builder.mutation<
      void,
      {
        communityId: number | string;
        dto: Record<string, any>;
        permissionMask?: string;
        groupIdx?: number;
        permissionIdx?: number;



      }
    >({
      query: ({ communityId, dto }) => ({
        method: "PATCH",
        url: `/community/moderationSettings/${communityId}`,
        body: dto,
      }),
      onQueryStarted: async ({ communityId, groupIdx, permissionIdx, permissionMask, dto }, { queryFulfilled, dispatch }) => {
        const patch = dispatch(communityApi.util.updateQueryData("getCommunityModerationSettings", communityId, (draft) => {
          if (dto.permissionMask !== undefined) {

            draft.permissionMask = permissionMask!;

            draft.moderationSettings[groupIdx!].permissions[permissionIdx!].isEnabled = !draft.moderationSettings[groupIdx!].permissions[permissionIdx!].isEnabled;
          }
          if (dto.verificationLevel !== undefined) {
            draft.verificationLevel = dto.verificationLevel

          }
          if (dto.maximumAccountAgeDays !== undefined) {
            draft.maximumAccountAgeDays = dto.maximumAccountAgeDays
          }

        }))
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      }
    }),
    getBlockedWords: builder.query<string[], number | string>({
      query: (communityId) => ({
        method: "GET",
        url: `/community/blockedWords/${communityId}`,
      }),
    }),
    addBlockedWords: builder.mutation<
      void,
      {
        communityId: number | string;
        words: string[];
      }
    >({
      query: ({ communityId, words }) => ({
        method: "POST",
        url: `/community/blockedWords/${communityId}`,
        body: words,
      }),
    }),
    getCommunityMembers: builder.query<
      { content: CommunityMemberDto[]; nextCursor: string; hasNext: boolean },
      {
        communityId: number | string;
        keyword?: string;
        status?: CommunityMemberStatus;
        roleId?: number;
        cursor?: string;
        limit?: number;
      }
    >({
      query: ({ communityId, keyword, status, roleId, cursor, limit = 20 }) => ({
        method: "GET",
        url: `/community/communities/${communityId}/members`,
        params: { keyword, status, roleId, cursor, limit },
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { cursor, ...rest } = queryArgs;
        return { endpointName, ...rest };
      },
      merge: (currentCache, newItems) => {
        if (!currentCache.content) {
          currentCache.content = [];
        }
        const existingIds = new Set(currentCache.content.map(m => m.id));
        newItems.content.forEach(m => {
          if (!existingIds.has(m.id)) {
            currentCache.content.push(m);
          }
        });
        currentCache.nextCursor = newItems.nextCursor;
        currentCache.hasNext = newItems.hasNext;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.cursor !== previousArg?.cursor;
      },
    }),
    getAuditLogs: builder.query<
      { content: CommunityAuditLogDto[]; nextCursor: string; hasNext: boolean },
      {
        communityId: number | string;
        keyword?: string;
        actorId?: number;
        targetMemberId?: number;
        action?: string;
        cursor?: string;
        limit?: number;
      }
    >({
      query: ({ communityId, keyword, actorId, targetMemberId, action, cursor, limit = 20 }) => ({
        method: "GET",
        url: `/community/communities/${communityId}/audit-logs`,
        params: { keyword, actorId, targetMemberId, action, cursor, limit },
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { cursor, ...rest } = queryArgs;
        return { endpointName, ...rest };
      },
      merge: (currentCache, newItems) => {
        if (!currentCache.content) {
          currentCache.content = [];
        }
        const existingIds = new Set(currentCache.content.map(log => log.id));
        newItems.content.forEach(log => {
          if (!existingIds.has(log.id)) {
            currentCache.content.push(log);
          }
        });
        currentCache.nextCursor = newItems.nextCursor;
        currentCache.hasNext = newItems.hasNext;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.cursor !== previousArg?.cursor;
      },
    }),

    updateCommunity: builder.mutation<void, { dto: Record<string, any>, communityId: string }>(
      {
        query: ({ dto, communityId }) => ({
          method: "PATCH",
          url: `/communities/${communityId}`,
          body: dto,

        })
      }
    )
  }),

});
export const { useGetCommunityRailQuery, useGetCommunitiesQuery, useGetCommunitySideBarQuery,
  useAddCommunityPostMutation, useGetCommunityPostsQuery, useGetCommunityChannelCategoriesQuery,
  useCreateCommunityMutation, useGetCommunityProfileQuery, useJoinCommunityMutation,
  useGetCommunityFeedSettingsQuery, useGetCommunityEventSettingsQuery, useGetCommunityModerationSettingsQuery,
  useUpdateFeedSettingsMutation, useUpdateEventSettingsMutation, useUpdateModerationSettingsMutation,
  useGetBlockedWordsQuery, useAddBlockedWordsMutation, useGetCommunityMembersQuery, useGetAuditLogsQuery } = communityApi