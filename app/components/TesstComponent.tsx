import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { FlashList } from "@shopify/flash-list";

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: '2', text: 'Hello!', sender: 'other' },
    { id: '1', text: 'Hi there!', sender: 'me' },
  ]);

  const [inputText, setInputText] = useState('');
  const listRef = useRef(null);

  const sendMessage = () => {
    if (inputText.trim() === '') return;
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
    };
    // Prepend new messages to the beginning of the array when inverted
    setMessages((prev) => [newMessage, ...prev]);
    setInputText('');
  };

  const renderItem = ({ item }) => (
    <View style={[styles.bubble, item.sender === 'me' ? styles.myBubble : styles.otherBubble]}>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
    >
      <View style={styles.listContainer}>
        <FlashList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          estimatedItemSize={50}
          inverted={true} // Reverses list, new items appear at bottom
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContainer: { flex: 1 },
  listContent: { paddingHorizontal: 10, paddingBottom: 10 },
  bubble: { padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: '80%' },
  myBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  otherBubble: { backgroundColor: '#E5E5EA', alignSelf: 'flex-start' },
  text: { color: 'white' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee', },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 15, height: 40 },
  sendButton: { marginLeft: 10, justifyContent: 'center' },
  sendText: { color: '#007AFF', fontWeight: 'bold' },
});
