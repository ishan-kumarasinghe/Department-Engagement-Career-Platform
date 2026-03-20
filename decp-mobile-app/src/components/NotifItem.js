import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../theme';
import { formatDistanceToNow } from 'date-fns';

const typeIcons = {
  like: { name: 'heart', color: COLORS.error },
  comment: { name: 'chatbubble', color: COLORS.primary },
  job: { name: 'briefcase', color: COLORS.secondary },
  message: { name: 'mail', color: '#4F8EF7' },
  default: { name: 'notifications', color: COLORS.textSecondary },
};

export default function NotifItem({ notif, onPress, onDelete }) {
  const icon = typeIcons[notif.type] || typeIcons.default;
  const timeAgo = notif.createdAt
    ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
    : '';

  return (
    <TouchableOpacity
      style={[styles.card, !notif.isRead && styles.unread]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconBg, { backgroundColor: icon.color + '22' }]}>
        <Ionicons name={icon.name} size={18} color={icon.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.message} numberOfLines={2}>{notif.message || notif.title || 'New notification'}</Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>
      {!notif.isRead && <View style={styles.dot} />}
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Ionicons name="close" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  unread: { borderColor: COLORS.primary + '55', backgroundColor: COLORS.surfaceAlt },
  iconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  message: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  time: { color: COLORS.textMuted, fontSize: 11, marginTop: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  deleteBtn: { padding: 4 },
});
