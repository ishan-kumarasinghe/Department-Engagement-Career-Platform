import api from '../config/api';

export const userService = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (payload) => api.put('/api/users/profile', payload),
  deleteOwnAccount: () => api.delete('/api/users/profile'),
  getUsers: (params) => api.get('/api/users', { params }),
  getUserById: (id) => api.get(`/api/users/${id}`),
};
