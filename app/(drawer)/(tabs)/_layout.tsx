import { Tabs, useNavigation, useRouter } from 'expo-router';
import React from 'react'
import {Ionicons, MaterialIcons} from '@expo/vector-icons'
import { BlurView } from 'expo-blur';
import {  Pressable, StyleSheet, Text, View } from 'react-native';
import { DarkTheme, DrawerActions, ThemeProvider } from '@react-navigation/native';
import {  useSafeAreaInsets } from 'react-native-safe-area-context';

import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image } from 'expo-image';


export default function _Layout(){
 const insets=useSafeAreaInsets()
  
  
    
    return(
        <ThemeProvider value={DarkTheme}>
         
        <Tabs screenOptions={{
          headerTitle: '',
          headerShown: true,
      
          header: () => (<Header/>),
           headerStyle:{
            height:80,
            backgroundColor:'black'
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

function Header() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const handleMenuClick=()=>{
    console.log("clickef")
    navigation.dispatch(DrawerActions.openDrawer());
  }
  return (
    <View
      style={{
        backgroundColor: "black",
        paddingTop: insets.top,
        paddingHorizontal: 12,
        borderBottomWidth:1,
        borderBottomColor:"rgba(255,255,255,0.15)"

      }}
    >
      <View
        style={{
          height: 60,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
      
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 6, 
          }}
        >
          <Pressable onPress={()=>{handleMenuClick()}}>
            <View style={styles.iconBox}>
              <MaterialIcons name="menu" size={26} color="#999" />
            </View>
          </Pressable>
         <View style={{display:'flex',flexDirection:"row",justifyContent:"center",alignItems:"center",width:120,height:80,marginLeft:10}}>
          <Image
            source={require("../../../assets/images/logoremovedbg.png")}
            style={{flex:1, width:"100%", height:'100%',marginBottom:7,}}
            contentFit="cover"
            contentPosition={'center'}
          />
          <View className='flex justify-center mt-3'>
          <Text className="text-md text-[#FF6B35] font-bold absolute mb-8 mr-7">GEU</Text>
            <Text className="text-md text-[#ed5118] font-bold ml-2">CONNECT</Text>
            </View>
          </View>
        </View>

  
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: "auto",
          }}
        >
          <Pressable style={{ marginHorizontal: 6 }}>
            <View style={styles.iconBox}>
              <Ionicons name="search-outline" size={24} color="#999" />
            </View>
          </Pressable>

          <Pressable style={{ marginHorizontal: 6 }}>
            <View style={styles.iconBox}>
              <Ionicons name="person-outline" size={24} color="#999" />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox:{
  width: 40,
  height: 40,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  }
}
)