import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { DarkTheme, ThemeProvider } from '@react-navigation/native'

export default function _layout() {
  return (
    <ThemeProvider value={DarkTheme}>
     <Stack
      screenOptions={{
        headerShown: false,  
        animation: "slide_from_right",
      }}
     />

     </ThemeProvider>
  )
}