import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, TextInput, TouchableOpacity, Text,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import JobCard from '../../components/JobCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { jobService } from '../../services/jobService';
import useAuthStore from '../../store/authStore';
import { COLORS, SPACING, RADIUS } from '../../theme';

const TYPE_FILTERS = ['all', 'internship', 'fulltime', 'parttime', 'contract'];

export default function JobsScreen({ navigation }) {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadJobs = useCallback(async () => {
    try {
      const params = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (search.trim()) params.search = search.trim();
      const { data } = await jobService.listJobs(params);
      setJobs(data.jobs || data);
    } catch (e) {
      console.log('Jobs error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [typeFilter, search]);

  useEffect(() => {
    setLoading(true);
    loadJobs();
  }, [loadJobs]);

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs, companies…"
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          onSubmitEditing={loadJobs}
        />
      </View>

      {/* Type filter chips */}
      <FlatList
        data={TYPE_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, typeFilter === item && styles.filterChipActive]}
            onPress={() => setTypeFilter(item)}
          >
            <Text style={[styles.filterText, typeFilter === item && styles.filterTextActive]}>
              {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Jobs list */}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { job: item })} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No jobs found</Text>
          </View>
        }
      />

      {/* Alumni / admin FAB – Create Job */}
      {(user?.role === 'alumni' || user?.role === 'admin') && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateJob')}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Student – My Applications link */}
      {user?.role === 'student' && (
        <TouchableOpacity style={styles.myAppBtn} onPress={() => navigation.navigate('MyApplications')}>
          <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
          <Text style={styles.myAppText}>My Applications</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md,
    margin: SPACING.md, height: 46,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14 },
  filterRow: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: '600' },
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
  myAppBtn: {
    position: 'absolute', bottom: 24, left: 24, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.surface, paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: RADIUS.round, borderWidth: 1, borderColor: COLORS.primary,
  },
  myAppText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
});
