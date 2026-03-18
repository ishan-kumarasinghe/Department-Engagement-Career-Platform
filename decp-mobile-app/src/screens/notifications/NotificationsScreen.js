import React, { useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotifItem from '../../components/NotifItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import useNotifStore from '../../store/notifStore';
import { COLORS, SPACING, RADIUS, FONTS } from '../../theme';

export default function NotificationsScreen() {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (isLoading && notifications.length === 0) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {/* Header action */}
      {notifications.some((n) => !n.isRead) && (
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead}>
          <Ionicons name="checkmark-done" size={16} color={COLORS.primary} />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchNotifications} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <NotifItem
            notif={item}
            onPress={() => !item.isRead && markAsRead(item._id)}
            onDelete={() => deleteNotification(item._id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    alignSelf: 'flex-end',
  },
  markAllText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  list: { padding: SPACING.md, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: COLORS.textMuted, marginTop: SPACING.md, fontSize: 15 },
});
