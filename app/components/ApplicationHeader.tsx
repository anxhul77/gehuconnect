import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { Image } from "expo-image";
import { useNavigation, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

 function ApplicationHeader() {
  const navigation = useNavigation();
  const router = useRouter();
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
          height: 65,
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
         <View style={{display:'flex',flexDirection:"row",justifyContent:"center",alignItems:"center",width:110,height:50,marginLeft:10}}>
          <Image
            source={require("../../assets/images/geuconnectlogotransparent.png")}
            style={{flex:1, width:"100%", height:'100%',marginBottom:7,}}
            contentFit="cover"
            contentPosition={'center'}
          />
         
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

          <Pressable style={{ marginHorizontal: 6 }} onPress={() => router.push('/profile')}>
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
export default ApplicationHeader