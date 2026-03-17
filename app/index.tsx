import { Redirect, Stack } from "expo-router";
import "./globals.css";
import { Provider, useSelector } from "react-redux";
import { RootState, store } from "../src/store/Store";
import 'react-native-reanimated';

import { useEffect, useState } from "react";
import { View,Text } from "react-native";
import { useAuthBootstrap } from "@/src/hooks/useAuthBootStrap";
 import "text-encoding"


export default function index() {
   
   console.log("TextEncoder:", typeof TextEncoder);
console.log("TextDecoder:", typeof TextDecoder);
    //useAuthBootstrap()
   //const [ready,setReady]=useState(false)
   /*  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  )*/
   // console.log("is aauthenticaated user        ..................................... ..............................",isAuthenticated)
  /* useEffect(()=>{
     setReady(true);
   },[])*/
   const ready=false

   /*if(!ready){
    return(
      <View className="flex-1 justify-center items-center">
     <Text>
     loading
     </Text>
      </View>
    )
   }
 /* return isAuthenticated ? (
    <Redirect href="/(drawer)/(tabs)" />
  ) : (
    <Redirect href="/(auth)" />
  )*/
 return (
  <Redirect href="/(auth)"></Redirect>
 )
}
