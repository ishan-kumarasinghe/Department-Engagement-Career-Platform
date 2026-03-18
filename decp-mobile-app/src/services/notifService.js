import api from '../config/api';

export const notifService = {
  getNotifications: (params) => api.get('/api/notifications', { params }),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/api/notifications/${id}`),
  getPreferences: () => api.get('/api/notifications/preferences'),
  updatePreferences: (payload) => api.put('/api/notifications/preferences', payload),
};
