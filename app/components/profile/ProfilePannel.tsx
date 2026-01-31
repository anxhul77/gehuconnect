import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';


export default function ProfilePanel() {
  return (
    // Ensure this View is explicitly styled with flex: 1 and black background
    <View style={{ flex: 1, backgroundColor: '#000' }}> 
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >

      </ScrollView>
    </View>
  );
}