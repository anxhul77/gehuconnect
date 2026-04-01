import { Text, View } from "react-native";


export default function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View
      className={`w-5 h-5 rounded-md border items-center justify-center ${
        checked
          ? 'bg-white border-white'
          : 'bg-transparent border-[#444]'
      }`}
    >
      {checked && (
        <Text className="text-black text-[11px] font-bold leading-none">✓</Text>
      )}
    </View>
  )
}