import { useRef, useState } from "react"
import { Animated, Text, TextInput, View } from "react-native"


export default function StyledInput({label,placeholder,value,onChangeText,multiline,lines,keyboardType,prefix,  maxLength,
}: {
  label?: string
  placeholder: string
  value: string
  onChangeText: (t: string) => void
  multiline?: boolean
  lines?: number
  keyboardType?: any
  prefix?: string
  maxLength?: number
}) {
  const [focused, setFocused] = useState(false)
  const anim = useRef(new Animated.Value(0)).current
 
  const onFocus = () => {
    setFocused(true)
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start()
  }
  const onBlur = () => {
    setFocused(false)
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start()
  }
 
  const borderColor = anim.interpolate({ inputRange: [0, 1], outputRange: ["#2A2A2A", "#FFFFFF"] })
 
  return (
    <View style={{ marginBottom: 12 }}>
      {label && (
        <Text style={{ color: "#B3B3B3", fontSize: 12, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      )}
      <Animated.View style={{ borderWidth: 1.5, borderColor, borderRadius: 12, backgroundColor: "#1A1A1A", flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center' }}>
        {prefix && (
          <Text style={{ color: '#535353', fontSize: 16, fontWeight: '700', paddingLeft: 14, paddingTop: multiline ? 14 : 0 }}>{prefix}</Text>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={"#535353"}
          multiline={multiline}
          numberOfLines={lines}
          keyboardType={keyboardType}
          maxLength={maxLength}
          style={{
            flex: 1,
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: '500',
            paddingHorizontal: prefix ? 6 : 14,
            paddingVertical: 14,
            textAlignVertical: multiline ? 'top' : 'center',
            minHeight: multiline ? (lines || 4) * 24 : undefined,
          }}
        />
        {maxLength && (
          <Text style={{ color: '#535353', fontSize: 11, paddingRight: 12, alignSelf: 'flex-end', paddingBottom: 12 }}>
            {value.length}/{maxLength}
          </Text>
        )}
      </Animated.View>
    </View>
  )
}
 