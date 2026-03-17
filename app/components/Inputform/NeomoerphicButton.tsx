import { View, Text } from 'react-native'
import React from 'react'
import { Shadow } from 'react-native-shadow-2'

export default function NeomoerphicButtonss() {
  return (
     <Shadow
          distance={7}
          startColor={'#dddddd'}
          endColor={'#e0e0e0'}
          offset={[1,1]}
          
          
          style={{
            borderRadius: 20,
            backgroundColor: '#0A0A0A', 
            width: 300,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text>Neumorphic</Text>
        </Shadow>
  )
}