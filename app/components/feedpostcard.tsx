import { View, Text } from 'react-native'
import React from 'react'

export default function Feedpostcard() {
  console.log('Feedpostcard rendered');
  return (
    <View style={{ width: 160, height: 80, backgroundColor: 'black', borderColor: '#94a3b8', borderWidth: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 12, margin: 16 }}>
      <Text style={{ color: 'white' }}>feedpostcard</Text>
    </View>
  );
}