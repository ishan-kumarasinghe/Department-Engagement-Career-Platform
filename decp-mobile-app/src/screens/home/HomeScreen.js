import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { PenSquare } from 'lucide-react-native';
import { contentApi } from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/PostCard';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await contentApi.get('/api/posts');
      const fetchedData = response.data?.data?.items || response.data?.data || [];
      setPosts(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  const renderHeader = () => (
    <View style={styles.createPostContainer}>
      <View style={styles.avatar}>
        {user?.profilePicUrl ? (
          <Image source={{ uri: user.profilePicUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        ) : (
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
        )}
      </View>
      <TouchableOpacity 
        style={styles.createPostButton}
        onPress={() => {
          // Future: Navigate to CreatePostScreen
          // navigation.navigate('CreatePost');
        }}
      >
        <Text style={styles.createPostText}>Start a post...</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton}>
        <PenSquare color="#2563eb" size={24} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PostCard post={item} currentUserId={user?._id} onUpdate={fetchPosts} />}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No posts found. Be the first to post!</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 20 },
  createPostContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#9333ea', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  createPostButton: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 12 },
  createPostText: { color: '#6b7280', fontSize: 15 },
  iconButton: { padding: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6b7280', fontSize: 16 }
});

export default HomeScreen;
