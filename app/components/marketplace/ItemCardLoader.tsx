import { View, Text } from 'react-native'
import React from 'react'
import {Skeleton} from 'moti/skeleton'
export default function ItemCardLoader() {
  return (
    <View className='h-64 w-48 ml-2 rounded-xl' >
      <Skeleton colorMode='dark' width={'100%'} height={'100%'}></Skeleton>
    </View>
  )
}