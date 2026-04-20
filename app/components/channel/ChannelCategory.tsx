import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { FlatList } from 'react-native-gesture-handler'
import ChannelCard from './ChannelCard'

interface ChannelCategoryProps{
  items:any
  communityId:string  | undefined
}

export default function ChannelCategory({items,communityId}:ChannelCategoryProps){

const [collapsed,setCollapsed]=useState(false)

const channels = items?.item?.channels || []

return(
 
<View>

<Pressable
onPress={()=>setCollapsed(prev=>!prev)}
className="flex-row items-center px-1 pt-3 pb-2"
>

<Ionicons
name="chevron-down"
size={18}
color="#999"
style={{
transform:[
{rotate:collapsed?"-90deg":"0deg"}
],
marginRight:6
}}
/>

<Text className="text-white/60 font-bold text-md">
{items?.item?.name}
</Text>

</Pressable>

{!collapsed && (

<View
style={{
maxHeight:250   
}}
>

<FlatList
data={channels}
keyExtractor={(item)=>item.id.toString()}
scrollEnabled={channels.length > 5} 
nestedScrollEnabled={true}
showsVerticalScrollIndicator={false}
renderItem={({item})=>(
<ChannelCard item={item} communityId={communityId}/>
)}
/>

</View>

)}

</View>

)
}