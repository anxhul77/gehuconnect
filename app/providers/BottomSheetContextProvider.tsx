import React, { useCallback, useRef, useState } from "react";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetContext } from "../contexts/BottomSheetContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";



export default function BottomSheetProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}

                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
            />
        ),
        []
    );
    const actionSheetRef = useRef<BottomSheetModal>(null);
    const commentsSheetRef = useRef<BottomSheetModal>(null);

    const [actionContent, setActionContent] =
        useState<(() => React.ReactNode) | null>(null);

    const [actionSnapPoints, setActionSnapPoints] =
        useState<string[]>([]);
    const [backgroundColor, setBackgroundColor] = useState<string>()
    const [commentsContent, setCommentsContent] =
        useState<React.ReactNode>(null);

    const [actionEnablePanDownToClose, setActionEnablePanDownToClose] = useState<boolean>(true);
    const [actionHandleComponent, setActionHandleComponent] = useState<React.ComponentType | null>(null);
    const [actionEnableContentPanningGesture, setActionEnableContentPanningGesture] = useState<boolean>(true);
    const actionOnDismissRef = useRef<(() => void) | null>(null);
    const insets = useSafeAreaInsets()
    const openActionSheet = ({
        content,
        snapPoints = [],
        enablePanDownToClose = true,
        handleComponent = null,
        color = "#1A1A1C",
        enableContentPanningGesture = true,

        onDismiss,
    }: {
        content: () => React.ReactNode;
        snapPoints?: string[];
        enablePanDownToClose?: boolean;
        handleComponent?: React.ComponentType | null;
        color?: string;

        enableContentPanningGesture?: boolean;
        onDismiss?: () => void;
    }) => {
        actionOnDismissRef.current = onDismiss ?? null;
        setActionContent(() => content);
        setActionSnapPoints(snapPoints);
        setActionEnablePanDownToClose(enablePanDownToClose);
        setActionHandleComponent(handleComponent);
        setActionEnableContentPanningGesture(enableContentPanningGesture);
        actionSheetRef.current?.present();

        setBackgroundColor(color);
    };

    const openCommentsSheet = (
        content: React.ReactNode
    ) => {
        setCommentsContent(content);

        commentsSheetRef.current?.present();
    };

    const closeActionSheet = () => {
        actionSheetRef.current?.dismiss();
    };

    return (
        <BottomSheetContext.Provider
            value={{
                openActionSheet,
                openCommentsSheet,
                closeActionSheet,
            }}
        >
            {children}

            <BottomSheetModal
                ref={actionSheetRef}
                snapPoints={actionSnapPoints}
                enablePanDownToClose={actionEnablePanDownToClose}
                enableContentPanningGesture={actionEnableContentPanningGesture}
                backdropComponent={renderBackdrop}
                enableDynamicSizing={false}
                keyboardBehavior="interactive"
                handleComponent={actionHandleComponent}
                onDismiss={() => {
                    actionOnDismissRef.current?.();
                    actionOnDismissRef.current = null;
                    setActionContent(null);
                }}
                backgroundStyle={{
                    backgroundColor: backgroundColor,
                    paddingBottom: insets.bottom
                }}
                style={{
                    overflow: 'hidden',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                }}
            >
                <BottomSheetView>
                    {actionContent?.()}
                </BottomSheetView>
            </BottomSheetModal>


            <BottomSheetModal
                ref={commentsSheetRef}
                snapPoints={["90%"]}
                enablePanDownToClose
                backgroundStyle={{
                    backgroundColor: backgroundColor,
                }}
            >
                <BottomSheetView className="flex-1">
                    {commentsContent}
                </BottomSheetView>
            </BottomSheetModal>
        </BottomSheetContext.Provider>
    );
}