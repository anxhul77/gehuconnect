import React, { forwardRef, useCallback, useEffect, useMemo } from "react";
import { Text, StyleSheet, Pressable,View, Keyboard } from "react-native";
import BottomSheet, { BottomSheetFooter, BottomSheetScrollView, BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";


import { FontAwesome, Ionicons } from "@expo/vector-icons";
import CommentCard from "./CommetCard";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CommentBottomSheet = forwardRef<BottomSheet, {}>((_props, ref) => {
  const insets=useSafeAreaInsets();
 const CommentInputFooter = useCallback(
  (props:any) => (
    <BottomSheetFooter {...props} >
      <View style={[styles.footer,{paddingBottom:insets.bottom}]}>
        <BottomSheetTextInput
          placeholder="Add a comment..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
       <Ionicons name="send" size={24} color="white" />
      </View>
    </BottomSheetFooter>
  ),
  []
);
  const snapPoints = useMemo(() => ["60%","95%" ], []);
  useEffect(() => {
  const hideSub = Keyboard.addListener("keyboardDidHide", () => {
    
    if (ref && typeof ref !== "function" && ref?.current) {
      ref.current.snapToIndex(0);
    }
  });
  

  return () => hideSub.remove();
}, []);
  const dummy=()=>{

    }
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableContentPanningGesture={false}
 enableDynamicSizing={false}
       enableOverDrag={false}          
  overDragResistanceFactor={0}
      style={{ overflow: "hidden",flex:1 }}

      backgroundStyle={
        {
          borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
     backgroundColor:"black" 
        }
        
      }
        handleStyle={{
    paddingTop: 14,
            
  }}
        handleIndicatorStyle={{
    backgroundColor: "#9CA3AF", 
    width: 40,
    height: 4,
    borderRadius: 2,
  }}
  footerComponent={CommentInputFooter}
  keyboardBehavior="interactive"
  keyboardBlurBehavior="restore"
    >
      
      <BottomSheetScrollView  style={{ flex: 1 } } 
  contentContainerStyle={{ paddingBottom: 140,minHeight: "100%" }} showsVerticalScrollIndicator
>
      <View className=" flex-1  w-full mt-2 p-3 overflow-hidden  border-white20">
         <View className="flex-row items-center  ">
          <View className="h-8 w-8  rounded-full bg-slate-700 items-center justify-center">
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
          I am using expo-image with NativeWind  ...more
        </Text>
    </View>
      <CommentCard/>
      <CommentCard/>
      <CommentCard/>
      <CommentCard/>
      <CommentCard/>
      <CommentCard/>
      </BottomSheetScrollView>
       
     
     
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    width:'100%',
    alignItems: "center",
    
  },
   inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#1F2933",
    backgroundColor: "black",
  },
  inputWrapper: {
  width: "75%",          
  alignSelf: "center",   
},
  
  footer: {
    paddingVertical: 12,
    backgroundColor: "black",
   
    alignItems: "center",
    display:"flex",
    flexDirection:"row",
    gap:15,
    justifyContent:"center"
  },

  input: {
    width: "80%",
    height: 44,
 
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    color: "white",
  },
});

  


export default CommentBottomSheet;
