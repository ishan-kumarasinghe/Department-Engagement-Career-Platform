import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { jobService } from '../../services/jobService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS, SPACING, RADIUS, FONTS } from '../../theme';
import { format } from 'date-fns';

export default function MyApplicationsScreen() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await jobService.getMyApplications();
      setApplications(data.applications || data);
    } catch (e) {
      console.log('Applications error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;

  const statusColor = { pending: COLORS.warning, accepted: COLORS.success, rejected: COLORS.error };

  return (
    <FlatList
      data={applications}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{item.jobId?.title || 'Job Listing'}</Text>
            <View style={[styles.badge, { backgroundColor: (statusColor[item.status] || COLORS.textMuted) + '22' }]}>
              <Text style={[styles.badgeText, { color: statusColor[item.status] || COLORS.textMuted }]}>
                {item.status || 'pending'}
              </Text>
            </View>
          </View>
          <Text style={styles.company}>{item.jobId?.companyName || ''}</Text>
          <Text style={styles.date}>Applied {item.appliedAt ? format(new Date(item.appliedAt), 'dd MMM yyyy') : ''}</Text>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No applications yet</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.md, backgroundColor: COLORS.background, flexGrow: 1 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  title: { color: COLORS.text, ...FONTS.semiBold, fontSize: 15, flex: 1 },
  badge: { borderRadius: RADIUS.round, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  company: { color: COLORS.secondary, fontSize: 13, marginBottom: 4 },
  date: { color: COLORS.textMuted, fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: COLORS.textMuted, marginTop: SPACING.md, fontSize: 15 },
});
