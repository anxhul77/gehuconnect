import { Redirect, Stack } from "expo-router";
import "./globals.css";
import { Provider, useSelector } from "react-redux";
import { RootState, store } from "../src/store/Store";
import 'react-native-reanimated';

import "text-encoding"
import Toast from "react-native-toast-message";
import { configureReanimatedLogger } from "react-native-reanimated";


export default function index() {
  configureReanimatedLogger({
    strict: false
  })
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
  const ready = false

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
    <>
      <Redirect href="/(auth)"></Redirect>

    </>
  )
}
