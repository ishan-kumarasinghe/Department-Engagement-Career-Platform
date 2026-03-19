import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react-native';
import { contentApi } from '../api/config';

const PostCard = ({ post, currentUserId, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.likedByMe || false); 
  const [likeCount, setLikeCount] = useState(post.likeCount ?? post.likes ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    try {
      const response = isLiked 
        ? await contentApi.delete(`/api/posts/${post._id}/like`)
        : await contentApi.post(`/api/posts/${post._id}/like`);
      
      setLikeCount(response.data.data.likeCount);
      setIsLiked(response.data.data.liked);
    } catch (error) {
      console.error('Like failed', error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      await contentApi.post(`/api/posts/${post._id}/comments`, { text: commentText });
      setCommentText('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Comment failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe accessor for author data depending on how the backend populates it
  const authorName = post.authorSnapshot?.name || 'Unknown User';
  const authorHeadline = post.authorSnapshot?.headline || 'DECP Member';
  
  // Format date: "2h ago" or simplistic fallback
  const dateFormatted = new Date(post.createdAt).toLocaleDateString();

  return (
    <View style={styles.card}>
      {/* Post Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          {post.authorSnapshot?.profilePicUrl ? (
            <Image source={{ uri: post.authorSnapshot.profilePicUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
          ) : (
            <Text style={styles.avatarText}>{authorName.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.authorName}>{authorName}</Text>
          <Text style={styles.authorHeadline}>{authorHeadline} • {dateFormatted}</Text>
        </View>
        <TouchableOpacity>
          <MoreHorizontal color="#6b7280" size={20} />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <Text style={styles.content}>{post.text}</Text>
      
      {/* Optional Media */}
      {post.media && post.media.length > 0 && (
        <Image 
          source={{ uri: post.media[0].url }} 
          style={styles.image} 
          resizeMode="cover" 
        />
      )}

      {/* Post Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Heart color={isLiked ? "#dc2626" : "#6b7280"} fill={isLiked ? "#dc2626" : "none"} size={20} />
          <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => setShowComments(!showComments)}>
          <MessageCircle color={showComments ? "#2563eb" : "#6b7280"} size={20} />
          <Text style={[styles.actionText, showComments && { color: "#2563eb" }]}>{post.commentCount ?? post.comments?.length ?? 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share2 color="#6b7280" size={20} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      {showComments && (
        <View style={styles.commentsContainer}>
          {(post.comments || []).map((comment, idx) => (
            <View key={comment._id || idx} style={styles.commentItem}>
              <View style={styles.commentAvatar}>
                {comment.authorSnapshot?.profilePicUrl ? (
                  <Image source={{ uri: comment.authorSnapshot.profilePicUrl }} style={{ width: 28, height: 28, borderRadius: 14 }} />
                ) : (
                  <Text style={styles.commentAvatarText}>{(comment.authorSnapshot?.name || 'U').charAt(0)}</Text>
                )}
              </View>
              <View style={styles.commentBubble}>
                <Text style={styles.commentAuthor}>{comment.authorSnapshot?.name || 'Unknown'}</Text>
                <Text style={styles.commentText}>{comment.content || comment.text}</Text>
              </View>
            </View>
          ))}
          
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={setCommentText}
              editable={!isSubmitting}
            />
            <TouchableOpacity onPress={handleComment} disabled={isSubmitting || !commentText.trim()}>
              <Text style={[styles.postButton, (!commentText.trim() || isSubmitting) && styles.postButtonDisabled]}>
                Post
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', marginBottom: 8, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  headerText: { flex: 1 },
  authorName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  authorHeadline: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  content: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 12 },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12 },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12, marginTop: 4 },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  actionText: { marginLeft: 6, color: '#6b7280', fontSize: 14, fontWeight: '500' },
  actionTextActive: { color: '#dc2626' },
  commentsContainer: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  commentItem: { flexDirection: 'row', marginBottom: 12 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#8b5cf6', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  commentAvatarText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  commentBubble: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 10 },
  commentAuthor: { fontWeight: 'bold', fontSize: 13, color: '#111827', marginBottom: 2 },
  commentText: { fontSize: 14, color: '#374151', marginTop: 2 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  commentInput: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, fontSize: 14 },
  postButton: { color: '#2563eb', fontWeight: 'bold', fontSize: 14, paddingHorizontal: 4 },
  postButtonDisabled: { color: '#9ca3af' }
});

export default PostCard;
