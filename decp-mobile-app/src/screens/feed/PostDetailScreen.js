import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import { postService } from '../../services/postService';
import useFeedStore from '../../store/feedStore';
import { COLORS, SPACING, RADIUS, FONTS } from '../../theme';
import { formatDistanceToNow } from 'date-fns';

export default function PostDetailScreen({ route, navigation }) {
  const { post: initialPost } = route.params;
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [sending, setSending] = useState(false);
  const updatePost = useFeedStore((s) => s.updatePost);

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      const { data } = await postService.addComment(post._id, { text: comment.trim() });
      const newComment = data.comment || data;
      setComments((prev) => [...prev, newComment]);
      setPost((p) => ({ ...p, commentCount: (p.commentCount || 0) + 1 }));
      updatePost(post._id, { commentCount: (post.commentCount || 0) + 1 });
      setComment('');
    } catch (e) {
      Alert.alert('Error', 'Could not post comment.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Author */}
        <View style={styles.author}>
          <Avatar uri={post.authorSnapshot?.profilePicUrl} name={post.authorSnapshot?.name} size={44} />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post.authorSnapshot?.name || 'Unknown'}</Text>
            {post.authorSnapshot?.headline ? <Text style={styles.headline}>{post.authorSnapshot.headline}</Text> : null}
            <Text style={styles.time}>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}</Text>
          </View>
        </View>

        <Text style={styles.body}>{post.text}</Text>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <View style={styles.tags}>
            {post.tags.map((t, i) => (
              <View key={i} style={styles.tag}><Text style={styles.tagText}>#{t}</Text></View>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={styles.stats}>
          <Ionicons name="heart" size={16} color={COLORS.error} />
          <Text style={styles.statText}>{post.likeCount || 0} likes</Text>
          <Ionicons name="chatbubble" size={16} color={COLORS.primary} style={{ marginLeft: 12 }} />
          <Text style={styles.statText}>{post.commentCount || 0} comments</Text>
        </View>

        {/* Comments */}
        <Text style={styles.commentsHeader}>Comments</Text>
        {comments.map((c, i) => (
          <View key={i} style={styles.commentRow}>
            <Avatar name={c.authorName || 'U'} size={32} />
            <View style={styles.commentBubble}>
              <Text style={styles.commentAuthor}>{c.authorName || 'User'}</Text>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Comment input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment…"
          placeholderTextColor={COLORS.textMuted}
          value={comment}
          onChangeText={setComment}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleComment} disabled={sending}>
          <Ionicons name="send" size={20} color={sending ? COLORS.textMuted : COLORS.primary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { padding: SPACING.md, paddingBottom: 100 },
  author: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  authorInfo: { flex: 1, marginLeft: SPACING.sm },
  authorName: { color: COLORS.text, ...FONTS.semiBold, fontSize: 15 },
  headline: { color: COLORS.textSecondary, fontSize: 12 },
  time: { color: COLORS.textMuted, fontSize: 11 },
  body: { color: COLORS.text, fontSize: 15, lineHeight: 24, marginBottom: SPACING.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.md },
  tag: { backgroundColor: COLORS.primaryLight, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { color: COLORS.primary, fontSize: 12 },
  stats: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  statText: { color: COLORS.textSecondary, fontSize: 13, marginLeft: 4 },
  commentsHeader: { color: COLORS.text, ...FONTS.semiBold, fontSize: 15, marginBottom: SPACING.sm },
  commentRow: { flexDirection: 'row', marginBottom: SPACING.sm, gap: SPACING.sm },
  commentBubble: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm },
  commentAuthor: { color: COLORS.primary, fontSize: 12, ...FONTS.semiBold, marginBottom: 2 },
  commentText: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.sm,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  commentInput: { flex: 1, color: COLORS.text, fontSize: 14, maxHeight: 100, paddingVertical: 8, paddingHorizontal: SPACING.sm },
  sendBtn: { padding: SPACING.sm },
});
