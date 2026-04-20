import { api } from "../store/api";
import { CommentDto, CommentResponseDto, CommentSortType, NestedCommentResponse, PostCommentResponse } from "../types/types";



export const commentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getPostComments: builder.query<
            PostCommentResponse,
            {
                postId: number;
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
            // Merge pages for cursor-based pagination
            serializeQueryArgs: ({ queryArgs }) => ({
                postId: queryArgs.postId,
                commentSortType: queryArgs.commentSortType,
            }),
            merge: (currentCache, newItems, { arg }) => {
                if (arg.cursor === "0") {
                    // Reset — first page
                    currentCache.comments = newItems.comments;
                } else {
                    // Append subsequent pages
                    currentCache.comments.push(...newItems.comments);
                }
                currentCache.cursor = newItems.cursor;
                currentCache.hasNext = newItems.hasNext;
            },
            forceRefetch: ({ currentArg, previousArg }) =>
                currentArg?.cursor !== previousArg?.cursor,
            providesTags: (result) =>
                result
                    ? [
                        ...result.comments.map(({ commentId }) => ({
                            type: "Comment" as const,
                            id: commentId.toString(),
                        })),
                        { type: "Comment", id: "LIST" },
                    ]
                    : [{ type: "Comment", id: "LIST" }],
        }),

        getReplies: builder.query<
            PostCommentResponse,
            { parentId: number; cursor: string; limit?: number }
        >({
            query: ({ parentId, cursor, limit = 20 }) => ({
                url: "/comment/getReplies",
                method: "GET",
                params: { parentId, cursor, limit },
            }),
            // Keep cache specific to parentId
            serializeQueryArgs: ({ queryArgs }) => {
                return { parentId: queryArgs.parentId };
            },
            merge: (currentCache, newItems, { arg }) => {
                if (arg.cursor === "0") {
                    return newItems;
                }
                currentCache.comments.push(...newItems.comments);
                currentCache.cursor = newItems.cursor;
                currentCache.hasNext = newItems.hasNext;
            },
            forceRefetch: ({ currentArg, previousArg }) => {
                return currentArg?.cursor !== previousArg?.cursor;
            },
            providesTags: (result, _err, { parentId }) =>
                result?.comments
                    ? [
                        ...result.comments.map(({ commentId }) => ({
                            type: "Comment" as const,
                            id: `reply-${commentId}`,
                        })),
                        { type: "Comment", id: `REPLIES-${parentId}` },
                    ]
                    : [{ type: "Comment", id: `REPLIES-${parentId}` }],
        }),

        addComment: builder.mutation<CommentResponseDto, CommentDto>({
            query: (body) => ({
                url: "/comment",
                method: "POST",
                body,
            }),
            async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {

                const tempId = Date.now() * -1;

                const patchResults: any[] = [];

                // Only optimistically update top-level comments (no parentCommentId)
                if (!arg.parentCommentId) {
                    patchResults.push(dispatch(
                        commentApi.util.updateQueryData(
                            "getPostComments",
                            {
                                postId: Number(arg.postId),
                                commentSortType: CommentSortType.LATEST,
                            } as any,
                            (draft) => {
                                draft.comments.unshift({
                                    commentId: tempId,
                                    content: arg.content || "",
                                    author: arg.author || { author: "You" },
                                    likeCount: 0,
                                    liked: false,
                                    disliked: false,
                                    replyCount: 0,
                                    isSending: true
                                });
                            }
                        )
                    ));
                }

                // Optimistically increment the comment count in feed api cache entries
                const state = getState() as any;
                const feedQueries = state.api?.queries || {};

                for (const key of Object.keys(feedQueries)) {
                    if (key.startsWith('getFeedPosts(')) {
                        const originalArgs = feedQueries[key].originalArgs;
                        if (originalArgs) {
                            patchResults.push(dispatch(
                                api.util.updateQueryData('getFeedPosts' as never, originalArgs as never, (draft: any) => {

                                    const posts = Array.isArray(draft?.post?.communityPosts)
                                        ? draft.post.communityPosts
                                        : (draft?.post?.communityPosts ? [draft.post.communityPosts] : []);

                                    const post = posts.find((p: any) => String(p.postId) === String(arg.postId));
                                    if (post && post.statsDto && typeof post.statsDto === 'object') {
                                        post.statsDto.comments = (Number(post.statsDto.comments) || 0) + 1;
                                    }
                                })
                            ));
                        }
                    }
                }

                try {
                    // Wait for the server response
                    const { data: serverComment } = await queryFulfilled;

                    if (!arg.parentCommentId) {
                        // On success, replace the temporary comment with the real one from the server
                        dispatch(
                            commentApi.util.updateQueryData(
                                "getPostComments",
                                {
                                    postId: Number(arg.postId),
                                    commentSortType: CommentSortType.LATEST,
                                } as any,
                                (draft) => {
                                    const index = draft.comments.findIndex(c => c.commentId === tempId);
                                    if (index !== -1) {
                                        draft.comments[index] = serverComment;
                                    }
                                }
                            )
                        );
                    } else {
                        const numericParentId = Number(arg.parentCommentId);
                        
                        // Push new reply into getReplies cache optimistically
                        patchResults.push(
                            dispatch(
                                commentApi.util.updateQueryData(
                                    "getReplies",
                                    { parentId: numericParentId } as any,
                                    (draft) => {
                                        if (draft && draft.comments) {
                                            draft.comments.push(serverComment);
                                        }
                                    }
                                )
                            )
                        );

                        // Increment replyCount on the parent comment in getPostComments cache
                        patchResults.push(
                            dispatch(
                                commentApi.util.updateQueryData(
                                    "getPostComments",
                                    { postId: Number(arg.postId), commentSortType: CommentSortType.LATEST } as any,
                                    (draft) => {
                                        if (draft && draft.comments) {
                                            const parentComment = draft.comments.find(
                                                c => c.commentId === numericParentId
                                            );
                                            if (parentComment) {
                                                parentComment.replyCount = (parentComment.replyCount || 0) + 1;
                                            }
                                        }
                                    }
                                )
                            )
                        );
                    }
                } catch {
                    // Revert cache if the mutation fails
                    patchResults.forEach(patch => patch.undo());
                }
            },
            // Since we manually manage the cache seamlessly, we can omit invalidatesTags to prevent an extra network request!
            // invalidatesTags: [{ type: "Comment", id: "LIST" }],
        }),
    }),
});

export const {
    useGetPostCommentsQuery,
    useLazyGetPostCommentsQuery,
    useGetRepliesQuery,
    useAddCommentMutation,
} = commentApi;
