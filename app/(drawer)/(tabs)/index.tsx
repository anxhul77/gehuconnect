
import { ScrollView, Text, View } from "react-native";
import Feedpostcard from "../../components/Feedpostcard";
import type{ AppDispatch } from '@/src/store/Store';
import { useDispatch } from 'react-redux';


import {  useState } from "react";

export default function Index() {
   const [loading,setLoading]=useState(false);
   const dispatch=useDispatch<AppDispatch>();
 

   /*const user={name: "anshul",
email: "abv@gmail.com",
password: "anshuljKH",
college: "gehu",
verfied: true,
role: "USER",}
   useEffect(()=>{
    dispatch((RegisterUser(user,setLoading)))
   },[]);*/
  return (
    <ScrollView className="">
    <View  className="flex-1 justify-center items-center " >
 
      <Text className="text-xl font-bold ">welcome</Text>
     
      <Feedpostcard/>
           <Feedpostcard/>
                <Feedpostcard/>
            
    </View>
    
    </ScrollView>
  );
}
