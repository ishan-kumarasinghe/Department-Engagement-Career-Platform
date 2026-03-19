import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Mail, Briefcase, GraduationCap, MapPin, LogOut } from 'lucide-react-native';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Helper formatting values
  const roleDisplay = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student';
  const avatarLetter = user?.fullName ? user.fullName.charAt(0) : 'U';

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Profile Header (Cover + Avatar) */}
      <View style={styles.coverPhoto} />
      <View style={styles.headerContainer}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            {user?.profilePicUrl ? (
              <Image source={{ uri: user.profilePicUrl }} style={{ width: 100, height: 100, borderRadius: 50 }} />
            ) : (
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Text style={styles.name}>{user?.fullName || 'Unknown User'}</Text>
          <Text style={styles.headline}>{user?.headline || 'Member of DECP Platform'}</Text>
          <Text style={styles.roleBadge}>{roleDisplay}</Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Mail color="#6b7280" size={20} />
          <Text style={styles.detailText}>{user?.email || 'No email provided'}</Text>
        </View>
        
        {user?.graduationYear && (
          <View style={styles.detailRow}>
            <GraduationCap color="#6b7280" size={20} />
            <Text style={styles.detailText}>Class of {user.graduationYear}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <MapPin color="#6b7280" size={20} />
          <Text style={styles.detailText}>{user?.location || 'Location not specified'}</Text>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          {user?.bio || 'This user has not written a bio yet.'}
        </Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut color="#dc2626" size={20} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  coverPhoto: { height: 120, backgroundColor: '#2563eb' },
  headerContainer: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingBottom: 24, marginBottom: 8 },
  avatarWrapper: { marginTop: -40, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#ffffff' },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#ffffff' },
  editButton: { position: 'absolute', right: 16, top: 16, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db' },
  editButtonText: { color: '#374151', fontWeight: 'bold', fontSize: 14 },
  userInfo: { marginTop: 8 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  headline: { fontSize: 16, color: '#4b5563', marginTop: 4 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: '#eff6ff', color: '#2563eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold', marginTop: 12, overflow: 'hidden' },
  detailsSection: { backgroundColor: '#ffffff', padding: 16, marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  detailText: { marginLeft: 12, fontSize: 15, color: '#4b5563' },
  aboutSection: { backgroundColor: '#ffffff', padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  aboutText: { fontSize: 15, color: '#4b5563', lineHeight: 22 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding: 16, marginHorizontal: 16, marginBottom: 40, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { color: '#dc2626', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }
});

export default ProfileScreen;
