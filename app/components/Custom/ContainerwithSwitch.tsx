import { StyleProp, Text, View, ViewStyle } from "react-native";
import CustomSwitch from "./CustomSwitch";

export default function ContainerwithSwitch({
    icon,
    title,
    description,
    style,
    backgroundColor,
    customSwitch,

}: {
    icon?: React.ReactNode
    title: string;
    description?: string;
    style?: {}
    backgroundColor?: string,
    customSwitch?: React.ReactNode

}) {
    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: backgroundColor || "#151515",
            minHeight: 65,
            paddingVertical: 14,
            paddingLeft: 12,
            paddingRight: 8,
            ...style,
            width: "100%",
            gap: 8
        }}>

            {icon}


            <View style={{ flex: 1, }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>{title}</Text>
                {description && <Text style={{ color: '#8F9199', fontSize: 12, marginTop: 4, lineHeight: 15, fontWeight: '500' }}>{description}</Text>}
            </View>
            {customSwitch}

        </View>
    )
}
