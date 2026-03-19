import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity, RefreshControl, ScrollView, Switch, Alert } from 'react-native';
import { Bell, Heart, MessageCircle, Briefcase, User, Trash2, Settings, CheckCheck } from 'lucide-react-native';
import { notificationApi } from '../../api/config';

const NotificationItem = ({ item, onRead, onDelete }) => {
  let IconComponent = Bell;
  let iconColor = '#4b5563'; // gray
  let bgColor = '#f3f4f6';

  switch (item.type) {
    case 'like':
      IconComponent = Heart;
      iconColor = '#dc2626';
      bgColor = '#fef2f2';
      break;
    case 'comment':
      IconComponent = MessageCircle;
      iconColor = '#2563eb';
      bgColor = '#eff6ff';
      break;
    case 'job':
    case 'job_application':
      IconComponent = Briefcase;
      iconColor = '#16a34a';
      bgColor = '#f0fdf4';
      break;
    case 'message':
      IconComponent = MessageCircle;
      iconColor = '#9333ea';
      bgColor = '#faf5ff';
      break;
    case 'follow':
      IconComponent = User;
      iconColor = '#2563eb';
      bgColor = '#eff6ff';
      break;
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
  };

  return (
    <TouchableOpacity 
      style={[styles.item, !item.read && styles.unreadItem]} 
      onPress={() => onRead(item.id || item._id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <IconComponent color={iconColor} size={20} />
      </View>
      <View style={styles.content}>
        <Text style={styles.body}>
          {item.actor?.fullName && <Text style={styles.actorName}>{item.actor.fullName} </Text>}
          {item.message || item.body || item.title}
        </Text>
        <Text style={styles.time}>{formatTime(item.timestamp || item.createdAt)}</Text>
      </View>
      
      <View style={styles.actions}>
        {!item.read && <View style={styles.unreadDot} />}
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id || item._id)}>
          <Trash2 color="#9ca3af" size={18} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    likesNotifications: true,
    commentsNotifications: true,
    jobNotifications: true,
    messageNotifications: true,
  });
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const fetchNotificationsAndPrefs = async () => {
    try {
      const [notifRes, prefRes] = await Promise.all([
        notificationApi.get('/api/notifications'),
        notificationApi.get('/api/notifications/preferences')
      ]);
      const fetchedData = notifRes.data?.data?.items || notifRes.data?.data || [];
      setNotifications(Array.isArray(fetchedData) ? fetchedData : []);
      if (prefRes.data?.data) {
        setPreferences(prefRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotificationsAndPrefs();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotificationsAndPrefs();
  }, []);

  const markAsRead = async (id) => {
    try {
      setNotifications(current => current.map(n => (n.id === id || n._id === id) ? { ...n, read: true, isRead: true } : n));
      await notificationApi.put(`/api/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(current => current.map(n => ({ ...n, read: true, isRead: true })));
      await notificationApi.put('/api/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      setNotifications(current => current.filter(n => (n.id !== id && n._id !== id)));
      await notificationApi.delete(`/api/notifications/${id}`);
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = async () => {
    setIsSavingPreferences(true);
    try {
      await notificationApi.put('/api/notifications/preferences', preferences);
      Alert.alert('Success', 'Preferences saved successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.read && !notification.isRead;
    if (filter === 'likes') return notification.type === 'like';
    if (filter === 'comments') return notification.type === 'comment';
    if (filter === 'jobs') return notification.type === 'job' || notification.type === 'job_application';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;

  const Filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'likes', label: 'Likes' },
    { id: 'comments', label: 'Comments' },
    { id: 'jobs', label: 'Jobs' },
  ];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.pageTitle}>Notifications</Text>
          {unreadCount > 0 && <Text style={styles.unreadCountText}>{unreadCount} unread</Text>}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead}>
            <CheckCheck color="#2563eb" size={16} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
        {Filters.map(tab => (
          <TouchableOpacity 
            key={tab.id} 
            style={[styles.filterPill, filter === tab.id && styles.filterPillActive]} 
            onPress={() => setFilter(tab.id)}
          >
            <Text style={[styles.filterText, filter === tab.id && styles.filterTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.preferencesContainer}>
      <View style={styles.prefHeader}>
        <Settings color="#374151" size={20} />
        <Text style={styles.prefTitle}>Notification Preferences</Text>
      </View>
      
      {[
        { id: 'likesNotifications', label: 'Post Likes', desc: 'When someone likes your post' },
        { id: 'commentsNotifications', label: 'Comments', desc: 'When someone comments on your post' },
        { id: 'jobNotifications', label: 'Job Updates', desc: 'Activity related to jobs' },
        { id: 'messageNotifications', label: 'Messages', desc: 'When you receive a new message' }
      ].map(pref => (
        <View key={pref.id} style={styles.prefRow}>
          <View style={styles.prefTextContainer}>
            <Text style={styles.prefName}>{pref.label}</Text>
            <Text style={styles.prefDesc}>{pref.desc}</Text>
          </View>
          <Switch 
            value={preferences[pref.id]} 
            onValueChange={() => togglePreference(pref.id)}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={preferences[pref.id] ? '#2563eb' : '#f3f4f6'}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.savePrefsBtn} onPress={savePreferences} disabled={isSavingPreferences}>
        {isSavingPreferences ? <ActivityIndicator color="#fff" /> : <Text style={styles.savePrefsText}>Save Preferences</Text>}
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
        data={filteredNotifications}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        renderItem={({ item }) => <NotificationItem item={item} onRead={markAsRead} onDelete={deleteNotification} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell color="#d1d5db" size={48} style={styles.emptyIcon} />
            <Text style={styles.emptyHeader}>All Caught Up!</Text>
            <Text style={styles.emptyText}>You have no notifications matching this filter.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 20 },
  
  headerContainer: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  unreadCountText: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  markAllText: { color: '#2563eb', fontWeight: '600', fontSize: 13, marginLeft: 4 },
  
  filterScroll: { paddingHorizontal: 16 },
  filterContainer: { paddingRight: 32 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 8 },
  filterPillActive: { backgroundColor: '#2563eb' },
  filterText: { fontSize: 14, fontWeight: '500', color: '#4b5563' },
  filterTextActive: { color: '#ffffff' },

  item: { flexDirection: 'row', padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', alignItems: 'center' },
  unreadItem: { backgroundColor: '#eff6ff' },
  iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  content: { flex: 1, marginRight: 8 },
  actorName: { fontWeight: 'bold', color: '#111827' },
  body: { fontSize: 14, color: '#374151', lineHeight: 20 },
  time: { fontSize: 12, color: '#9ca3af', fontWeight: '500', marginTop: 4 },
  
  actions: { flexDirection: 'row', alignItems: 'center' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563eb', marginRight: 12 },
  deleteButton: { padding: 8, backgroundColor: '#f9fafb', borderRadius: 20 },

  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32, marginBottom: 40 },
  emptyIcon: { marginBottom: 16 },
  emptyHeader: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  emptyText: { textAlign: 'center', color: '#6b7280', fontSize: 15, lineHeight: 24 },

  preferencesContainer: { backgroundColor: '#ffffff', marginTop: 16, padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  prefHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  prefTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginLeft: 8 },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  prefTextContainer: { flex: 1, marginRight: 16 },
  prefName: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  prefDesc: { fontSize: 13, color: '#6b7280' },
  savePrefsBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  savePrefsText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});

export default NotificationsScreen;
