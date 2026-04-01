
import React from 'react'
import { Stack, useRouter } from 'expo-router'




export default function Layout() {
  return (
    <Stack
      screenOptions={{
      
      headerShown:false
      }}
    >
      <Stack.Screen  options={{
       
      }} name="[channelId]" />
    </Stack>
  )
}

