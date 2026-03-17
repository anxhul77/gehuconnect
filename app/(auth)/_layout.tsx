
import { Stack } from 'expo-router'

export default function _Layout() {
  return (
    <Stack screenOptions={{ headerShown: true, }}>
      <Stack.Screen name="index" options={{headerShown:false}} />
      <Stack.Screen name="login" />
      <Stack.Screen name="registerform" options={{headerBackTitle:"Back"}}/>
    </Stack>
  )
}