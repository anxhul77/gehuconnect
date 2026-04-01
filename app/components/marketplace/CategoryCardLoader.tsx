import { View, Text } from 'react-native'
import React from 'react'
import { Skeleton } from 'moti/skeleton'

export default function CategoryCardLoader() {
  return (
    <View className="h-10  w-24 ">
      <Skeleton colorMode={'dark'} width={"100%"} height={"100%"} radius={18}></Skeleton>
    </View>
  )
}