import { Text, View } from 'react-native'
import React, { Component } from 'react'
import {Drawer} from "expo-router/drawer"
export default class _layout extends Component {
  render() {
    return (
      <Drawer>
     <Drawer.Screen name="[id]" options={{drawerStyle:{width:'50%'}}} >
     
     </Drawer.Screen>
      </Drawer>
    )
  }
}