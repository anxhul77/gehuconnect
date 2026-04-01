import { Text, TouchableOpacity } from "react-native"
import Checkbox from "./CheckBox"

export default function OptionRow({
  icon,
  label,
  active,
  isLast,
  onPress,
}: {
  icon: string
  label: string
  active: boolean
  isLast: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center gap-x-3 px-4 py-3 ${
        !isLast ? 'border-b border-[#1f1f1f]' : ''
      }`}
    >
      <Text className={`text-sm w-4 text-center ${active ? 'text-white' : 'text-[#555]'}`}>
        {icon}
      </Text>
      <Text className={`text-sm font-semibold flex-1 ${active ? 'text-white' : 'text-[#ccc]'}`}>
        {label}
      </Text>
      <Checkbox checked={active} />
    </TouchableOpacity>
  )
}
