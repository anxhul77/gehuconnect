import { View, Text } from 'react-native'
import React from 'react'
type props={
    label:string;
    color:string;
    icon:any
}
export default function TagCard({label,color,icon}:props) {
  return (
   <View
               style={{ backgroundColor: `${color}20` }}
               className="self-start px-2 py-1 rounded-2xl  flex flex-row items-center justify-center gap-1"
             >
               {icon}
               <Text
                 style={{ color: color }}
                 className="text-[10px] font-bold"
               >
                 {label}
               </Text>
             </View>
        
  )
}