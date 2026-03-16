import axios from 'axios';

// API endpoints - Adjust based on your deployment
const API_ENDPOINTS = {
  AUTH_SERVICE: 'http://localhost:3000/api/auth',
  USER_SERVICE: 'http://localhost:3000/api/users',
  CONTENT_SERVICE: 'http://localhost:3000/api/content',
  NOTIFICATION_SERVICE: 'http://localhost:3000/api/notifications',
  CHAT_SERVICE: 'http://localhost:3000/api/chat',
};

// Create axios instances with auth token
const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to inject token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor to handle 401s
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const authApi = createApiInstance(API_ENDPOINTS.AUTH_SERVICE);
export const userApi = createApiInstance(API_ENDPOINTS.USER_SERVICE);
export const contentApi = createApiInstance(API_ENDPOINTS.CONTENT_SERVICE);
export const notificationApi = createApiInstance(API_ENDPOINTS.NOTIFICATION_SERVICE);
export const chatApi = createApiInstance(API_ENDPOINTS.CHAT_SERVICE);

export const API = API_ENDPOINTS;
