import { View, StyleSheet } from "react-native";

interface ThreadLinesProps {
    depth: number;
    ancestorHasNext: boolean[];
    isLastSibling: boolean;


}

const SLOT_WIDTH = 20;

export default function ThreadLines({
    depth,
    ancestorHasNext,
    isLastSibling,


}: ThreadLinesProps) {


    return (
        <View style={styles.threadContainer}>
            {
                Array.from({ length: depth }).map((_, i) => {
                    const isCurrentLevel = i === depth - 1;



                    return (
                        <View key={i} style={styles.slot}>

                            {!isCurrentLevel && ancestorHasNext[i] && (
                                <View style={styles.verticalLine} />
                            )}

                            {isCurrentLevel && (
                                <>

                                    <View style={styles.currentVertical} />


                                    <View
                                        style={[
                                            styles.branchCurve,
                                            isLastSibling && styles.branchCurve,
                                        ]}
                                    />


                                    <View style={styles.horizontalLine} />


                                    {!isLastSibling && (
                                        <View style={styles.lowerVertical} />
                                    )}
                                </>
                            )}
                        </View>
                    );
                })}
        </View>
    );
}


const styles = StyleSheet.create({
    threadContainer: {
        flexDirection: "row",
    },

    slot: {
        width: SLOT_WIDTH,
        position: "relative",


    },

    verticalLine: {
        position: "absolute",
        left: SLOT_WIDTH / 2,
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: "#333638",
    },

    currentVertical: {
        position: "absolute",
        left: SLOT_WIDTH / 2,
        top: 0,
        height: 18,
        width: 1,
        backgroundColor: "#333638",
    },

    branchCurve: {
        position: "absolute",
        left: SLOT_WIDTH / 2,
        top: 18,
        width: 10,
        height: 10,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#333638",
        borderBottomLeftRadius: 8,
    },

    horizontalLine: {
        position: "absolute",
        left: SLOT_WIDTH / 2 + 8,
        top: 27,
        width: 12,
        height: 1.5,
        backgroundColor: "#333638",
    },

    lowerVertical: {
        position: "absolute",
        left: SLOT_WIDTH / 2,
        top: 28,
        bottom: 0,
        width: 1,
        backgroundColor: "#333638",
    },
});