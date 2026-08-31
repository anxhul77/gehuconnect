
import { api } from "@/src/store/api";
import { CommunityMemberDto, CommunityRoleDto, RoleCardDto } from "@/src/types/types";
import { hasPermission, PERMISSION_GROUPS, transformPermissionSettings } from "@/src/utils/RoleHelpers";

export const roleApi = api.injectEndpoints({
    endpoints: (builder) => ({

        getRoles: builder.query<{ defaultRoles: RoleCardDto[], customRoles: RoleCardDto[], roles: RoleCardDto[] }, string>({
            query: (communityId) => ({
                method: "GET",
                url: `communityRole/roleCards/${communityId}`,
            }),
            transformResponse: (response: RoleCardDto[], meta, arg): { defaultRoles: RoleCardDto[], customRoles: RoleCardDto[], roles: RoleCardDto[] } => {

                const defaultRoles = response.filter((r) => r.isDefaultRole);
                const customRoles = response.filter((r) => !r.isDefaultRole);
                return { defaultRoles, customRoles, roles: response };

            },
        }),


        getRole: builder.query<CommunityRoleDto & { permissionGroups: any[] }, string>({
            query: (roleId: string) => ({
                method: "GET",
                url: `communityRole/role/${roleId}`,
            }),
            transformResponse: (response: CommunityRoleDto & { permissionGroups: any[] }) => {
                return {
                    ...response,
                    permissionGroups: PERMISSION_GROUPS.map(group => ({
                        ...group,
                        permissions: group.permissions.map(permission => ({
                            ...permission,
                            isEnabled: hasPermission(response.permissionsMask, permission.bit as string),
                        })),
                    })),
                };
            }


        }),

        changePermission: builder.mutation<void, { roleId: string, communityId: string, permissionMask: string, permissionTypeIndex: number, permissionIndex: number }>({
            query: ({ roleId, communityId, permissionMask }) => ({
                method: "PATCH",
                url: `communityRole/permission/${roleId}/${communityId}`,
                body: { permissionMask },
            }),
            async onQueryStarted({ roleId, permissionMask, permissionTypeIndex, permissionIndex, }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    roleApi.util.updateQueryData('getRole', roleId, (draft) => {

                        draft.permissionsMask = permissionMask;

                        draft.permissionGroups[permissionTypeIndex].permissions[permissionIndex].isEnabled = !draft.permissionGroups[permissionTypeIndex].permissions[permissionIndex].isEnabled;
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            }
        }),
        channelPermissionOverride: builder.query<{ allowedPermissions: string, deniedPermissions: string }, { channelId: string, overrideTypeId: string, permissionOverrideType: 'ROLE' | 'MEMBER' }>({
            query: ({ channelId, overrideTypeId, permissionOverrideType }) => {
                return {
                    method: "GET",
                    url: `communityRole/channelPermissionsOverride`,
                    params: {
                        channelId,
                        overrideTypeId,
                        permissionOverrideType
                    }
                }
            },
            transformResponse: (response: { allowedPermissions: string, deniedPermissions: string } & { channelPermissionSettings: any[] }) => {

                return {
                    ...response, channelPermissionSettings: transformPermissionSettings(response)
                };
            }
        }),
        categoryPermissionOverride: builder.query<{ allowedPermissions: string, deniedPermissions: string }, { categoryId: string, overrideTypeId: string, permissionOverrideType: 'ROLE' | 'MEMBER' }>({
            query: ({ categoryId, overrideTypeId, permissionOverrideType }) => {

                return {
                    method: "GET",
                    url: `communityRole/categoryPermissionsOverride`,
                    params: {
                        categoryId,
                        overrideTypeId,
                        permissionOverrideType
                    }
                }
            },
            transformResponse: (response: { allowedPermissions: string, deniedPermissions: string } & { channelPermissionSettings: any[] }) => {

                return {
                    ...response, channelPermissionSettings: transformPermissionSettings(response)
                };
            }
        }),
        updateChannelPermissionOverride: builder.mutation<void, {
            communityId: string;
            channelId: string;
            overrideTypeId: string;
            permissionOverrideType: 'ROLE' | 'MEMBER';
            allowedMask: string;
            deniedMask: string;
            groupIdx: number;
            permissionIndex: number;
            permissionStatus: "ALLOW" | "DENY" | "INHERIT";
        }>({
            query: ({ communityId, channelId, overrideTypeId, permissionOverrideType, allowedMask, deniedMask, groupIdx, permissionIndex, permissionStatus }) => ({
                method: "PATCH",
                url: `communityRole/channel-permissions/${communityId}/${channelId}/${overrideTypeId}`,
                params: {
                    permissionOverrideType,
                    allowedMask,
                    deniedMask,
                },
            }),
            async onQueryStarted({ channelId, overrideTypeId, permissionOverrideType, groupIdx, permissionIndex, allowedMask, deniedMask, permissionStatus }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    roleApi.util.updateQueryData('channelPermissionOverride', { channelId, overrideTypeId, permissionOverrideType }, (draft) => {
                        draft.allowedPermissions = allowedMask;
                        draft.deniedPermissions = deniedMask;
                        draft.channelPermissionSettings[groupIdx].permissions[permissionIndex].state = permissionStatus
                    }))
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
        updateCategoryPermissionOverride: builder.mutation<void, {
            communityId: string;
            categoryId: string;
            overrideTypeId: string;
            permissionOverrideType: 'ROLE' | 'MEMBER';
            allowedMask: string;
            deniedMask: string;
            groupIdx: number;
            permissionIndex: number;
            permissionStatus: "ALLOW" | "DENY" | "INHERIT";
        }>({
            query: ({ communityId, categoryId, overrideTypeId, permissionOverrideType, allowedMask, deniedMask, groupIdx, permissionIndex, permissionStatus }) => ({
                method: "PATCH",
                url: `communityRole/category-permissions/${communityId}/${categoryId}/${overrideTypeId}`,
                params: {
                    permissionOverrideType,
                    allowedMask,
                    deniedMask,
                },
            }),
            async onQueryStarted({ categoryId, overrideTypeId, permissionOverrideType, groupIdx, permissionIndex, allowedMask, deniedMask, permissionStatus }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    roleApi.util.updateQueryData('categoryPermissionOverride', { categoryId, overrideTypeId, permissionOverrideType }, (draft) => {
                        draft.allowedPermissions = allowedMask;
                        draft.deniedPermissions = deniedMask;
                        draft.channelPermissionSettings[groupIdx].permissions[permissionIndex].state = permissionStatus
                    }))
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
        getChannelOverridenMembers: builder.query<CommunityMemberDto[], string>({
            query: (channelId: string) => ({
                method: "GET",
                url: `communityRole/channelOverride/member/${channelId}`,
            }),
        }),
        getCategoryOverridenMembers: builder.query<CommunityMemberDto[], string>({
            query: (categoryId: string) => ({
                method: "GET",
                url: `communityRole/channelOverride/member/${categoryId}`,
            }),
        }),
    })
})


export const {
    useGetRolesQuery,
    useGetRoleQuery,
    useChangePermissionMutation,
    useCategoryPermissionOverrideQuery,
    useChannelPermissionOverrideQuery,
    useUpdateChannelPermissionOverrideMutation,
    useUpdateCategoryPermissionOverrideMutation,
    useGetChannelOverridenMembersQuery,
    useGetCategoryOverridenMembersQuery,
} = roleApi;

