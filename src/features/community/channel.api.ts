import { api } from "@/src/store/api";
import { communityApi } from "./community.api";
import { CommunitySideBarDto, ReorderChannelDto, ReorderType } from "@/src/types/types";



export const channelApi = api.injectEndpoints({
    endpoints: (builder) => ({
        updateCommunityChannel: builder.mutation<void, { channelId: string, dto: Record<string, any>, communityId: string, idx: number }>(
            {
                query: ({ channelId, dto, communityId }) => ({
                    method: "PATCH",
                    url: `/channel/${communityId}/channels/${channelId}`,
                    body: dto,

                }),
                onQueryStarted: async ({ idx, communityId, dto }, { dispatch, queryFulfilled }) => {
                    const patch = dispatch(communityApi.util.updateQueryData("getCommunitySideBar", communityId, (draft) => {

                        if (dto.name !== undefined) {
                            draft[idx].channelName = dto.name;

                        }

                        if (dto.description !== undefined) {
                            draft[idx].description = dto.description;
                        }

                    }))
                    try {
                        await queryFulfilled
                    } catch {
                        patch.undo()
                    }
                }
            }
        ),
        updateCommunityChannelCategory: builder.mutation<void, { channelCategoryId: string, dto: Record<string, any>, communityId: string, idx: number }>(
            {
                query: ({ channelCategoryId, dto, communityId }) => ({
                    method: "PATCH",
                    url: `/channel/${communityId}/channel-categories/${channelCategoryId}`,
                    body: dto,

                }),
                onQueryStarted: async ({ idx, communityId, dto }, { dispatch, queryFulfilled }) => {
                    const patch = dispatch(communityApi.util.updateQueryData("getCommunitySideBar", communityId, (draft) => {

                        if (dto.name !== undefined) {
                            draft[idx].categoryName = dto.name;
                        }

                    }))
                    try {
                        await queryFulfilled
                    } catch {
                        patch.undo()
                    }
                }
            }
        ),
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
        reorderChannelsAndCategories: builder.mutation<
            CommunitySideBarDto[],
            {
                communityId: number | string;
                reorderType: ReorderType;
                payload: ReorderChannelDto[];
            }
        >({
            query: ({ communityId, reorderType, payload }) => ({
                method: "PATCH",
                url: `/channel/reorder/${communityId}/${reorderType}`,
                body: payload,
                params: { reorderType },
            }),
            onQueryStarted: async ({ communityId }, { dispatch, queryFulfilled }) => {

                try {
                    const { data: updatedSidebar } = await queryFulfilled

                    dispatch(communityApi.util.updateQueryData("getCommunitySideBar", communityId.toString(), (draft) => {

                        draft.splice(0, draft.length, ...updatedSidebar);


                    }))
                } catch {

                }
            }
        }),

    }),

});

export const {
    useUpdateCommunityChannelMutation,
    useAddChannelMutation,
    useUpdateCommunityChannelCategoryMutation,
    useReorderChannelsAndCategoriesMutation,
} = channelApi;
