
import { api } from "../store/api";
import { CommentDto, CommentReactionType, CommentResponseDto, CommentSortType, PostCommentResponse } from "../types/types";
import { buildComments, markCommentFailed, mergeRepliesIntoComments, onAddComment, replaceTempComment } from "../utils/CommentUtils";

import { feedApi } from "./feed.api";
import { communityApi } from "./community/community.api";





export const commentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getPostComments: builder.query<
            PostCommentResponse & { commentIndexMap: Record<number, number>, clientIdMap: Record<string, boolean> },
            {
                postId: string;
                cursor: string;
                commentSortType: CommentSortType | string;
                limit?: number;
            }
        >({
            query: ({ postId, cursor, commentSortType, limit = 20 }) => ({
                url: "/comment/getPostComments",
                method: "GET",
                params: { postId, cursor, commentSortType, limit },
            }),
            transformResponse: (response: PostCommentResponse & { commentIndexMap: Record<number, number> }) => {
                const { comments, commentIndexMap, clientIdMap } = buildComments(response.comments)
                return { ...response, comments: comments, commentIndexMap: commentIndexMap, clientIdMap: clientIdMap };
            },
            serializeQueryArgs: ({ queryArgs }) => ({
                postId: queryArgs.postId,
                commentSortType: queryArgs.commentSortType,
            }),

            forceRefetch: ({ currentArg, previousArg }) =>
                currentArg?.cursor !== previousArg?.cursor,


        }),

        getReplies: builder.query<
            PostCommentResponse & { commentIndexMap: Record<number, number> },
            { parentId: number | null; isLoadMore?: boolean; cursor: string; limit?: number }
        >({
            query: ({ parentId, cursor, limit = 20 }) => (

                {
                    url: "/comment/getReplies",
                    method: "GET",
                    params: { parentId, cursor, limit },
                }
            ),
            async onQueryStarted(
                { parentId, isLoadMore },
                { dispatch, getState, queryFulfilled }
            ) {

                try {

                    const { data: response } =
                        await queryFulfilled;
                    console.log("data", response)
                    const state = (getState as any)();

                    const queries =
                        state?.api?.queries || {};

                    for (const key of Object.keys(queries)) {

                        if (!key.startsWith("getPostComments"))
                            continue;

                        const originalArgs =
                            queries[key].originalArgs;

                        dispatch(
                            commentApi.util.updateQueryData(
                                "getPostComments",
                                originalArgs,
                                draft => {
                                    try {
                                        mergeRepliesIntoComments(
                                            draft as PostCommentResponse &
                                            { commentIndexMap: Record<number, number> } & { clientIdMap: Record<string, boolean> },
                                            parentId,


                                            response,
                                            isLoadMore
                                        );
                                        console.log("after--------------------------------------------------------------------------------------------")
                                    } catch (e) {
                                        console.log(e)
                                    }


                                }
                            )
                        );

                    }

                } catch {

                }
            }
        }),

        addComment: builder.mutation<CommentResponseDto, CommentDto>({
            query: (body) => ({
                url: "/comment",
                method: "POST",
                body,
            }),
            async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
                const patches: any[] = []
                const tempId = Date.now()
                const state = getState() as any
                const queries =
                    state?.api?.queries || {};
                let originalArgs: any;
                for (const key of Object.keys(queries)) {

                    if (!key.startsWith("getPostComments"))
                        continue;

                    originalArgs =
                        queries[key].originalArgs;

                    const patch = dispatch(commentApi.util.updateQueryData(
                        "getPostComments",
                        originalArgs,
                        draft => {
                            try {
                                onAddComment(draft as PostCommentResponse &
                                { commentIndexMap: Record<number, number> } & { clientIdMap: Record<string, boolean> }, arg.parentCommentId, tempId, arg.content, arg.clientId)

                            } catch (e) {
                                console.log(e)
                            }


                        }
                    ))
                    patches.push({ patch, originalArgs })
                }
                let communityId;
                const feedPatch = dispatch(
                    feedApi.util.updateQueryData(
                        "getFeedPosts",
                        undefined as any,
                        draft => {
                            console.log("updating deedpost cache------------------------------------------------")
                            const index = draft.postIndexMap[Number(arg.postId)]
                            console.log(draft.postIndexMap)
                            console.log("post id", arg.postId, index)
                            if (index != undefined) {
                                console.log(draft.communityPosts[index])
                                draft.communityPosts[index].statsDto.comments++;
                                console.log(draft.communityPosts[index].statsDto.comments)
                                communityId = draft.communityPosts[index].communityId;
                            }
                        }
                    )
                );
                let communityPatch: any;
                if (communityId != undefined) {
                    communityPatch = dispatch(communityApi.util.updateQueryData(
                        "getCommunityPosts",
                        communityId as any,
                        draft => {
                            console.log("communitypatchupdating")
                            const index = draft.postIndexMap[Number(arg.postId)]
                            if (index != undefined) {
                                draft.communityPosts[index].statsDto.comments++;

                            }
                        }
                    ))
                }

                try {
                    const { data } = await queryFulfilled
                    for (const { originalArgs } of patches) {
                        dispatch(
                            commentApi.util.updateQueryData(
                                "getPostComments",
                                originalArgs,
                                draft => {
                                    replaceTempComment(draft as PostCommentResponse & { commentIndexMap: Record<number, number> }, tempId, data);
                                }
                            )
                        );
                    }
                }
                catch (e) {
                    console.log(e)
                    for (const { originalArgs } of patches) {
                        dispatch(commentApi.util.updateQueryData(
                            "getPostComments",
                            originalArgs,
                            draft => {

                                markCommentFailed(
                                    draft as PostCommentResponse & { commentIndexMap: Record<number, number> },
                                    tempId
                                );

                            }
                        )
                        );
                    }
                    feedPatch?.undo()
                    communityPatch?.undo()
                }


            }
        }),
        commentReaction: builder.mutation<void, { commentId: number, commentReaction: CommentReactionType }>({
            query: ({ commentId, commentReaction }) => ({
                url: "/comment/reaction",
                method: "POST",
                params: { commentId, commentReaction }
            }),
            async onQueryStarted({ commentId, commentReaction }, { dispatch, getState, queryFulfilled }) {
                const patches: any[] = [];
                const state = getState() as any;
                const queries = state?.api?.queries || {};

                for (const key of Object.keys(queries)) {
                    if (!key.startsWith("getPostComments")) continue;
                    const originalArgs = queries[key].originalArgs;
                    const patch = dispatch(
                        commentApi.util.updateQueryData("getPostComments", originalArgs, draft => {
                            try {
                                const index = draft.commentIndexMap[commentId];
                                if (index !== undefined) {
                                    const comment = draft.comments[index];
                                    if (commentReaction === CommentReactionType.LIKE) {
                                        if (comment.liked) {
                                            comment.liked = false;
                                            comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1);
                                        } else {
                                            comment.liked = true;
                                            comment.likeCount = (comment.likeCount || 0) + 1;
                                            if (comment.disliked) {
                                                comment.disliked = false;
                                            }
                                        }
                                    } else if (commentReaction === CommentReactionType.DISLIKE) {
                                        if (comment.disliked) {
                                            comment.disliked = false;
                                        } else {
                                            comment.disliked = true;
                                            if (comment.liked) {
                                                comment.liked = false;
                                                comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1);
                                            }
                                        }
                                    }
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        })
                    );
                    patches.push(patch);
                }
                try {
                    await queryFulfilled;
                } catch (e) {
                    console.log(e);
                    for (const patch of patches) {
                        patch.undo();
                    }
                }
            }
        }),
    }

    )
});




export const {
    useGetPostCommentsQuery,
    useLazyGetPostCommentsQuery,
    useGetRepliesQuery,
    useLazyGetRepliesQuery,
    useCommentReactionMutation,
    useAddCommentMutation,
} = commentApi;
