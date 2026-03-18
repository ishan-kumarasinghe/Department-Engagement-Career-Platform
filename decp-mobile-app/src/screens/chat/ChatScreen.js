import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import { chatService } from '../../services/chatService';
import { CHAT_SOCKET_URL } from '../../config/api';
import useAuthStore from '../../store/authStore';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SPACING, RADIUS, FONTS } from '../../theme';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../../components/Avatar';

export default function ChatScreen({ route }) {
  const { conversationId, name } = route.params;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);

  // Load initial messages via REST
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await chatService.getMessages(conversationId);
        const msgs = data.messages || data;
        setMessages(msgs.reverse()); // oldest first
      } catch (e) {
        console.log('Load messages error', e.message);
      }
    };
    loadMessages();
  }, [conversationId]);

  // Connect Socket.IO
  useEffect(() => {
    let socket;

    (async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      socket = io(CHAT_SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });
      socketRef.current = socket;

      socket.emit('join', { conversationId });

      socket.on('newMessage', (msg) => {
        setMessages((prev) => [...prev, msg]);
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    })();

    return () => {
      socket?.disconnect();
    };
  }, [conversationId]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setText('');
    setSending(true);
    try {
      await chatService.sendMessage(conversationId, { text: msgText });
    } catch (e) {
      console.log('Send message error', e.message);
    } finally {
      setSending(false);
    }
  };

  const isOwn = (msg) => msg.senderId === user?._id || msg.senderId?._id === user?._id;

  const renderMessage = ({ item }) => {
    const own = isOwn(item);
    const timeStr = item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : '';
    return (
      <View style={[styles.msgRow, own && styles.msgRowOwn]}>
        {!own && <Avatar name={name} size={30} />}
        <View style={[styles.bubble, own ? styles.bubbleOwn : styles.bubbleOther]}>
          <Text style={[styles.msgText, own && styles.msgTextOwn]}>{item.text}</Text>
          <Text style={[styles.msgTime, own && { color: 'rgba(255,255,255,0.5)' }]}>{timeStr}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, i) => item._id || String(i)}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          placeholderTextColor={COLORS.textMuted}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending || !text.trim()}>
          <Ionicons name="send" size={20} color={text.trim() ? COLORS.primary : COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, paddingBottom: 16 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: SPACING.sm },
  msgRowOwn: { flexDirection: 'row-reverse' },
  bubble: { maxWidth: '75%', borderRadius: RADIUS.lg, paddingHorizontal: SPACING.sm, paddingVertical: 10 },
  bubbleOwn: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  msgText: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  msgTextOwn: { color: '#fff' },
  msgTime: { color: COLORS.textMuted, fontSize: 10, marginTop: 3, textAlign: 'right' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.sm,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  input: {
    flex: 1, color: COLORS.text, fontSize: 14, maxHeight: 100,
    paddingVertical: 10, paddingHorizontal: SPACING.sm,
  },
  sendBtn: { padding: 10, justifyContent: 'center', alignItems: 'center' },
});
