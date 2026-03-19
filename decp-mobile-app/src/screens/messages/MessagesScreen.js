import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity, RefreshControl, TextInput, KeyboardAvoidingView, Platform, Modal, Image, SafeAreaView } from 'react-native';
import { MessageSquare, ChevronLeft, Send, Plus, X, Search } from 'lucide-react-native';
import { chatApi, userApi } from '../../api/config';
import { useAuth } from '../../context/AuthContext';

const MessagesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Chat View State
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  // New Chat Modal State
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Helpers
  const getConversationName = (conv) => conv?.otherMember?.fullName || conv?.title || 'Direct Message';
  const getInitials = (name) => name?.charAt(0)?.toUpperCase() || '?';

  const fetchConversations = async () => {
    try {
      const response = await chatApi.get('/api/conversations');
      const fetchedData = response.data?.data?.items || response.data?.data || [];
      setConversations(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, []);

  const fetchMessages = async (convId) => {
    try {
      const response = await chatApi.get(`/api/conversations/${convId}/messages`);
      setMessages(response.data.data || []);
      // Scroll to bottom when messages load
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (e) {
      console.error('Failed to fetch messages', e);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    fetchMessages(conv._id);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    setIsSending(true);
    try {
      const response = await chatApi.post(`/api/conversations/${selectedConversation._id}/messages`, {
        text: messageInput.trim()
      });
      const savedMessage = response.data.data;
      setMessages((prev) => [...prev, savedMessage]);
      setMessageInput('');
      fetchConversations(); // Quietly refresh inbox previews
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.error('Failed to send message', e);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!showNewChatModal || !userSearchQuery.trim()) {
      setUserSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const response = await userApi.get('/', { params: { search: userSearchQuery.trim(), limit: 10 } });
        setUserSearchResults(response.data.users?.filter((u) => u._id !== user?._id) || []);
      } catch (e) {
        console.error('Failed to search users', e);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearchQuery, showNewChatModal]);

  const startNewChat = async (targetUser) => {
    try {
      const response = await chatApi.post('/api/conversations/direct', {
        recipientId: targetUser._id,
        recipientSnapshot: {
          fullName: targetUser.fullName,
          role: targetUser.role,
          profilePicUrl: targetUser.profilePicUrl,
        }
      });
      const conv = response.data.data;
      setShowNewChatModal(false);
      setUserSearchQuery('');
      setConversations(prev => [conv, ...prev.filter(c => c._id !== conv._id)]);
      handleSelectConversation(conv);
    } catch (e) {
      console.error('Failed to start chat', e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // --- RENDERING CHAT VIEW ---
  if (selectedConversation) {
    return (
      <KeyboardAvoidingView style={styles.chatContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedConversation(null)} style={styles.backButton}>
            <ChevronLeft color="#111827" size={28} />
          </TouchableOpacity>
          <View style={styles.chatHeaderAvatar}>
            {selectedConversation.otherMember?.profilePicUrl ? (
              <Image source={{ uri: selectedConversation.otherMember.profilePicUrl }} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
            ) : (
              <Text style={styles.avatarText}>{getInitials(getConversationName(selectedConversation))}</Text>
            )}
          </View>
          <View>
            <Text style={styles.chatTitle}>{getConversationName(selectedConversation)}</Text>
            <Text style={styles.chatSubtitle} capitalize>{selectedConversation.otherMember?.role || 'Member'}</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id || Math.random().toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const isOwn = String(item.senderId) === String(user?._id);
            return (
              <View style={[styles.messageWrapper, isOwn ? styles.messageOwn : styles.messageOther]}>
                <View style={[styles.messageBubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                  <Text style={[styles.messageText, isOwn ? styles.textOwn : styles.textOther]}>{item.text}</Text>
                </View>
                <Text style={styles.messageTime}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No messages yet. Send the first one.</Text>}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!messageInput.trim() || isSending) && { opacity: 0.5 }]} 
            onPress={handleSendMessage} 
            disabled={isSending || !messageInput.trim()}
          >
            {isSending ? <ActivityIndicator color="#ffffff" size="small" /> : <Send color="#ffffff" size={20} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // --- RENDERING INBOX VIEW ---
  return (
    <View style={styles.container}>
      <View style={styles.inboxHeader}>
        <Text style={styles.inboxTitle}>Messages</Text>
        <TouchableOpacity style={styles.newChatBtn} onPress={() => setShowNewChatModal(true)}>
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelectConversation(item)}>
            <View style={styles.avatar}>
              {item.otherMember?.profilePicUrl ? (
                <Image source={{ uri: item.otherMember.profilePicUrl }} style={{ width: '100%', height: '100%', borderRadius: 25 }} />
              ) : (
                <Text style={styles.avatarText}>{getInitials(getConversationName(item))}</Text>
              )}
            </View>
            <View style={styles.itemContent}>
              <View style={styles.headerRow}>
                <Text style={styles.name} numberOfLines={1}>{getConversationName(item)}</Text>
                <Text style={styles.time}>{item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
              </View>
              <Text style={styles.preview} numberOfLines={1}>{item.lastMessage?.text || 'No messages yet'}</Text>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageSquare color="#d1d5db" size={48} style={styles.emptyIcon} />
            <Text style={styles.emptyHeader}>No Messages Yet</Text>
            <Text style={styles.emptyText}>Start connecting with alumni and students to build your network.</Text>
          </View>
        }
      />

      {/* NEW CHAT MODAL */}
      <Modal visible={showNewChatModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Search Users</Text>
            <TouchableOpacity onPress={() => setShowNewChatModal(false)} style={{ padding: 8 }}>
              <X color="#111827" size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchModalInputContainer}>
            <Search color="#9ca3af" size={20} />
            <TextInput 
              style={styles.searchModalInput}
              placeholder="Search by name..."
              value={userSearchQuery}
              onChangeText={setUserSearchQuery}
              autoFocus
            />
          </View>

          {isSearchingUsers ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#2563eb" />
          ) : (
            <FlatList
              data={userSearchResults}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.searchResultItem} onPress={() => startNewChat(item)}>
                  <View style={[styles.avatar, { width: 44, height: 44, borderRadius: 22 }]}>
                    {item.profilePicUrl ? (
                      <Image source={{ uri: item.profilePicUrl }} style={{ width: '100%', height: '100%', borderRadius: 22 }} />
                    ) : (
                      <Text style={styles.avatarText}>{getInitials(item.fullName)}</Text>
                    )}
                  </View>
                  <View style={styles.searchResultText}>
                    <Text style={styles.searchResultName}>{item.fullName}</Text>
                    <Text style={styles.searchResultRole} capitalize>{item.role}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                userSearchQuery.trim() ? <Text style={styles.emptyText}>No users found.</Text> : null
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inboxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  inboxTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  newChatBtn: { backgroundColor: '#2563eb', padding: 8, borderRadius: 20 },
  listContent: { paddingBottom: 20 },
  item: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  itemContent: { flex: 1, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#111827', flex: 1, marginRight: 8 },
  time: { fontSize: 12, color: '#6b7280' },
  preview: { fontSize: 14, color: '#6b7280' },

  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyIcon: { marginBottom: 16 },
  emptyHeader: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  emptyText: { textAlign: 'center', color: '#6b7280', fontSize: 14, lineHeight: 24, paddingVertical: 20 },

  // Chat View Styles
  chatContainer: { flex: 1, backgroundColor: '#f9fafb' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: Platform.OS === 'ios' ? 50 : 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { padding: 4, marginRight: 8 },
  chatHeaderAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  chatTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  chatSubtitle: { fontSize: 12, color: '#6b7280', textTransform: 'capitalize' },
  
  messageWrapper: { marginBottom: 16, maxWidth: '80%' },
  messageOwn: { alignSelf: 'flex-end' },
  messageOther: { alignSelf: 'flex-start' },
  messageBubble: { padding: 12, borderRadius: 16 },
  bubbleOwn: { backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#e5e7eb', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  textOwn: { color: '#ffffff' },
  textOther: { color: '#111827' },
  messageTime: { fontSize: 11, color: '#9ca3af', marginTop: 4, alignSelf: 'flex-end' },

  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb', alignItems: 'flex-end', paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  messageInput: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 16, maxHeight: 100, marginRight: 12, color: '#111827' },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#ffffff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  searchModalInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', margin: 16, paddingHorizontal: 12, borderRadius: 10 },
  searchModalInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16 },
  searchResultItem: { flexDirection: 'row', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  searchResultText: { flex: 1 },
  searchResultName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  searchResultRole: { fontSize: 13, color: '#6b7280', textTransform: 'capitalize', marginTop: 2 }
});

export default MessagesScreen;
