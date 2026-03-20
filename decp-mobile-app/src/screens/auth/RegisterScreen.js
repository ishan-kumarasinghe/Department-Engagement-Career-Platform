import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import { COLORS, SPACING, RADIUS, FONTS } from '../../theme';

const ROLES = ['student', 'alumni'];

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({ fullName: fullName.trim(), email: email.trim().toLowerCase(), password, role });
    } catch (e) {
      Alert.alert('Registration Failed', e.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
        </View>

        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={COLORS.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password (min 6 chars)"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPw}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Role picker */}
          <Text style={styles.label}>I am a…</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleChip, role === r && styles.roleChipActive]}
                onPress={() => setRole(r)}
              >
                <Ionicons
                  name={r === 'student' ? 'school-outline' : 'briefcase-outline'}
                  size={16}
                  color={role === r ? '#fff' : COLORS.textSecondary}
                />
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Text style={[styles.linkText, styles.linkBold]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flexGrow: 1, padding: SPACING.lg, paddingTop: 60 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  backBtn: { marginRight: SPACING.md },
  title: { color: COLORS.text, fontSize: 24, ...FONTS.bold },
  form: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm, marginBottom: SPACING.md, height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: COLORS.text, fontSize: 15 },
  eyeBtn: { padding: 4 },
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: SPACING.sm },
  roleRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  roleChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background,
  },
  roleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  roleTextActive: { color: '#fff' },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    height: 50, justifyContent: 'center', alignItems: 'center', marginTop: SPACING.xs,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, ...FONTS.semiBold },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.md },
  linkText: { color: COLORS.textSecondary, fontSize: 14 },
  linkBold: { color: COLORS.primary, ...FONTS.semiBold },
});
