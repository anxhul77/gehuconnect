import { Tabs, useNavigation, useRouter } from 'expo-router';
import React from 'react'
import {Ionicons, MaterialIcons} from '@expo/vector-icons'
import { BlurView } from 'expo-blur';
import {  Pressable, StyleSheet, Text, View } from 'react-native';

import {  useSafeAreaInsets } from 'react-native-safe-area-context';

import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image } from 'expo-image';

import AcadmicsHeader from '@/app/components/acadmics/AcadmicsHeader';
import ApplicationHeader  from '@/app/components/ApplicationHeader';


export default function _Layout(){
 const insets=useSafeAreaInsets()
  
  
    
    return(
    
         
        <Tabs screenOptions={{
          headerTitle: '',
          headerShown: true,
      
        
 
    
        
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
            height:insets.bottom+55,
            borderTopWidth: 1,
            borderLeftWidth:0.5,
            borderLeftColor:'rgba(255,255,255,0.15)',
            borderRightWidth:0.5,
            borderRightColor:'rgba(255,255,255,0.15)',
            borderTopColor:'rgba(255,255,255,0.15)',
            elevation: 0,
            backgroundColor:'black'
          },
          tabBarBackground: () => (
    
              <BlurView
                intensity={300}
                tint="dark"
               
                style={{...StyleSheet.absoluteFillObject, overflow:"hidden",backgroundColor:"transparent"}}
           
              />
          )
        }}>
            <Tabs.Screen
             name="index"
             options={{title:'home',tabBarIcon:({focused,size})=>(
               <AntDesign name="home" size={size} color={focused ? "#FF6B35": "#999"}  />
                
            ),header: () => (<ApplicationHeader/>),
        }}
             />
            <Tabs.Screen
              name="communities"
              options={{title:"Communities",tabBarIcon:({focused,size})=>(
                <SimpleLineIcons name="people" size={size} color={focused ? "#FF6B35": "#999"} />
              ) ,headerShown:false }
              }
             
            />
           <Tabs.Screen name="acadmics"
                     options={{title:"Acadmics",tabBarIcon:({focused,size})=>(
                    <Feather name="book-open" size={size} color={focused? "#FF6B35": "#999"} />), header:()=>(<AcadmicsHeader/>),}}></Tabs.Screen>

                     
           
            <Tabs.Screen
             name="marketplace"
             options={{title:'Marketplace',tabBarIcon:({focused,size})=>(
                <FontAwesome name="shopping-bag" size={size} color={focused? "#FF6B35": "#999"}  />
                
            ), headerShown:false}}/>
        </Tabs>
       
       
    )

}

