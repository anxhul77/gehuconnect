import { Pressable, View } from "react-native";

export default function CustomSwitch({ value, onValueChange }: { value: boolean; onValueChange: (val: boolean) => void }) {
    return (
        <Pressable
            onPress={() => onValueChange(!value)}
            style={{
                width: 46,
                height: 24,
                borderRadius: 12,
                backgroundColor: value ? '#5865F2' : '#2E3035',
                justifyContent: 'center',
                padding: 0,
                position: 'relative',
                borderWidth: 1,
                borderColor: value ? '#5865F2' : '#3F4248'
            }}
        >
            <View
                style={{
                    width: 22,
                    height: 20,
                    borderRadius: 11,
                    backgroundColor: '#FFFFFF',
                    position: 'absolute',
                    left: value ? 22 : 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2,
                }}
            />
        </Pressable>
    )
}
