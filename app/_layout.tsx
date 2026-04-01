import { Stack } from "expo-router";
import "./globals.css";
import { Provider, } from "react-redux";
import {  store } from "../src/store/Store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import 'react-native-reanimated';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { enableScreens } from "react-native-screens";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import Toast from "react-native-toast-message";


enableScreens(true)

export default function _Layout() {
   
  return (
     <ThemeProvider  value={DarkTheme}>
    <GestureHandlerRootView style={{ flex: 1 }}>
       <Provider store={store}>
      <KeyboardProvider>
      <BottomSheetModalProvider>

   <Stack screenOptions={{headerShown:false}}></Stack>
  </BottomSheetModalProvider>
  <Toast></Toast>
   </KeyboardProvider>
   </Provider>
  </GestureHandlerRootView>

    </ThemeProvider>
  
  )
}
