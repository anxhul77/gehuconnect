import { Entypo, EvilIcons, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View ,Text} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import CommentBottomSheet from "../components/CommentBottomSheet"
import BottomSheet from "@gorhom/bottom-sheet";
export default function feedPostSection(){
  
  const commentBottomSheetRef=useRef<BottomSheet>(null);
    const router=useRouter();
    const dummy=()=>{
    }
   

  function handleCommentClick(){
   console.log("clickerf")
   console.log(commentBottomSheetRef)
    commentBottomSheetRef.current?.snapToIndex(0);
  };

  
    
    return(
    <View className="flex-1 bg-black">     
        <SafeAreaView >
            <View className="flex-row py-4 items-center px-2 w-full ">
        <Pressable onPress={() => router.back()}>
          <Entypo name="cross" size={32} color="white" />
        </Pressable>

        <Text className="flex-1 text-center  text-white  font-semibold text-base ">
          r/reactnative
        </Text>
        <Pressable>
            <Entypo name="dots-three-vertical" size={22} color="white"  />
        </Pressable>
        </View>
        </SafeAreaView>
     
           <Pressable
          onPress={() => dummy}
          className="mt-4"
        >
          <Image
            source={require("../../assets/images/icon.png")}
            contentFit="contain"
            style={{
              width: "100%",
              aspectRatio: 1,
            }}
          />
        </Pressable>
 
         <SafeAreaView edges={["bottom"]} className="absolute bottom-0 left-0 right-0 mb-1">

          <View className="flex gap-1 px-4 py-1 bg-transparent ">
        <View className="flex-row items-center  ">
          <View className="h-8 w-8 rounded-full bg-slate-700 items-center justify-center">
            <Ionicons name="person" size={14} color="white" />
          </View>
 
          <View className="ml-3">
            <Pressable onPress={()=>dummy}>
              <Text className="text-white font-semibold text-sm">
                r/reactnative
              </Text>
            </Pressable>

            <Pressable onPress={() => dummy}>
              <Text className="text-slate-400 text-xs">
                u/ansh • 2h ago
              </Text>
            </Pressable>
          </View>
        </View>
         <Text className="text-white   font-bold leading-7">
          Expo Image not rendering inside NativeWind?
        </Text>
   
        <Text className="text-slate-300  text-base leading-6">
          I am using expo-image with NativeWind but the image doesn’t show
          unless I explicitly give width. Any idea why this happens?
        </Text>
           
        <View className="flex-row items-center justify-between  mt-2 border-white15 mb-1 ">
           
                <View className="flex-row items-center justify-between w-full  ">
                  <View className='flex-row items-center gap-4'>
                  <View className="flex-row items-center justify-center  border border-white15 bg-white5 rounded-3xl p-1  w-[130px] h-[42px] ">
                   <EvilIcons name="like" size={24} color="white" />
                    <Text className="text-white text-sm ">124</Text>
                     <View className=' w-[2px] h-4 bg-white15 ml-2'></View>
                      <EvilIcons name="like" size={24} color="white" className='rotate-180'/>
                     <Text className="text-white text-sm mr-1">124</Text>
                  
                  </View>
                  <Pressable onPress={()=>(handleCommentClick())}>
                    <View className="flex-row items-center justify-center border border-white15 bg-white5 rounded-3xl w-[65px] h-[42px] p-1">
                      <Ionicons name="chatbubble-outline" size={18} color="white"  />
                      <Text className="text-white text-sm ">18</Text>
                    </View>
                    </Pressable>
              </View>
                  <View className="flex-row items-center justify-center space-x-4 border  border-white15 bg-white5 rounded-full gap-1 p-1 mr-2 w-[65px] h-[42px]" >
                    
          
                    <Ionicons name="share-social-outline" size={18} color="white" />
                    <Text className="text-white text-sm ">20</Text>
                  </View>
                </View>
        </View>

        </View>
   
  </SafeAreaView>
     <CommentBottomSheet  ref={commentBottomSheetRef}></CommentBottomSheet>
    </View>
  );
    
}