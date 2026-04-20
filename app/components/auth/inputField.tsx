import React from "react";
import { TextInput, View, Text } from "react-native";



export default function InputField({ label, error, ...props }) {
  return (
    <View className="mb-4">
      <Text className="text-white text-sm mb-1 font-semibold">{label}</Text>
      <TextInput
        className="bg-neutral-900 text-white border border-emerald-500 rounded-lg p-3 focus:border-orange-500"
        placeholderTextColor="#888"
        {...props}
      />
      {error && <Text className="text-red-400 text-xs mt-1">{error}</Text>}
    </View>
  );
}
