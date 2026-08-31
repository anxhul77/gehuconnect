import { Stack } from "expo-router";
import "./globals.css";
import { Provider, } from "react-redux";
import { store } from "../src/store/Store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import 'react-native-reanimated';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { enableScreens } from "react-native-screens";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import BottomSheetProvider from "./providers/BottomSheetContextProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";


enableScreens(true)

export default function _Layout() {

  return (
    <ThemeProvider value={DarkTheme}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>

          <Provider store={store}>
            <KeyboardProvider>
              <BottomSheetModalProvider>
                <BottomSheetProvider>
                  <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
                    <Stack.Screen name="index" />
                    <Stack.Screen
                      name="components/CommunityPosts/comments/[commentPageId]"
                      options={{
                        presentation: "modal",
                        animation: "fade_from_bottom",
                        animationTypeForReplace: "pop",
                        gestureEnabled: true,
                        gestureDirection: "vertical",
                      }}
                    />
                    <Stack.Screen
                      name="components/CommunityPosts/[id]"
                      options={{
                        presentation: "fullScreenModal",
                        animation: "fade",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                      }}
                    />
                    <Stack.Screen
                      name="components/community/settings/general/[generalId]"
                      options={{
                        presentation: "card",
                        animation: "fade_from_bottom",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        animationTypeForReplace: "pop",


                      }}
                    />
                    <Stack.Screen
                      name="components/community/settings/appearance/[appearanceId]"
                      options={{
                        presentation: "card",
                        animation: "fade_from_bottom",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        animationTypeForReplace: "pop",


                      }}
                    />
                    <Stack.Screen
                      name="components/community/settings/audit-log/[auditLogId]  "
                      options={{
                        presentation: "card",
                        animation: "fade_from_bottom",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        animationTypeForReplace: "pop",


                      }}
                    />
                    <Stack.Screen
                      name="components/community/settings/channels/[channelsSettinngsId]"
                      options={{
                        presentation: "card",
                        animation: "fade_from_bottom",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        animationTypeForReplace: "pop",


                      }}
                    />
                    <Stack.Screen
                      name="components/community/settings/danger-zone/[dangerZoneId]"
                      options={{
                        presentation: "card",
                        animation: "fade_from_bottom",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        animationTypeForReplace: "pop",


                      }}
                    />
                    <Stack.Screen
                      name="components/community/settings/events/[eventsId]"
                      options={{
                        presentation: "card",
                        animation: "fade_from_bottom",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        animationTypeForReplace: "pop",


                      }}
                    />
                    <Stack.Screen
                      name="components/community/settings/invites/[invitesId]  "
                      options={{
                        presentation: "card",
                        animation: "fade_from_bottom",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        animationTypeForReplace: "pop",


                      }}
                    /><Stack.Screen
                      name="components/community/settings/feed/[feedId]"
                      options={{
                        presentation: "card",
                        animation: "fade_from_bottom",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        animationTypeForReplace: "pop",


                      }}
                    />
                    <Stack.Screen
                      name="components/community/settings/members/[membersId]"
                      options={{
                        presentation: "card",
                        animation: "fade_from_bottom",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        animationTypeForReplace: "pop",


                      }}
                    />
                    <Stack.Screen
                      name="components/community/settings/moderation/[moderationId]"
                      options={{
                        presentation: "card",
                        animation: "fade_from_bottom",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        animationTypeForReplace: "pop",


                      }}
                    />
                    <Stack.Screen
                      name="components/community/settings/roles/[roleId]"
                      options={{
                        presentation: "card",
                        animation: "fade_from_bottom",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        animationTypeForReplace: "pop",


                      }}

                    />
                    <Stack.Screen
                      name="components/community/settings/roles/roleSetting/[roleSettingId]"
                      options={{
                        presentation: "card",
                        animation: "none",
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        animationTypeForReplace: "pop",


                      }}
                    />
                  </Stack>
                </BottomSheetProvider>
              </BottomSheetModalProvider>
              <Toast></Toast>
            </KeyboardProvider>
          </Provider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>

  )
}
