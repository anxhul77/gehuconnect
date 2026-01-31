import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NotificationProps {
  initial: string;
  clubName: string;
  actionText: string;
  time: string;
  isUnread?: boolean;
}

export default function NotificationItem({ initial, clubName, actionText, time, isUnread }: NotificationProps) {
  return (
    <View style={[styles.container, isUnread && styles.unreadBorder]}>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

   
      <View style={styles.content}>
        <Text style={styles.textMain}>
          <Text style={styles.bold}>{clubName}</Text> {actionText}
        </Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      {isUnread && <View style={styles.dot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e', 
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  unreadBorder: {
    borderColor: '#4d2d1a', 
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  textMain: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
  },
  bold: {
    color: 'white',
    fontWeight: 'bold',
  },
  timeText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginLeft: 8,
  }
});