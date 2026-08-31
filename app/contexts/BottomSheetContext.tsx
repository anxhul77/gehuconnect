import { BottomSheetHandleProps } from "@gorhom/bottom-sheet";
import { createContext, useContext } from "react";

type BottomSheetContextType = {
    openActionSheet: ({ content, snapPoints, enablePanDownToClose, handleComponent, color,
        enableContentPanningGesture, enableDynamicSizing, onDismiss }: {
            content: () => React.ReactNode,
            snapPoints?: string[],
            enablePanDownToClose?: boolean,
            handleComponent?: React.ComponentType<BottomSheetHandleProps> | null,
            color?: string,
            enableContentPanningGesture?: boolean,
            enableDynamicSizing?: boolean,
            onDismiss?: () => void
        }) => void;

    openCommentsSheet: (
        content: React.ReactNode
    ) => void;

    closeActionSheet: () => void;
};

export const BottomSheetContext =
    createContext<BottomSheetContextType | null>(null);

export const useBottomSheet = () => {
    const context = useContext(BottomSheetContext);

    if (!context)
        throw new Error(
            "useBottomSheet must be used inside BottomSheetProvider"
        );

    return context;
};