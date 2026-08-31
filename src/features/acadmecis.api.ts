import { SubsectionCategories } from "@/app/components/acadmecis/[subjectId]";
import { api } from "../store/api";
import { Course, Subject, SubsectionDto, CursorPageResponse } from "../types/types";
import { formatTime } from "../utils/ChatTimeFormmater";

export type MaterialType = "PDF" | "VIDEO" | "DOCUMENT" | "PPT" | "IMAGE" | "OTHER";

export interface MaterialDto {
  studyMaterialId?: number | string;
  downloads?: number,
  likes?: number,
  liked?: boolean,
  views?: number,
  createdAt?: string;
  fileName?: string;
  subsection?: SubsectionDto
  viewed?: boolean,
  downloaded?: boolean,
  title: string;
  materialType: MaterialType;
  fileUrl: string;
  uploadedBy?: any;
  hasMoreReviewer?: boolean
}


export interface RepoMemberDto {
  id?: number;
  name?: string;
  avatarUrl?: string;
}

export type PullRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "MERGED" | string;

export interface PullRequestDto {
  id?: number;
  note?: string;
  materialDto?: MaterialDto;
  author?: RepoMemberDto;
  subsectionDto?: SubsectionDto;
  reviewer?: RepoMemberDto[];
  createdAt?: string;
  reviewedAt?: string;
  reviewComment?: string;
  pullRequestStatus?: PullRequestStatus;
  subjectName?: string
  prCount?: number;
  decider?: RepoMemberDto

}

export type AcadRepoAuditAction =
  | "MEMBER_ADDED"
  | "MEMBER_REMOVED"
  | "ROLE_CHANGED"
  | "MATERIAL_ADDED"
  | "MATERIAL_DELETED"
  | "PR_CREATED"
  | "PR_APPROVED"
  | "PR_REJECTED"
  | "PR_MERGED"
  | "REPO_UPDATED"
  | string;

export type AcadRepoTargetType =
  | "MEMBER"
  | "MATERIAL"
  | "PULL_REQUEST"
  | "REPOSITORY"
  | string;

export interface AcadRepoAuditLogDto {
  id?: number;
  action?: AcadRepoAuditAction;
  message?: string;
  targetType?: AcadRepoTargetType;
  actorMemberDto?: RepoMemberDto;
  targetMemberDto?: RepoMemberDto;
  subsectionName?: string;
  subjectName?: string;


  metadata?: string,
  createdAt?: string;
}


export const AcadmecisApi = api.injectEndpoints({

  endpoints: (builder) => {
    return ({
      getSubject: builder.query<Subject[], string>({
        query: (semesterId) => ({
          method: "GET",
          url: `/academics/subjects/${semesterId}`,
        }),
      }),
      getCourses: builder.query<Course, { keyword: string; limit: string; cursor: string; }>({
        query: ({ keyword, limit, cursor }) => ({
          method: "GET",
          url: "/academics/courses",
          params: { cursor, keyword, limit },
        }),
      }),
      getAcadmicsPresigned: builder.mutation<
        { presignedUrl: string; key: string; },
        { mimeType: string; fileSize: number; }
      >({
        query: (data) => ({
          url: "/media/getAcadmicsPresigned",
          method: "POST",
          body: data,
        }),
      }),
      addStudyMaterial: builder.mutation<
        MaterialDto,
        { subjectId: number; material: MaterialDto; }
      >({
        query: ({ subjectId, material }) => ({
          url: `/academics/material/${subjectId}`,
          method: "POST",
          body: material,
        }),
      }),
      getSubsections: builder.query<any[], number | string>({
        query: (subjectId) => ({
          method: "GET",
          url: `/academics/subsections/${subjectId}`,
        }),
        transformResponse: (response: SubsectionDto[]) => {
          return SubsectionCategories.map((cat, idx) => {
            return {
              ...cat, id: response[idx].id, count: response[idx].count
            };
          });
        }
      }),
      getMaterials: builder.query<
        CursorPageResponse<MaterialDto>,
        { subsectionId: number | string; cursor?: string; limit?: number }
      >({
        query: ({ subsectionId, cursor, limit = 25 }) => ({
          method: "GET",
          url: `/academics/subsections/${subsectionId}/materials`,
          params: { cursor, limit },
        }),
        serializeQueryArgs: ({ endpointName, queryArgs }) => {
          const { cursor, ...rest } = queryArgs;
          return { endpointName, ...rest };
        },
        merge: (currentCache, newItems) => {
          if (!currentCache.content) {
            currentCache.content = [];
          }
          const existingIds = new Set(currentCache.content.map((m) => m.studyMaterialId));
          newItems.content?.forEach((m) => {
            if (!existingIds.has(m.studyMaterialId)) {
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
      makePullRequest: builder.mutation<
        void,
        { acadRepoId: number | string; pullRequestDto: PullRequestDto }
      >({
        query: ({ acadRepoId, pullRequestDto }) => ({
          url: `/academics/pullrequest/${acadRepoId}`,
          method: "POST",
          body: pullRequestDto,
        }),
      }),
      updatePullRequest: builder.mutation<
        void,
        { acadRepoId: number | string; pullRequestDto: PullRequestDto, updateType: string }
      >({
        query: ({ acadRepoId, pullRequestDto }) => ({
          url: `/academics/pullrequest/${acadRepoId}`,
          method: "PATCH",
          body: pullRequestDto,
        }),
        onQueryStarted: async ({ acadRepoId, pullRequestDto, updateType }, { dispatch, queryFulfilled }) => {
          const patches = []

          if (updateType === "SAVE_NOTE") {
            patches.push(
              dispatch(
                AcadmecisApi.util.updateQueryData(
                  "getPullRequests",
                  {
                    acadRepoId,
                    pullRequestStatus: "ALL",
                  },
                  (draft) => {
                    const pr = draft.content.find(
                      (p) => p.id === Number(pullRequestDto.id)
                    );

                    if (pr) {
                      pr.reviewComment = pullRequestDto.reviewComment;
                      pr.reviewedAt = formatTime(new Date().toISOString());
                    }
                  }
                )
              ),

              dispatch(
                AcadmecisApi.util.updateQueryData(
                  "getPullRequests",
                  {
                    acadRepoId,
                    pullRequestStatus: "PENDING",
                  },
                  (draft) => {
                    const pr = draft.content.find(
                      (p) => p.id === Number(pullRequestDto.id)
                    );

                    if (pr) {
                      pr.reviewComment = pullRequestDto.reviewComment;
                      pr.reviewedAt = formatTime(new Date().toISOString());
                    }
                  })));
          } else {
            patches.push(
              dispatch(AcadmecisApi.util.updateQueryData("getPullRequests", { acadRepoId, pullRequestStatus: "ALL" }, (draft) => {

                const pr = draft.content.find(
                  (p) => p.id === Number(pullRequestDto.id)
                );

                if (pr) {
                  pr.pullRequestStatus = pullRequestDto.pullRequestStatus;

                }

              }))
              ,
              dispatch(AcadmecisApi.util.updateQueryData("getPullRequests", { acadRepoId, pullRequestStatus: "PENDING" }, (draft) => {

                draft.content = draft.content.filter(
                  (p) => p.id !== Number(pullRequestDto.id)
                );



              }))

            )

          }
          try {
            await queryFulfilled;
            if (updateType !== "SAVE_NOTE") {
              if (updateType === "ACCEPTED") {
                dispatch(AcadmecisApi.util.invalidateTags([{
                  type: "PullRequest",
                  id: `LIST-${acadRepoId}-ACCEPTED`,
                }]))

              }
              if (updateType === "DISCARDED") {
                dispatch(AcadmecisApi.util.invalidateTags([{
                  type: "PullRequest",
                  id: `LIST-${acadRepoId}-DISCARDED`,
                }]))
              }
            }

          }
          catch {
            patches.forEach((p) => p.undo());
          }
        }
      }),
      getPullRequests: builder.query<
        CursorPageResponse<PullRequestDto>,
        { acadRepoId: number | string; cursor?: string; limit?: number, pullRequestStatus: string }
      >({
        query: ({ acadRepoId, cursor, limit = 20, pullRequestStatus }) => ({
          url: `/academics/pullrequest/${acadRepoId}`,
          method: "GET",
          params: { cursor, limit, pullRequestStatus: pullRequestStatus === "ALL" ? undefined : pullRequestStatus },
        }),

        serializeQueryArgs: ({ queryArgs }) => ({
          acadRepoId: queryArgs.acadRepoId,
          pullRequestStatus: queryArgs.pullRequestStatus,
        }),
        transformResponse: (response: CursorPageResponse<PullRequestDto>) => {
          return {
            ...response, content: response.content.map((m) => ({
              ...m,
              createdAt: formatTime(m.createdAt as string),
              reviewedAt: formatTime(m.reviewedAt as string),

            }))
          }
        },
        merge: (
          currentCache,
          newItems,
          { arg }
        ) => {
          if (!arg.cursor) {
            currentCache.content = newItems.content;
          } else {
            const existingIds = new Set(
              currentCache.content.map((pr) => pr.id)
            );

            const uniqueItems = newItems.content.filter(
              (pr) => !existingIds.has(pr.id)
            );

            currentCache.content.push(...uniqueItems);
          }

          currentCache.nextCursor = newItems.nextCursor;
          currentCache.hasNext = newItems.hasNext;
        },

        forceRefetch({
          currentArg,
          previousArg,
        }) {
          return (
            currentArg?.cursor !== previousArg?.cursor ||
            currentArg?.pullRequestStatus !==
            previousArg?.pullRequestStatus ||
            currentArg?.acadRepoId !== previousArg?.acadRepoId
          );
        },
        providesTags: (result, error, arg) => [
          {
            type: "PullRequest",
            id: `LIST-${arg.acadRepoId}-${arg.pullRequestStatus}`,
          },
        ],
      }),

      addLike: builder.mutation<void, { materialId: string | number; subsectionId: string; }>({
        query: ({ materialId }) => ({
          url: `/academics/materials/${materialId}/like`,
          method: "POST",
        }),
        onQueryStarted: async ({ materialId, subsectionId }, { dispatch, queryFulfilled }) => {
          const patch = dispatch(AcadmecisApi.util.updateQueryData("getMaterials", { subsectionId, limit: 25 }, (draft) => {

            const material = draft.content.find(
              (m) => m.studyMaterialId === Number(materialId)
            );

            if (material) {
              if (material.liked === true) {
                material.liked = false;
                material.likes = (material.likes || 0) - 1;
              }
              else {
                material.liked = true;
                material.likes = (material.likes || 0) + 1;
              }
            }
          }))
          try {
            await queryFulfilled;

          }
          catch {
            patch.undo();
          }
        }
      }),
      markAsRead: builder.mutation<void, { materialId: string | number; subsectionId: string; }>({
        query: ({ materialId }) => ({
          url: `/academics/materials/${materialId}/mark-as-read`,
          method: "POST",
        }),
        onQueryStarted: async ({ materialId, subsectionId }, { dispatch, queryFulfilled }) => {
          const patch = dispatch(AcadmecisApi.util.updateQueryData("getMaterials", { subsectionId, limit: 25 }, (draft) => {
            const material = draft.content.find(
              (m) => m.studyMaterialId === Number(materialId)
            );

            if (material) {
              material.viewed = true;
              material.views = (material.views || 0) + 1
            }
          }))
          try {
            await queryFulfilled;

          }
          catch {
            patch.undo();
          }
        }
      }),
      markAsDownload: builder.mutation<void, { materialId: string | number; subsectionId: string; }>({
        query: ({ materialId }) => ({
          url: `/academics/materials/${materialId}/mark-as-download`,
          method: "POST",
        }),
        onQueryStarted: async ({ materialId, subsectionId }, { dispatch, queryFulfilled }) => {
          const patch = dispatch(AcadmecisApi.util.updateQueryData("getMaterials", { subsectionId, limit: 25 }, (draft) => {
            const material = draft.content.find(
              (m) => m.studyMaterialId === Number(materialId)
            );

            if (material) {
              material.downloaded = true;
              material.downloads = (material.downloads || 0) + 1
            }
          }))
          try {
            await queryFulfilled;

          }
          catch {
            patch.undo();
          }
        }
      }),
      getAuditLogs: builder.query<
        CursorPageResponse<AcadRepoAuditLogDto>,
        {
          acadRepoId: number | string;
          keyword?: string;
          actorId?: number;
          targetMemberId?: number;
          action?: AcadRepoAuditAction;
          cursor?: string;
          limit?: number;
        }
      >({
        query: ({ acadRepoId, keyword, actorId, targetMemberId, action, cursor, limit = 20 }) => ({
          url: `/academics/${acadRepoId}/audit-logs`,
          method: "GET",
          params: { keyword, actorId, targetMemberId, action, cursor, limit },
        }),
        transformResponse: (response: CursorPageResponse<AcadRepoAuditLogDto>) => {
          return {
            ...response, content: response.content.map((m) => ({
              ...m,
              createdAt: formatTime(m.createdAt as string),

            }))
          }
        },
        serializeQueryArgs: ({ endpointName, queryArgs }) => {
          const { cursor, ...rest } = queryArgs;
          return { endpointName, ...rest };
        },
        merge: (currentCache, newItems) => {
          if (!currentCache.content) {
            currentCache.content = [];
          }
          const existingIds = new Set(currentCache.content.map((log) => log.id));
          newItems.content?.forEach((log) => {
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
    });
  },
});
export const {
  useGetSubjectQuery,
  useGetCoursesQuery,
  useGetAcadmicsPresignedMutation,
  useAddStudyMaterialMutation,
  useGetSubsectionsQuery,
  useLazyGetSubsectionsQuery,
  useGetMaterialsQuery,

  useMakePullRequestMutation,
  useUpdatePullRequestMutation,
  useGetPullRequestsQuery,
  useLazyGetPullRequestsQuery,

  useAddLikeMutation,
  useMarkAsReadMutation,
  useMarkAsDownloadMutation,
  useGetAuditLogsQuery,
  useLazyGetAuditLogsQuery,
} = AcadmecisApi;

