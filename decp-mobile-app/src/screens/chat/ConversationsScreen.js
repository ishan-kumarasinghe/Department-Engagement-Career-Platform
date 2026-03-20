import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatService } from '../../services/chatService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Avatar from '../../components/Avatar';
import { COLORS, SPACING, RADIUS, FONTS } from '../../theme';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../../store/authStore';

export default function ConversationsScreen({ navigation }) {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await chatService.listConversations();
      setConversations(data.conversations || data);
    } catch (e) {
      console.log('Conversations error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getOtherParticipant = (conv) => {
    if (!conv.participants) return { name: 'Unknown' };
    return conv.participants.find((p) => p._id !== user?._id) || conv.participants[0] || { name: 'Unknown' };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
      renderItem={({ item }) => {
        const other = getOtherParticipant(item);
        const lastMsg = item.lastMessage;
        const timeAgo = lastMsg?.createdAt ? formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: true }) : '';
        return (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('Chat', { conversationId: item._id, name: other.fullName || other.name })}
            activeOpacity={0.85}
          >
            <Avatar uri={other.profilePicUrl} name={other.fullName || other.name || 'U'} size={48} />
            <View style={styles.info}>
              <Text style={styles.name}>{other.fullName || other.name || 'User'}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>{lastMsg?.text || 'No messages yet'}</Text>
            </View>
            <Text style={styles.time}>{timeAgo}</Text>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptyHint}>Find users in the Network tab to start chatting</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.sm, backgroundColor: COLORS.background, flexGrow: 1 },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, marginBottom: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm,
  },
  info: { flex: 1 },
  name: { color: COLORS.text, ...FONTS.semiBold, fontSize: 15 },
  lastMsg: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  time: { color: COLORS.textMuted, fontSize: 11 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: COLORS.textMuted, marginTop: SPACING.md, fontSize: 15 },
  emptyHint: { color: COLORS.textMuted, fontSize: 12, marginTop: 6 },
});
