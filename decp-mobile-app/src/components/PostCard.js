import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS } from '../theme';
import { formatDistanceToNow } from 'date-fns';
import Avatar from './Avatar';

export default function PostCard({ post, onPress, onLike, liked }) {
  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Author row */}
      <View style={styles.author}>
        <Avatar uri={post.authorSnapshot?.profilePicUrl} name={post.authorSnapshot?.name} size={40} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.authorSnapshot?.name || 'Unknown'}</Text>
          {post.authorSnapshot?.headline ? (
            <Text style={styles.headline}>{post.authorSnapshot.headline}</Text>
          ) : null}
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
      </View>

      {/* Post body */}
      <Text style={styles.body} numberOfLines={5}>{post.text}</Text>

      {/* Media */}
      {post.media && post.media.length > 0 && post.media[0].url ? (
        <Image source={{ uri: post.media[0].url }} style={styles.media} resizeMode="cover" />
      ) : null}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tags}>
          {post.tags.slice(0, 3).map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? COLORS.error : COLORS.textSecondary}
          />
          <Text style={[styles.actionCount, liked && { color: COLORS.error }]}>
            {post.likeCount || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionCount}>{post.commentCount || 0}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  author: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  authorInfo: { flex: 1, marginLeft: SPACING.sm },
  authorName: { color: COLORS.text, ...FONTS.semiBold, fontSize: 14 },
  headline: { color: COLORS.textSecondary, fontSize: 12, marginTop: 1 },
  time: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  body: { color: COLORS.text, fontSize: 14, lineHeight: 22, marginBottom: SPACING.sm },
  media: { width: '100%', height: 200, borderRadius: RADIUS.sm, marginBottom: SPACING.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  tag: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.round, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { color: COLORS.primary, fontSize: 11, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCount: { color: COLORS.textSecondary, fontSize: 13 },
});
