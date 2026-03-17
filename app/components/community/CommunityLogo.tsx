import { View, Text, Pressable,StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'

export default function CommunityLogo({imageUrl}:{imageUrl:any}) {
  return (
    <Pressable className=' mx-4 mb-4 rounded-2xl   ' style={{height:55}} >
      <Image source={{ uri: imageUrl }}
                  
                   style={[StyleSheet.absoluteFillObject,styles.imageStyle]}
                   contentFit="cover"
>

     </Image>
     
    </Pressable>
  )
}
const styles=StyleSheet.create({
  imageStyle:{
  
    borderRadius:12,
  }
})