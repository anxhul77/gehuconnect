import { Stack } from "expo-router";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "../src/store/Store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import 'react-native-reanimated';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { enableScreens } from "react-native-screens";


export default function RootLayout() {
  return (
     
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
   <Provider store={store}>
      <Stack>
    <Stack.Screen name="(auth)" options={{headerShown:false}}/>
   <Stack.Screen
     name="(drawer)"
     options={{headerShown:false,headerBlurEffect:'regular'}}
      />
   <Stack.Screen name="post" options={{headerShown:false}}></Stack.Screen>
  </Stack>
  </Provider>
  </BottomSheetModalProvider>
  </GestureHandlerRootView>
  
  )
}
