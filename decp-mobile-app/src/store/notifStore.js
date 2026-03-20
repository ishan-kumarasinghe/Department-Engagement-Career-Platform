import { create } from 'zustand';
import api from '../config/api';

const useNotifStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/api/notifications');
      const notifs = data.notifications || data;
      const unread = notifs.filter((n) => !n.isRead).length;
      set({ notifications: notifs, unreadCount: unread, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notifId) => {
    await api.put(`/api/notifications/${notifId}/read`);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === notifId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await api.put('/api/notifications/read-all');
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: async (notifId) => {
    await api.delete(`/api/notifications/${notifId}`);
    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== notifId),
    }));
  },
}));

export default useNotifStore;
