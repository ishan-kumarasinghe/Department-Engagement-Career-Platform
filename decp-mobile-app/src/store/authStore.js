import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../config/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  // Load persisted auth on app start
  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const userJson = await SecureStore.getItemAsync('user');
      if (token && userJson) {
        set({
          accessToken: token,
          user: JSON.parse(userJson),
          isAuthenticated: true,
        });
      }
    } catch (e) {
      console.log('Failed to load auth from storage', e);
    } finally {
      set({ isLoading: false });
    }
  },

  // Register a new user
  register: async ({ fullName, email, password, role }) => {
    const { data } = await api.post('/api/auth/register', { fullName, email, password, role });
    await get()._persist(data);
    return data;
  },

  // Login
  login: async ({ email, password }) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    await get()._persist(data);
    return data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (_) {}
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  // Update local user profile cache
  updateUser: async (updatedUser) => {
    await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  // Internal: persist tokens and user
  _persist: async (data) => {
    const { accessToken, refreshToken, user } = data;
    if (accessToken) await SecureStore.setItemAsync('accessToken', accessToken);
    if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);
    if (user) await SecureStore.setItemAsync('user', JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },
}));

export default useAuthStore;
