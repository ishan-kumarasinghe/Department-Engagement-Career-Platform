import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/config';

const RegisterScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' | 'alumni' | 'admin'
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userApi.post('/api/auth/register', { name, email, password, role });
      
      // Some backends return token on register, others require login after. Let's assume auto-login if token is present.
      const { data } = response.data;
      if (data && data.token && data.user) {
        await login(data.user, data.token);
      } else {
        Alert.alert('Success', 'Account created successfully! Please log in.');
        navigation.goBack();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create account.';
      Alert.alert('Registration Failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Join DECP</Text>
            <Text style={styles.subtitle}>Create your new account</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} />

            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} placeholder="john@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />

            <Text style={styles.label}>I am a...</Text>
            <View style={styles.roleContainer}>
              {['student', 'alumni'].map((r) => (
                <TouchableOpacity 
                  key={r} 
                  style={[styles.roleSelect, role === r && styles.roleActive]} 
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.registerButtonText}>Create Account</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 50 },
  backButton: { marginBottom: 20 },
  backButtonText: { color: '#6b7280', fontSize: 16 },
  headerContainer: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280' },
  formContainer: { backgroundColor: '#ffffff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20, color: '#111827' },
  roleContainer: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  roleSelect: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center', backgroundColor: '#f9fafb' },
  roleActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  roleText: { color: '#6b7280', fontWeight: 'bold' },
  roleTextActive: { color: '#2563eb' },
  registerButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center' },
  registerButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});

export default RegisterScreen;
