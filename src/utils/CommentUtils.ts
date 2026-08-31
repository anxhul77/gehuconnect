import { formatDistanceToNow, parseISO } from "date-fns";
import { CommentResponseDto, OptimisticReply, PostCommentResponse } from "../types/types";
import { RefObject } from "react";

export type BuiltComment = CommentResponseDto & {
    timeAgo: string;
    isLastSibling: boolean;
    ancestorHasNext: boolean[];

};

export function buildComments(
    comments: CommentResponseDto[]
): { comments: BuiltComment[], commentIndexMap: Record<number, number>, clientIdMap: Record<string, boolean> } {
    const n = comments.length;

    const hasNextSibling = new Array<boolean>(n).fill(false);
    const lastSeenAtDepth = new Map<number, number>();
    const commentIndexMap: Record<number, number> = {}

    for (let i = n - 1; i >= 0; i--) {

        const current = comments[i];
        const depth = current.depth;

        const nextSameDepthIndex = lastSeenAtDepth.get(depth);

        if (nextSameDepthIndex !== undefined) {
            const nextSameDepth = comments[nextSameDepthIndex];

            hasNextSibling[i] =
                nextSameDepth.parentId === current.parentId;

        }

        lastSeenAtDepth.set(depth, i);

    }
    hasNextSibling[0] = true

    const clientIdMap: Record<string, boolean> = {}
    const hasSiblingLaterMap: Record<number, boolean> = {}
    comments = comments.map((c, i) => {
        commentIndexMap[c.commentId] = i;
        let ancestorHasNext: boolean[]
        if (c.parentId == null) {
            ancestorHasNext = []
        }

        else {

            hasSiblingLaterMap[c.depth] = hasNextSibling[i]
            ancestorHasNext = Array.from({ length: c.depth }).map((_, index) => hasSiblingLaterMap[index + 1]!)

        }
        clientIdMap[c.clientId] = true;

        const isLastSibling = !hasNextSibling[i];

        let timeAgo

        try {
            timeAgo =
                "timeAgo" in c
                    ? (c as BuiltComment).timeAgo
                    : formatDistanceToNow(
                        parseISO((c as CommentResponseDto).createdAt),
                        { addSuffix: true }
                    );
        } catch (e) {

            throw e
        }
        return {
            ...c,
            isLastSibling: isLastSibling,
            ancestorHasNext: ancestorHasNext,
            timeAgo,

        };
    });

    return { comments, commentIndexMap, clientIdMap }
}



export function getVisibleComments(
    comments: CommentResponseDto[],
    collapsedSet: Set<number>,
    loadedReply: RefObject<Set<number>>
) {

    const visible = [];
    const visibleById = new Map<number, BuiltComment>();

    let hidingDepth = -1;
    let currentIndex = 0;
    const commentss = [...comments]
    for (let comment of commentss) {

        if (hidingDepth !== -1) {

            if (comment.depth > hidingDepth)
                continue;


            hidingDepth = -1;
        }



        if (comment.parentId !== null) {
            loadedReply.current.add(comment.parentId)
        }

        if (

            comment.parentId !== null
        ) {

            const parent = visibleById.get(comment.parentId);

            if (comment.isLastSibling &&
                parent?.replyHasNext || comment.isOptimistic && parent?.replyHasNext == false && parent?.replyCount! > 1 && comment.isLastSibling
            ) {
                comment = {
                    ...comment, showLoadMore: true,
                    loadMoreCursor: parent?.replyCursor
                }
            }

        }
        visible.push(comment);

        visibleById.set(comment.commentId, comment);
        if (collapsedSet.has(comment.commentId))
            hidingDepth = comment.depth;
        currentIndex++;
    }

    return visible;
}
export function mergeRepliesIntoComments(
    draft: PostCommentResponse & {
        commentIndexMap: Record<number, number>,

    } & { clientIdMap: Record<string, boolean> },
    parentId: number | null,


    response: {
        comments: CommentResponseDto[],
        cursor: string,
        hasNext: boolean
    },
    isLoadMore: boolean = false,
) {

    if (parentId == null) {
        throw Error("commentId or parentId is null")

    }
    const filterdReplies = response.comments.filter(c => !(c.clientId in draft.clientIdMap))


    let insertIndex = draft.commentIndexMap[parentId as number]

    if (insertIndex == null) {
        throw Error("insertindex is null");
    }
    if (isLoadMore) {
        while (insertIndex + 1 < draft.comments.length && draft.comments[insertIndex + 1].parentId == parentId) {
            insertIndex++;
        }
    }
    const parentIndex = draft.commentIndexMap[parentId];

    if (parentIndex == null) {
        throw Error;
    }
    draft.comments[parentIndex].replyCursor = response.cursor;
    draft.comments[parentIndex].replyHasNext = response.hasNext;
    const { start, end } = getThreadBounds(draft.comments, insertIndex);

    const upperBound = draft.comments.slice(start, insertIndex + 1);
    const lowerBound = draft.comments.slice(insertIndex + 1, end);



    const replies = buildComments([...upperBound, ...filterdReplies, ...lowerBound]).comments;



    if (response.comments.length > 0) {
        replies[replies.length - 1].isLastSibling = true;
    }





    draft.comments.splice(
        start,
        end - start,
        ...replies
    );


    const newCommentIndexMap: Record<number, number> = {}
    draft.comments.forEach((c, i) => (
        newCommentIndexMap[c.commentId] = i))


    draft.commentIndexMap = newCommentIndexMap


}

function getThreadBounds(
    comments: CommentResponseDto[],
    index: number

) {
    let start = index;


    while (start > 0 && comments[start].depth !== 0) {
        (start)
        start--;
    }

    let end = index + 1;


    while (
        end < comments.length &&
        comments[end].depth !== 0
    ) {
        (end)

        end++;
    }



    return { start, end };
}
export function onAddComment(
    draft: PostCommentResponse & {
        commentIndexMap: Record<number, number>;
    } & { clientIdMap: Record<string, boolean> },
    parentId: number | null,
    commentId: number,
    content: string,
    clientId: string
) {

    const optimistiComment: CommentResponseDto = {
        commentId: commentId,
        parentId,
        content,

        createdAt: new Date().toISOString(),

        author: {
            author: "You",
        } as any,

        liked: false,
        disliked: false,
        likeCount: 0,
        replyCount: 0,
        showLoadMore: false,
        loadMoreCursor: null,
        replyCursor: null,
        replyHasNext: false,
        isOptimistic: true,
        isSending: true,
        clientId: clientId,
        depth: parentId ? draft.comments[draft.commentIndexMap[parentId]].depth + 1 : 0,
        isLastSibling: false,
        ancestorHasNext: [],
        timeAgo: "Just now",
    };

    if (parentId == null) {
        mergeAddedCommentIntoComments(draft, optimistiComment);
    } else {
        try {
            const index = draft.commentIndexMap[parentId]

            draft.comments[index].replyCount += 1


            mergeRepliesIntoComments(
                draft,
                parentId,

                {
                    comments: [optimistiComment],
                    cursor: draft.comments[draft.commentIndexMap[parentId!]].replyCursor!,
                    hasNext: draft.comments[draft.commentIndexMap[parentId!]].replyHasNext,
                },
                false
            );
            draft.clientIdMap[optimistiComment.clientId] = true;

        } catch (e) {

        }

    }
};
function mergeAddedCommentIntoComments(
    draft: PostCommentResponse & {
        commentIndexMap: Record<number, number>;
    } & { clientIdMap: Record<string, boolean> },

    comment: CommentResponseDto,
) {
    draft.comments.unshift(comment)
    draft.comments.forEach((element, i) => {
        draft.commentIndexMap[element.commentId] = i;
    });
    draft.clientIdMap[comment.clientId] = true;
}
export function replaceTempComment(draft: PostCommentResponse & {
    commentIndexMap: Record<number, number>;
}, tempId: number, comment: CommentResponseDto) {

    const index = draft.commentIndexMap[tempId]
    if (index == null) throw Error("comment not found")
    draft.comments[index] = {
        ...draft.comments[index],
        commentId: comment.commentId,

        isSending: false

    }


    delete draft.commentIndexMap[tempId];
    draft.commentIndexMap[comment.commentId] = index;

}
export function markCommentFailed(draft: PostCommentResponse & {
    commentIndexMap: Record<number, number>;
}, tempId: number) {


    const index = draft.commentIndexMap[tempId]
    if (index == null) throw Error("comment not found")
    draft.comments[index].failed = true;
    draft.comments[index].isSending = false;
}