import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../../services/userService';
import useAuthStore from '../../store/authStore';
import { COLORS, SPACING, RADIUS, FONTS } from '../../theme';

export default function EditProfileScreen({ navigation, route }) {
  const { updateUser } = useAuthStore();
  const { profile } = route.params;
  const [form, setForm] = useState({
    fullName: profile?.fullName || '',
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    batchYear: profile?.batchYear?.toString() || '',
    graduationYear: profile?.graduationYear?.toString() || '',
    skills: (profile?.skills || []).join(', '),
    links: (profile?.links || []).join(', '),
  });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        batchYear: form.batchYear ? parseInt(form.batchYear) : undefined,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        links: form.links.split(',').map((l) => l.trim()).filter(Boolean),
      };
      const { data } = await userService.updateProfile(payload);
      await updateUser(data);
      Alert.alert('Saved!', 'Your profile has been updated.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <EField label="Full Name" value={form.fullName} onChange={(v) => update('fullName', v)} />
        <EField label="Headline" value={form.headline} onChange={(v) => update('headline', v)} placeholder="e.g. CS Undergraduate | React Developer" />
        <EField label="Bio" value={form.bio} onChange={(v) => update('bio', v)} multiline placeholder="Tell people about yourself…" />
        <EField label="Location" value={form.location} onChange={(v) => update('location', v)} placeholder="e.g. Colombo, Sri Lanka" />
        <EField label="Batch Year" value={form.batchYear} onChange={(v) => update('batchYear', v)} keyboardType="numeric" />
        <EField label="Graduation Year" value={form.graduationYear} onChange={(v) => update('graduationYear', v)} keyboardType="numeric" />
        <EField label="Skills (comma separated)" value={form.skills} onChange={(v) => update('skills', v)} placeholder="Python, React Native, Git" />
        <EField label="Links (comma separated)" value={form.links} onChange={(v) => update('links', v)} placeholder="https://github.com/..." />

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading}>
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>{loading ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function EField({ label, value, onChange, placeholder, multiline, keyboardType }) {
  return (
    <View style={{ marginBottom: SPACING.md }}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, multiline && fieldStyles.multiline]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || ''}
        placeholderTextColor={COLORS.textMuted}
        multiline={multiline}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, color: COLORS.text,
    fontSize: 14, paddingHorizontal: SPACING.sm, paddingVertical: 12,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { padding: SPACING.md, paddingBottom: 40 },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md, height: 50,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: SPACING.sm,
  },
  btnText: { color: '#fff', fontSize: 16, ...FONTS.semiBold },
});
