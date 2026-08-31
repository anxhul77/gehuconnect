import { View } from "react-native";
import Feedpostcard from "../Feedpostcard";
import React from "react";

function FlashListHeaderComponent({ post, setPostHeight }: { post: any; setPostHeight: (height: number) => void }
) {
    return (
        <View onLayout={(e) => {
            setPostHeight(e.nativeEvent.layout.height);
        }}>
            {post && (
                <Feedpostcard post={post} isCommentPage={true} />
            )}
        </View>
    )
}
export default FlashListHeaderComponent

