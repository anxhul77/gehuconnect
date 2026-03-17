import { View, TextInput, Pressable } from "react-native";
import React, { useState } from "react";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export default function TextInputModal({onSend}:any) {
  const [message,setMessage]=useState("");
 const handleSend = () => {
    if (!message.trim()) return;

    onSend(message);
    setMessage("");
  };
  return (
    <View className="flex-row items-center border-t border-white/20 px-3 py-1 bg-black gap-4 h-20">
     <AntDesign name="plus-circle" size={24} color="white" />
      <TextInput
        value={message}
        onChangeText={setMessage}
        className="flex-1 bg-[#292a2b] h-18 rounded-3xl px-4 py-2 text-white"
        placeholder="Message"
        placeholderTextColor="#9ca3af"
      />
      <Pressable onPress={handleSend}>
      <Ionicons name="send" size={22} color="white"  />
      </Pressable>
    </View>
  );
}
