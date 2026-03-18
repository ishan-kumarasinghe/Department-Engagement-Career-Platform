import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { jobService } from '../../services/jobService';
import { COLORS, SPACING, RADIUS, FONTS } from '../../theme';

const TYPES = ['internship', 'fulltime', 'parttime', 'contract'];
const MODES = ['remote', 'onsite', 'hybrid'];

export default function CreateJobScreen({ navigation }) {
  const [form, setForm] = useState({
    title: '', companyName: '', type: 'internship', mode: 'remote',
    location: '', description: '', requirements: '', deadline: '', applyUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    const { title, companyName, description, deadline } = form;
    if (!title || !companyName || !description || !deadline) {
      Alert.alert('Missing Fields', 'Please fill in title, company, description, and deadline.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        requirements: form.requirements.split('\n').map((r) => r.trim()).filter(Boolean),
        deadline: new Date(form.deadline).toISOString(),
      };
      await jobService.createJob(payload);
      Alert.alert('Success', 'Job posted successfully!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not post job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Field label="Job Title *" value={form.title} onChange={(v) => update('title', v)} placeholder="e.g. Software Engineering Intern" />
        <Field label="Company Name *" value={form.companyName} onChange={(v) => update('companyName', v)} placeholder="e.g. Acme Corp" />

        <Text style={styles.label}>Job Type *</Text>
        <View style={styles.chipRow}>
          {TYPES.map((t) => (
            <TouchableOpacity key={t} style={[styles.chip, form.type === t && styles.chipActive]} onPress={() => update('type', t)}>
              <Text style={[styles.chipText, form.type === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Work Mode *</Text>
        <View style={styles.chipRow}>
          {MODES.map((m) => (
            <TouchableOpacity key={m} style={[styles.chip, form.mode === m && styles.chipActive]} onPress={() => update('mode', m)}>
              <Text style={[styles.chipText, form.mode === m && styles.chipTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label="Location" value={form.location} onChange={(v) => update('location', v)} placeholder="e.g. Colombo, Sri Lanka" />
        <Field label="Description *" value={form.description} onChange={(v) => update('description', v)} placeholder="Describe the role and responsibilities…" multiline />
        <Field label="Requirements (one per line)" value={form.requirements} onChange={(v) => update('requirements', v)} placeholder="Python\nTeamwork\nGit" multiline />
        <Field label="Application Deadline * (YYYY-MM-DD)" value={form.deadline} onChange={(v) => update('deadline', v)} placeholder="2026-06-30" keyboardType="numeric" />
        <Field label="External Apply URL" value={form.applyUrl} onChange={(v) => update('applyUrl', v)} placeholder="https://careers.company.com/job/..." />

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          <Ionicons name="briefcase-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>{loading ? 'Posting…' : 'Post Job'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, placeholder, multiline, keyboardType }) {
  return (
    <View style={{ marginBottom: SPACING.md }}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, multiline && fieldStyles.multiline]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, color: COLORS.text, fontSize: 14,
    paddingHorizontal: SPACING.sm, paddingVertical: 12,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { padding: SPACING.md, paddingBottom: 40 },
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.round, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 13, textTransform: 'capitalize' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md, height: 50,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: SPACING.sm,
  },
  btnText: { color: '#fff', fontSize: 16, ...FONTS.semiBold },
});
