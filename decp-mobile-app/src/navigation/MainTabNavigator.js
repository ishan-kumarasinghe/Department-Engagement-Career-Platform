import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Briefcase, MessageSquare, Bell, User } from 'lucide-react-native';

import HomeScreen from '../screens/home/HomeScreen';
import JobsScreen from '../screens/jobs/JobsScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let IconComponent;
          if (route.name === 'Home') IconComponent = Home;
          else if (route.name === 'Jobs') IconComponent = Briefcase;
          else if (route.name === 'Messages') IconComponent = MessageSquare;
          else if (route.name === 'Notifications') IconComponent = Bell;
          else if (route.name === 'Profile') IconComponent = User;
          
          return <IconComponent color={color} size={size} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerShown: true
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Feed' }} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
