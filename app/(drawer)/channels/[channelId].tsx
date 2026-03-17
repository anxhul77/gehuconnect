import {  Text } from "react-native";
import React, { useRef } from "react";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import TextInputModal from "@/app/components/channel/TextInputModal";

import { KeyboardAvoidingView,  } from "react-native-keyboard-controller";
import { ChannelHeader } from "@/app/components/channel/ChannelHeader";
import { useGetMessagesQuery, useSendMessageMutation } from "@/src/features/chat.api";
import { useLocalSearchParams } from "expo-router";
import { Client } from "@stomp/stompjs";
import MessageBubble from "@/app/components/messages/MessageBubble";

export default function Channel() {
    const { channelId} = useLocalSearchParams<{ channelId: string }>()
    const scrollRef = useRef<ScrollView>(null);
   const stompRef=useRef<Client| null>(null)
  const { data:messages, isLoading,error } = useGetMessagesQuery(
    { channelId },
    { skip: !channelId }
  )
  const [sendMessage] = useSendMessageMutation()
  console.log(channelId)
console.log("hoooke **********",messages,error)
  return (
    <SafeAreaView className="flex-1 bg-black">
      <ChannelHeader name="general" online={24}></ChannelHeader>
         <KeyboardAvoidingView
         behavior="padding"
        style={{flex:1}}
       
      >
      <FlatList data={messages?.messages || []} renderItem={({item})=><MessageBubble item={item} ></MessageBubble>}></FlatList>

    
      <TextInputModal onSend={(content: string) => {
    if (!channelId) return

    sendMessage({
      channelId,
      content,
    })
  }} />
       </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
