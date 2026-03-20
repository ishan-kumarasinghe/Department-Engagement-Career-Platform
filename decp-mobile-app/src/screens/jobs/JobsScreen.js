import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react-native';
import { contentApi } from '../../api/config';
import { useAuth } from '../../context/AuthContext';

const JobCard = ({ job, hasApplied, onApplyPress, userRole }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.companyLogo}>
          <Briefcase color="#ffffff" size={20} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.companyName}>{job.companyName}</Text>
        </View>
      </View>

      <View style={styles.badges}>
        <View style={styles.badge}>
          <MapPin size={12} color="#4b5563" />
          <Text style={styles.badgeText}>{job.location || 'Remote'}</Text>
        </View>
        <View style={styles.badge}>
          <Clock size={12} color="#4b5563" />
          <Text style={styles.badgeText}>{job.type || 'Full-time'}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {job.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.appliedText}>{job.applicationCount || job.applicants || 0} applicants</Text>
        {hasApplied ? (
          <View style={[styles.applyButton, { backgroundColor: '#e5e7eb' }]}>
            <Text style={[styles.applyButtonText, { color: '#4b5563' }]}>Applied</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.applyButton} 
            onPress={() => onApplyPress(job)}
            disabled={userRole !== 'student'}
          >
            <Text style={[styles.applyButtonText, userRole !== 'student' && { color: '#9ca3af' }]}>
              {userRole !== 'student' ? 'Students Only' : 'Apply Now'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const JobsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    resumeUrl: '',
    coverLetter: '',
  });

  const fetchJobs = async () => {
    try {
      const jobsRequest = contentApi.get('/api/jobs');
      const applicationsRequest = user?.role === 'student'
        ? contentApi.get('/api/jobs/applications/me')
        : Promise.resolve({ data: { data: [] } });

      const [jobsResponse, applicationsResponse] = await Promise.all([
        jobsRequest,
        applicationsRequest
      ]);

      const fetchedData = jobsResponse.data?.data?.items || jobsResponse.data?.data || [];
      setJobs(Array.isArray(fetchedData) ? fetchedData : []);

      if (user?.role === 'student') {
        const appliedArr = applicationsResponse.data?.data || [];
        setAppliedJobs(new Set(appliedArr.map(app => app.jobId)));
      }
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleApplyPress = (job) => {
    setSelectedJob(job);
    setApplicationForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: '',
      resumeUrl: '',
      coverLetter: '',
    });
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!selectedJob) return;
    setIsApplying(true);
    try {
      const coverLetterContent = [
        `Applicant: ${applicationForm.fullName}`,
        applicationForm.email ? `Email: ${applicationForm.email}` : '',
        applicationForm.phone ? `Phone: ${applicationForm.phone}` : '',
        '',
        applicationForm.coverLetter
      ].filter(Boolean).join('\n');

      await contentApi.post(`/api/jobs/${selectedJob._id}/apply`, {
        resumeUrl: applicationForm.resumeUrl,
        coverLetter: coverLetterContent,
      });

      setAppliedJobs(prev => new Set([...prev, selectedJob._id]));
      setJobs(prevJobs => prevJobs.map(j => 
        j._id === selectedJob._id 
          ? { ...j, applicationCount: (j.applicationCount || 0) + 1 }
          : j
      ));
      
      setShowApplyModal(false);
      Alert.alert('Success', 'Application submitted successfully');
    } catch (error) {
       if (error.response?.status === 409) {
          setAppliedJobs(prev => new Set([...prev, selectedJob._id]));
          setShowApplyModal(false);
          Alert.alert('Info', 'You have already applied to this job');
       } else {
          Alert.alert('Error', error.response?.data?.message || 'Failed to submit application');
       }
    } finally {
      setIsApplying(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs();
  }, []);

  const renderHeader = () => {
    if (user?.role === 'alumni' || user?.role === 'admin') {
      return (
        <TouchableOpacity style={styles.postJobContainer}>
          <Text style={styles.postJobText}>+ Post a New Job</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <JobCard 
            job={item} 
            hasApplied={appliedJobs.has(item._id)}
            onApplyPress={handleApplyPress}
            userRole={user?.role}
          />
        )}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No job postings found.</Text>
        }
      />

      <Modal visible={showApplyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Apply for {selectedJob?.title}</Text>
            
            <TextInput style={styles.input} placeholder="Full Name" value={applicationForm.fullName} onChangeText={(text) => setApplicationForm({...applicationForm, fullName: text})} />
            <TextInput style={styles.input} placeholder="Email" value={applicationForm.email} onChangeText={(text) => setApplicationForm({...applicationForm, email: text})} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Phone Number (Optional)" value={applicationForm.phone} onChangeText={(text) => setApplicationForm({...applicationForm, phone: text})} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="CV / Resume URL" value={applicationForm.resumeUrl} onChangeText={(text) => setApplicationForm({...applicationForm, resumeUrl: text})} keyboardType="url" />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Cover Letter" value={applicationForm.coverLetter} onChangeText={(text) => setApplicationForm({...applicationForm, coverLetter: text})} multiline numberOfLines={4} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowApplyModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={submitApplication} disabled={isApplying}>
                {isApplying ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit Application</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 12, paddingBottom: 20 },
  postJobContainer: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  postJobText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  companyLogo: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerText: { flex: 1 },
  jobTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  companyName: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  badges: { flexDirection: 'row', marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  badgeText: { fontSize: 12, color: '#4b5563', marginLeft: 4, fontWeight: '500' },
  description: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginBottom: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  appliedText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  applyButton: { backgroundColor: '#eff6ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  applyButtonText: { color: '#2563eb', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6b7280', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#111827' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, backgroundColor: '#f9fafb' },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  cancelButton: { padding: 12, marginRight: 8 },
  cancelButtonText: { color: '#6b7280', fontWeight: 'bold', fontSize: 16 },
  submitButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', minWidth: 120 },
  submitButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});

export default JobsScreen;
