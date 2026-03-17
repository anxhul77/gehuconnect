import { Drawer } from "expo-router/drawer";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";


import { useSafeAreaInsets } from "react-native-safe-area-context";
import DrawerContent from "../components/drawer/DrawerContent";


export default function DrawerLayout() {
  const insets=useSafeAreaInsets();
  return (
    <ThemeProvider value={DarkTheme}>
      <Drawer
        drawerContent={()=><DrawerContent/>}
        screenOptions={{
        

          headerShown: false,
          drawerStyle: {
          backgroundColor: "black",
           paddingTop:insets.top,
            width: 280,
          },
         
          drawerActiveTintColor: "#FF6B35",
          drawerInactiveTintColor: "#999",
        }}
      >
      
   
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "Home",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
          <Drawer.Screen name="communities" options={{
             drawerLabel:()=>null,
              title:"dummy",
          }}>
          
        </Drawer.Screen>
       
      </Drawer>
    </ThemeProvider>
  );
}
