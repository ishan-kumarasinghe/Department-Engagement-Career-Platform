import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

// CRITICAL: When running on a physical phone, 'localhost' will not work.
// Use your computer's local IPv4 address. Expo logs showed 10.30.52.47.
const LOCAL_IP = '10.30.52.47';

export const API_ENDPOINTS = {
  USER_SERVICE: `http://${LOCAL_IP}:3001`,
  CONTENT_SERVICE: `http://${LOCAL_IP}:3002`,
  NOTIFICATION_SERVICE: `http://${LOCAL_IP}:3003`,
  CHAT_SERVICE: `http://${LOCAL_IP}:3004`
};

const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor: Attach JWT token if it exists
  instance.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Handle generalized errors (e.g., 401 Unauthorized)
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        // Emit global event to force logout from React state
        DeviceEventEmitter.emit('force_logout');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Export pre-configured instances mapped to each microservice
export const userApi = createApiInstance(API_ENDPOINTS.USER_SERVICE);
export const contentApi = createApiInstance(API_ENDPOINTS.CONTENT_SERVICE);
export const notificationApi = createApiInstance(API_ENDPOINTS.NOTIFICATION_SERVICE);
export const chatApi = createApiInstance(API_ENDPOINTS.CHAT_SERVICE);
