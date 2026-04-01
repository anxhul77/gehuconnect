import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';


export default function ProfilePanel() {
  return (

    <View style={{ flex: 1, backgroundColor: '#000' }}> 
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >

      </ScrollView>
    </View>
  );
}