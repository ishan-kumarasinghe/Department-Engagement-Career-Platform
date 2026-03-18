import api from '../config/api';

export const jobService = {
  listJobs: (params) => api.get('/api/content/jobs', { params }),
  createJob: (payload) => api.post('/api/content/jobs', payload),
  updateJob: (jobId, payload) => api.put(`/api/content/jobs/${jobId}`, payload),
  deleteJob: (jobId) => api.delete(`/api/content/jobs/${jobId}`),
  applyToJob: (jobId) => api.post(`/api/content/jobs/${jobId}/apply`),
  getMyApplications: () => api.get('/api/content/jobs/applications/me'),
  getJobApplications: (jobId) => api.get(`/api/content/jobs/${jobId}/applications`),
};
