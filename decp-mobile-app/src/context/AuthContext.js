import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state by reading from AsyncStorage on app launch
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load auth data from storage', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();

    // Listen for 401 API token expirations and log out forcefully
    const authListener = DeviceEventEmitter.addListener('force_logout', async () => {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } catch (e) {
        console.error(e);
      }
    });

    return () => authListener.remove();
  }, []);

  const login = async (userData, authToken) => {
    try {
      await AsyncStorage.setItem('token', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
    } catch (e) {
      console.error('Failed to save auth data to storage', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Failed to clear auth data from storage', e);
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
    } catch (e) {
      console.error('Failed to update user data in storage', e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!token,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
