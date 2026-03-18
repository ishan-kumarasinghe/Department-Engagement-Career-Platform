import api from '../config/api';

export const chatService = {
  listConversations: () => api.get('/api/chat/conversations'),
  createOrGetDirect: (targetUserId) =>
    api.post('/api/chat/conversations/direct', { targetUserId }),
  getMessages: (conversationId, params) =>
    api.get(`/api/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, payload) =>
    api.post(`/api/chat/conversations/${conversationId}/messages`, payload),
  deleteConversation: (conversationId) =>
    api.delete(`/api/chat/conversations/${conversationId}`),
};
