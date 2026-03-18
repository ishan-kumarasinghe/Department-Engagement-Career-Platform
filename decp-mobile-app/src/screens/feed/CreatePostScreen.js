import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { postService } from '../../services/postService';
import useFeedStore from '../../store/feedStore';
import useAuthStore from '../../store/authStore';
import { COLORS, SPACING, RADIUS, FONTS } from '../../theme';

const VISIBILITY_OPTIONS = ['public', 'dept', 'connections'];

export default function CreatePostScreen({ navigation }) {
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const addPost = useFeedStore((s) => s.addPost);

  const handleCreate = async () => {
    if (!text.trim()) {
      Alert.alert('Empty Post', 'Please write something before posting.');
      return;
    }
    setLoading(true);
    try {
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const { data } = await postService.createPost({ text: text.trim(), tags: tagArray, visibility });
      const newPost = data.post || data;
      addPost({ ...newPost, authorSnapshot: { name: user?.fullName, headline: user?.headline, profilePicUrl: user?.profilePicUrl } });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.textInput}
          placeholder="What's on your mind?"
          placeholderTextColor={COLORS.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          autoFocus
        />

        {/* Tags */}
        <View style={styles.section}>
          <Ionicons name="pricetags-outline" size={16} color={COLORS.textSecondary} />
          <TextInput
            style={styles.tagsInput}
            placeholder="Tags (comma separated)"
            placeholderTextColor={COLORS.textMuted}
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {/* Visibility */}
        <Text style={styles.label}>Audience</Text>
        <View style={styles.visRow}>
          {VISIBILITY_OPTIONS.map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.visChip, visibility === v && styles.visChipActive]}
              onPress={() => setVisibility(v)}
            >
              <Text style={[styles.visText, visibility === v && styles.visTextActive]}>
                {v === 'dept' ? 'Department' : v.charAt(0).toUpperCase() + v.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleCreate} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Posting…' : 'Post'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { padding: SPACING.md },
  textInput: {
    color: COLORS.text, fontSize: 16, lineHeight: 26,
    minHeight: 160, textAlignVertical: 'top',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  section: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tagsInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 12 },
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: SPACING.sm },
  visRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  visChip: {
    flex: 1, paddingVertical: 10, borderRadius: RADIUS.md, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  visChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  visText: { color: COLORS.textSecondary, fontSize: 13 },
  visTextActive: { color: '#fff', fontWeight: '600' },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, height: 50, justifyContent: 'center', alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, ...FONTS.semiBold },
});
