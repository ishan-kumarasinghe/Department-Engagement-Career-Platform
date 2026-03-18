import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { userService } from '../../services/userService';
import { chatService } from '../../services/chatService';
import { COLORS, SPACING, RADIUS, FONTS } from '../../theme';

export default function NetworkScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search.trim()) params.search = search.trim();
      const { data } = await userService.getUsers(params);
      setUsers(data.users || data);
    } catch (e) {
      console.log('Network error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const handleStartChat = async (user) => {
    try {
      const { data } = await chatService.createOrGetDirect(user._id);
      const conv = data.conversation || data;
      navigation.navigate('ChatTab', {
        screen: 'Chat',
        params: { conversationId: conv._id, name: user.fullName },
      });
    } catch (e) {
      console.log('Start chat error', e.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  const ROLES = ['all', 'student', 'alumni'];

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, skills…"
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          onSubmitEditing={load}
        />
      </View>

      {/* Role filter */}
      <FlatList
        data={ROLES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, roleFilter === item && styles.chipActive]}
            onPress={() => setRoleFilter(item)}
          >
            <Text style={[styles.chipText, roleFilter === item && styles.chipTextActive]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Users list */}
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userRow}
            onPress={() => navigation.navigate('Profile', { userId: item._id })}
            activeOpacity={0.85}
          >
            <Avatar uri={item.profilePicUrl} name={item.fullName} size={48} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.fullName}</Text>
              {item.headline ? <Text style={styles.userHeadline} numberOfLines={1}>{item.headline}</Text> : null}
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{item.role}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.chatBtn} onPress={() => handleStartChat(item)}>
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: SPACING.md, margin: SPACING.md, height: 46,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14 },
  filterRow: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.round, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: SPACING.md, paddingBottom: 40 },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.xs, borderWidth: 1, borderColor: COLORS.border,
  },
  userInfo: { flex: 1 },
  userName: { color: COLORS.text, ...FONTS.semiBold, fontSize: 15 },
  userHeadline: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  roleBadge: { marginTop: 4, alignSelf: 'flex-start', backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.round, paddingHorizontal: 8, paddingVertical: 2 },
  roleText: { color: COLORS.primary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  chatBtn: { padding: 8 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: COLORS.textMuted, marginTop: SPACING.md, fontSize: 15 },
});
