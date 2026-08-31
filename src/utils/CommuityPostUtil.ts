import { formatDistanceToNow, parseISO } from "date-fns";
import { CommunityPostsRes } from "../types/types";

export function buildCommunityPost(response: CommunityPostsRes): CommunityPostsRes & { postIndexMap: Record<number, number> } {
    const postIndexMap: Record<number, number> = {};

    const communityPosts = response.communityPosts.map((post, index) => {
        postIndexMap[post.postId] = index;

        return {
            ...post,
            timeAgo: formatDistanceToNow(parseISO(post.createdAt), {
                addSuffix: true,
            }),
        };
    });

    return {
        ...response,
        communityPosts,
        postIndexMap,
    };

}