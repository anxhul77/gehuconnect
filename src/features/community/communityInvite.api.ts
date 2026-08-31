import { api } from "@/src/store/api";
import { CreateInviteRequest, InviteResponse } from "@/src/types/types";



export const communityInviteApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createCommunityInvite: builder.mutation<
            InviteResponse,
            { communityId: number | string; createInviteRequest: CreateInviteRequest }
        >({
            query: ({ communityId, createInviteRequest }) => ({
                method: "POST",
                url: `/community-invite/create/${communityId}`,
                body: createInviteRequest,
            }),
            onQueryStarted: async ({ communityId }, { dispatch, queryFulfilled }) => {

                try {
                    const { data } = await queryFulfilled
                    dispatch(communityInviteApi.util.updateQueryData("getCommunityInvite", communityId, (draft) => {
                        console.log("ran")
                        console.log(draft)
                        draft = { ...data }
                        console.log(draft)
                    }))
                } catch {

                }
            }

        }),
        getCommunityInvite: builder.query<InviteResponse, number | string>({
            query: (communityId) => ({
                method: "GET",
                url: `/community-invite/get/${communityId}`,
            }),
        }),
        updateCommunityInvite: builder.mutation<
            InviteResponse,
            { inviteId: number | string; communityId: number | string; request: Record<string, any> }
        >({
            query: ({ inviteId, communityId, request }) => ({
                method: "PATCH",
                url: `/community-invite/update/${inviteId}/${communityId}`,
                body: request,
            }),
            onQueryStarted: async ({ communityId, request }, { dispatch, queryFulfilled }) => {
                const patch = dispatch(communityInviteApi.util.updateQueryData("getCommunityInvite", communityId, (draft) => {
                    if (request.expiresInHours) {
                        draft.expiresAt = request.expiresInHours
                    } else {
                        draft.maxUses = request.maxUses
                    }
                }))
                try {
                    await queryFulfilled
                } catch {
                    patch.undo()
                }
            }
        }),
    }),
});

export const {
    useCreateCommunityInviteMutation,
    useGetCommunityInviteQuery,
    useLazyGetCommunityInviteQuery,
    useUpdateCommunityInviteMutation,
} = communityInviteApi;
