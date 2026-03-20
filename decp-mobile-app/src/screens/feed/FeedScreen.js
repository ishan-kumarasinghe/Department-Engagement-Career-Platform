import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity, Text, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import useFeedStore from '../../store/feedStore';
import useAuthStore from '../../store/authStore';
import { postService } from '../../services/postService';
import { COLORS, SPACING, RADIUS } from '../../theme';

export default function FeedScreen({ navigation }) {
  const { posts, fetchFeed, updatePost, isLoading } = useFeedStore();
  const { user } = useAuthStore();
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFeed(true);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFeed(true);
    setRefreshing(false);
  }, []);

  const handleLike = async (post) => {
    const isLiked = likedPosts.has(post._id);
    try {
      if (isLiked) {
        await postService.unlikePost(post._id);
        updatePost(post._id, { likeCount: Math.max(0, (post.likeCount || 0) - 1) });
        setLikedPosts((prev) => { const n = new Set(prev); n.delete(post._id); return n; });
      } else {
        await postService.likePost(post._id);
        updatePost(post._id, { likeCount: (post.likeCount || 0) + 1 });
        setLikedPosts((prev) => new Set([...prev, post._id]));
      }
    } catch (e) {
      console.log('Like error', e.message);
    }
  };

  const renderItem = ({ item }) => (
    <PostCard
      post={item}
      liked={likedPosts.has(item._id)}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
      onLike={() => handleLike(item)}
    />
  );

  if (isLoading && posts.length === 0) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        onEndReached={() => fetchFeed(false)}
        onEndReachedThreshold={0.4}
        ListFooterComponent={isLoading && posts.length > 0 ? <LoadingSpinner size="small" /> : null}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="newspaper-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No posts yet. Be the first!</Text>
          </View>
        }
      />

      {/* Floating Action Button – create post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: COLORS.textMuted, marginTop: SPACING.md, fontSize: 15 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
});
