import api from '../config/api';

export const postService = {
  getFeed: (page = 1, limit = 10) =>
    api.get('/api/content/posts', { params: { page, limit } }),
  createPost: (payload) => api.post('/api/content/posts', payload),
  updatePost: (postId, payload) => api.put(`/api/content/posts/${postId}`, payload),
  deletePost: (postId) => api.delete(`/api/content/posts/${postId}`),
  likePost: (postId) => api.post(`/api/content/posts/${postId}/like`),
  unlikePost: (postId) => api.delete(`/api/content/posts/${postId}/like`),
  addComment: (postId, payload) => api.post(`/api/content/posts/${postId}/comments`, payload),
};
