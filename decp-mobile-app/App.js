import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import useAuthStore from './src/store/authStore';
import useNotifStore from './src/store/notifStore';

export default function App() {
  const { loadStoredAuth, isAuthenticated } = useAuthStore();
  const fetchNotifications = useNotifStore((s) => s.fetchNotifications);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
