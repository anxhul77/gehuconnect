import { View, Text } from 'react-native'
import React from 'react'
import { Skeleton } from 'moti/skeleton'

export default function SubjectLoader() {
  return (
    <View className='h-32   mt-2 w-32'> 
        <Skeleton colorMode={'dark'} width={'100%'}  height={'64%'} radius={10} ></Skeleton>
    </View>
  )
}