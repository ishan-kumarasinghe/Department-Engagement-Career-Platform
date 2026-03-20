import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { jobService } from '../../services/jobService';
import useAuthStore from '../../store/authStore';
import { COLORS, SPACING, RADIUS, FONTS } from '../../theme';
import { format, isPast } from 'date-fns';

const modeIcon = { remote: 'globe-outline', onsite: 'business-outline', hybrid: 'git-merge-outline' };

export default function JobDetailScreen({ route, navigation }) {
  const { job } = route.params;
  const { user } = useAuthStore();
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const isStudent = user?.role === 'student';
  const canManage = user?.role === 'alumni' || user?.role === 'admin';
  const deadlinePast = job.deadline ? isPast(new Date(job.deadline)) : false;
  const deadlineStr = job.deadline ? format(new Date(job.deadline), 'dd MMM yyyy') : 'N/A';

  const handleApply = async () => {
    setLoading(true);
    try {
      await jobService.applyToJob(job._id);
      setApplied(true);
      Alert.alert('Applied!', 'Your application has been submitted successfully.');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not apply. You may have already applied.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Delete Job', 'Are you sure you want to delete this job posting?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await jobService.deleteJob(job._id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', 'Could not delete job.');
          }
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: (job.status === 'open' && !deadlinePast ? COLORS.success : COLORS.error) + '22' }]}>
            <Text style={[styles.statusText, { color: job.status === 'open' && !deadlinePast ? COLORS.success : COLORS.error }]}>
              {job.status === 'open' && !deadlinePast ? 'Open' : 'Closed'}
            </Text>
          </View>
          <Text style={styles.type}>{job.type}</Text>
        </View>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.company}>{job.companyName}</Text>

        <View style={styles.metaRow}>
          <MetaChip icon={modeIcon[job.mode] || 'location-outline'} label={job.mode} />
          {job.location ? <MetaChip icon="location-outline" label={job.location} /> : null}
          <MetaChip icon="time-outline" label={`Deadline: ${deadlineStr}`} />
        </View>
      </View>

      {/* Description */}
      <SectionCard title="Description">
        <Text style={styles.body}>{job.description}</Text>
      </SectionCard>

      {/* Requirements */}
      {job.requirements?.length > 0 && (
        <SectionCard title="Requirements">
          {job.requirements.map((req, i) => (
            <View key={i} style={styles.reqRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
              <Text style={styles.reqText}>{req}</Text>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Apply button – students only */}
      {isStudent && (
        <TouchableOpacity
          style={[styles.btn, (applied || deadlinePast || loading) && styles.btnDisabled]}
          onPress={handleApply}
          disabled={applied || deadlinePast || loading}
        >
          <Ionicons name={applied ? 'checkmark-circle' : 'send-outline'} size={18} color="#fff" />
          <Text style={styles.btnText}>
            {applied ? 'Applied' : loading ? 'Applying…' : deadlinePast ? 'Deadline Passed' : 'Apply Now'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Manage buttons – alumni / admin */}
      {canManage && (
        <View style={styles.manageRow}>
          <TouchableOpacity style={styles.manageBtn} onPress={() => Alert.alert('Edit', 'Edit job form coming soon.')}>
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            <Text style={styles.manageBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.manageBtn, styles.deleteBtn]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            <Text style={[styles.manageBtnText, { color: COLORS.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function MetaChip({ icon, label }) {
  return (
    <View style={chipStyles.row}>
      <Ionicons name={icon} size={13} color={COLORS.textSecondary} />
      <Text style={chipStyles.label}>{label}</Text>
    </View>
  );
}

function SectionCard({ title, children }) {
  return (
    <View style={sectionStyles.card}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

const chipStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.round },
  label: { color: COLORS.textSecondary, fontSize: 12, textTransform: 'capitalize' },
});

const sectionStyles = StyleSheet.create({
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.text, ...FONTS.semiBold, fontSize: 15, marginBottom: SPACING.sm },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { padding: SPACING.md, paddingBottom: 40 },
  headerCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
  statusBadge: { borderRadius: RADIUS.round, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  type: { color: COLORS.textMuted, fontSize: 12, textTransform: 'capitalize' },
  title: { color: COLORS.text, fontSize: 20, ...FONTS.bold, marginBottom: 4 },
  company: { color: COLORS.secondary, fontSize: 14, marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  body: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  reqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  reqText: { color: COLORS.text, fontSize: 14, flex: 1 },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md, height: 50,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    marginVertical: SPACING.sm,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, ...FONTS.semiBold },
  manageRow: { flexDirection: 'row', gap: SPACING.sm },
  manageBtn: {
    flex: 1, height: 46, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.primary,
  },
  deleteBtn: { borderColor: COLORS.error },
  manageBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
});
