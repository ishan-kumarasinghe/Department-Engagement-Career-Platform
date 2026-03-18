import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { userService } from '../../services/userService';
import { chatService } from '../../services/chatService';
import useAuthStore from '../../store/authStore';
import { COLORS, SPACING, RADIUS, FONTS } from '../../theme';

export default function ProfileScreen({ navigation, route }) {
  const viewingUserId = route.params?.userId;
  const { user: currentUser, logout } = useAuthStore();
  const isOwnProfile = !viewingUserId || viewingUserId === currentUser?._id;

  const [profile, setProfile] = useState(isOwnProfile ? currentUser : null);
  const [loading, setLoading] = useState(!isOwnProfile);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      if (isOwnProfile) {
        const { data } = await userService.getProfile();
        setProfile(data);
      } else {
        const { data } = await userService.getUserById(viewingUserId);
        setProfile(data);
      }
    } catch (e) {
      console.log('Profile error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadProfile(); }, [viewingUserId]);

  const handleStartChat = async () => {
    try {
      const { data } = await chatService.createOrGetDirect(viewingUserId);
      const conv = data.conversation || data;
      navigation.navigate('ChatTab', {
        screen: 'Chat',
        params: { conversationId: conv._id, name: profile?.fullName },
      });
    } catch (e) {
      Alert.alert('Error', 'Could not start conversation.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return (
    <View style={styles.center}>
      <Text style={{ color: COLORS.textMuted }}>Profile not found</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProfile(); }} tintColor={COLORS.primary} />}>
      {/* Cover / Avatar */}
      <View style={styles.coverBg} />
      <View style={styles.avatarRow}>
        <Avatar uri={profile.profilePicUrl} name={profile.fullName} size={80} />
        {isOwnProfile ? (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('EditProfile', { profile })}>
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.chatBtn} onPress={handleStartChat}>
            <Ionicons name="chatbubble-outline" size={16} color="#fff" />
            <Text style={styles.chatBtnText}>Message</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Name & meta */}
      <Text style={styles.name}>{profile.fullName}</Text>
      {profile.headline ? <Text style={styles.headline}>{profile.headline}</Text> : null}
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{profile.role?.toUpperCase()}</Text>
      </View>

      {/* Bio */}
      {profile.bio ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>{profile.bio}</Text>
        </View>
      ) : null}

      {/* Skills */}
      {profile.skills?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillRow}>
            {profile.skills.map((s, i) => (
              <View key={i} style={styles.skillChip}>
                <Text style={styles.skillText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Details</Text>
        {profile.location ? <DetailRow icon="location-outline" text={profile.location} /> : null}
        {profile.batchYear ? <DetailRow icon="school-outline" text={`Batch of ${profile.batchYear}`} /> : null}
        {profile.graduationYear ? <DetailRow icon="ribbon-outline" text={`Graduated ${profile.graduationYear}`} /> : null}
        {profile.email ? <DetailRow icon="mail-outline" text={profile.email} /> : null}
      </View>

      {/* Network link */}
      {isOwnProfile && (
        <TouchableOpacity style={styles.networkBtn} onPress={() => navigation.navigate('Network')}>
          <Ionicons name="people-outline" size={20} color={COLORS.primary} />
          <Text style={styles.networkText}>Browse Network</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function DetailRow({ icon, text }) {
  return (
    <View style={detailStyles.row}>
      <Ionicons name={icon} size={16} color={COLORS.textSecondary} />
      <Text style={detailStyles.text}>{text}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  text: { color: COLORS.textSecondary, fontSize: 14 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  coverBg: { height: 120, backgroundColor: COLORS.primary + '44' },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: SPACING.md, marginTop: -40, marginBottom: SPACING.sm },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  chatBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.primary, borderRadius: RADIUS.round },
  chatBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  name: { color: COLORS.text, fontSize: 22, ...FONTS.bold, paddingHorizontal: SPACING.md },
  headline: { color: COLORS.textSecondary, fontSize: 14, paddingHorizontal: SPACING.md, marginTop: 4 },
  roleBadge: { marginHorizontal: SPACING.md, marginTop: 8, marginBottom: SPACING.sm, alignSelf: 'flex-start', backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.round, paddingHorizontal: 10, paddingVertical: 4 },
  roleText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  card: { marginHorizontal: SPACING.md, marginBottom: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.text, ...FONTS.semiBold, fontSize: 15, marginBottom: SPACING.sm },
  body: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { backgroundColor: COLORS.background, borderRadius: RADIUS.round, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.border },
  skillText: { color: COLORS.text, fontSize: 13 },
  networkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: SPACING.md, paddingVertical: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.primary },
  networkText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
});
