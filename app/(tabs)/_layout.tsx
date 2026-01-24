import { Tabs } from 'expo-router';
import React, { useEffect } from 'react'
import {Ionicons, MaterialIcons} from '@expo/vector-icons'
import { BlurView } from 'expo-blur';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import AntDesign from '@expo/vector-icons/AntDesign';


export default function _Layout(){
    const insets=useSafeAreaInsets();
  
    useEffect(()=>{
        if(Platform.OS == 'android'){
            NavigationBar.setBackgroundColorAsync('transparent');
            NavigationBar.setButtonStyleAsync('dark');}},[]);
        
    
    return(
        <ThemeProvider value={DarkTheme}>
        <Tabs screenOptions={{
          headerTitle: '',
          headerShown: true,
          headerTransparent: true,
          headerRight: () => (<Rightheader/>),
          headerBackground: () => (
            <View style={{ flex: 1 }}>
              <BlurView
                intensity={16}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 1,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  zIndex: 1,
                }}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.08)',
            shadowOpacity: 0,
          },
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: '#999',
          tabBarItemStyle: {
            width: "100%",
            height: "100%",
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 5
          },
          tabBarStyle: {
            position: 'absolute',
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            bottom: 16,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarBackground: () => (
            <View style={{ flex: 1, overflow: 'hidden' }}>
              <BlurView
                intensity={16}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(20,20,20,0.30)',
                }}
              />
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255,255,255,0.08)'
                }}
              />
            </View>
          )
        }}>
            

           
            <Tabs.Screen
             name="index"
             options={{title:'home',tabBarIcon:({focused,size})=>(
               <AntDesign name="home" size={size} color={focused ? "#FF6B35": "#999"} />
                
            )}}
             />
            <Tabs.Screen
              name="communities"
              options={{title:"communities",tabBarIcon:({focused,size})=>(
                <SimpleLineIcons name="people" size={size} color={focused ? "#FF6B35": "#999"} />
              )}
              }
             
            />
           <Tabs.Screen name="acadmics"
                     options={{title:"Acadmics",tabBarIcon:({focused,size})=>(
                    <Feather name="book-open" size={size} color={focused? "#FF6B35": "#999"} />)}}></Tabs.Screen>

                     
           
            <Tabs.Screen
             name="marketplace"
             options={{title:'Marketplace',tabBarIcon:({focused,size})=>(
                <FontAwesome name="shopping-bag" size={size} color={focused? "#FF6B35": "#999"} />
                
            )}}/>
        </Tabs>
        </ThemeProvider>
    )

}

function Rightheader() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, backgroundColor: 'transparent', height: 40, paddingLeft: insets.left, paddingRight: insets.right }}>
      <Pressable  onPress={() => ('/menu')}>
          <View style={{
            width: 40,
            height: 40,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.10)',
          }}>
            <MaterialIcons name="menu" size={28} color="#999" />
          </View>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 8 }}>
        <Pressable style={{ paddingHorizontal: 8 }} onPress={() => ('/notifications')}>
          <View style={{
            width: 40,
            height: 40,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.10)',
          }}>
            <Ionicons name="search-outline" size={28} color="#999"/>
          </View>
        </Pressable>
        <Pressable style={{ paddingHorizontal: 8 }} onPress={() => ('/Profile')}>
          <View style={{
            width: 40,
            height: 40,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.10)',
          }}>
            <Ionicons name="person-outline" size={28} color="#999" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
