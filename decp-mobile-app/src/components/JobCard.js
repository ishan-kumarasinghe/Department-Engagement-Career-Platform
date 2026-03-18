import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS } from '../theme';
import { formatDistanceToNow, isPast } from 'date-fns';

const typeColor = {
  internship: '#6C63FF',
  fulltime: '#00C9A7',
  parttime: '#FFB300',
  contract: '#FF5370',
};

const modeIcon = {
  remote: 'globe-outline',
  onsite: 'business-outline',
  hybrid: 'git-merge-outline',
};

export default function JobCard({ job, onPress }) {
  const deadlinePast = job.deadline ? isPast(new Date(job.deadline)) : false;
  const deadlineStr = job.deadline
    ? formatDistanceToNow(new Date(job.deadline), { addSuffix: true })
    : 'No deadline';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.companyName}</Text>
        </View>
        {job.status === 'open' && !deadlinePast ? (
          <View style={[styles.badge, { backgroundColor: COLORS.success + '22' }]}>
            <Text style={[styles.badgeText, { color: COLORS.success }]}>Open</Text>
          </View>
        ) : (
          <View style={[styles.badge, { backgroundColor: COLORS.error + '22' }]}>
            <Text style={[styles.badgeText, { color: COLORS.error }]}>Closed</Text>
          </View>
        )}
      </View>

      {/* Meta row */}
      <View style={styles.meta}>
        <View style={[styles.typeChip, { backgroundColor: (typeColor[job.type] || COLORS.primary) + '22' }]}>
          <Text style={[styles.typeText, { color: typeColor[job.type] || COLORS.primary }]}>
            {job.type}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name={modeIcon[job.mode] || 'location-outline'} size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{job.mode}</Text>
        </View>
        {job.location ? (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{job.location}</Text>
          </View>
        ) : null}
      </View>

      {/* Description snippet */}
      <Text style={styles.description} numberOfLines={2}>{job.description}</Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Ionicons
          name="time-outline"
          size={13}
          color={deadlinePast ? COLORS.error : COLORS.textMuted}
        />
        <Text style={[styles.deadline, deadlinePast && { color: COLORS.error }]}>
          Deadline {deadlineStr}
        </Text>
        <Text style={styles.applications}>{job.applicationCount || 0} applicants</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xs },
  headerLeft: { flex: 1, marginRight: SPACING.sm },
  title: { color: COLORS.text, fontSize: 15, ...FONTS.semiBold },
  company: { color: COLORS.secondary, fontSize: 13, marginTop: 2 },
  badge: { borderRadius: RADIUS.round, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  typeChip: { borderRadius: RADIUS.round, paddingHorizontal: 8, paddingVertical: 2 },
  typeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { color: COLORS.textSecondary, fontSize: 12, textTransform: 'capitalize' },
  description: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: SPACING.sm },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadline: { color: COLORS.textMuted, fontSize: 12, flex: 1 },
  applications: { color: COLORS.textMuted, fontSize: 12 },
});
