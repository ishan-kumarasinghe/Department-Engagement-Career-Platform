import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import useNotifStore from '../store/notifStore';

// Feed
import FeedScreen from '../screens/feed/FeedScreen';
import PostDetailScreen from '../screens/feed/PostDetailScreen';
import CreatePostScreen from '../screens/feed/CreatePostScreen';

// Jobs
import JobsScreen from '../screens/jobs/JobsScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import CreateJobScreen from '../screens/jobs/CreateJobScreen';
import MyApplicationsScreen from '../screens/jobs/MyApplicationsScreen';

// Chat
import ConversationsScreen from '../screens/chat/ConversationsScreen';
import ChatScreen from '../screens/chat/ChatScreen';

// Notifications
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

// Profile
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NetworkScreen from '../screens/profile/NetworkScreen';

const Tab = createBottomTabNavigator();
const FeedStack = createNativeStackNavigator();
const JobsStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const NotifStack = createNativeStackNavigator();

function FeedStackNav() {
  return (
    <FeedStack.Navigator screenOptions={stackOptions}>
      <FeedStack.Screen name="Feed" component={FeedScreen} options={{ title: 'Home' }} />
      <FeedStack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post' }} />
      <FeedStack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'New Post' }} />
    </FeedStack.Navigator>
  );
}

function JobsStackNav() {
  return (
    <JobsStack.Navigator screenOptions={stackOptions}>
      <JobsStack.Screen name="Jobs" component={JobsScreen} options={{ title: 'Jobs & Internships' }} />
      <JobsStack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Details' }} />
      <JobsStack.Screen name="CreateJob" component={CreateJobScreen} options={{ title: 'Post a Job' }} />
      <JobsStack.Screen name="MyApplications" component={MyApplicationsScreen} options={{ title: 'My Applications' }} />
    </JobsStack.Navigator>
  );
}

function ChatStackNav() {
  return (
    <ChatStack.Navigator screenOptions={stackOptions}>
      <ChatStack.Screen name="Conversations" component={ConversationsScreen} options={{ title: 'Messages' }} />
      <ChatStack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params?.name || 'Chat' })} />
    </ChatStack.Navigator>
  );
}

function NotifStackNav() {
  return (
    <NotifStack.Navigator screenOptions={stackOptions}>
      <NotifStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </NotifStack.Navigator>
  );
}

function ProfileStackNav() {
  return (
    <ProfileStack.Navigator screenOptions={stackOptions}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <ProfileStack.Screen name="Network" component={NetworkScreen} options={{ title: 'Connect' }} />
    </ProfileStack.Navigator>
  );
}

export default function MainTabs() {
  const { unreadCount } = useNotifStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            FeedTab: focused ? 'home' : 'home-outline',
            JobsTab: focused ? 'briefcase' : 'briefcase-outline',
            ChatTab: focused ? 'chatbubbles' : 'chatbubbles-outline',
            NotifsTab: focused ? 'notifications' : 'notifications-outline',
            ProfileTab: focused ? 'person' : 'person-outline',
          };
          const iconName = icons[route.name] || 'ellipse';
          if (route.name === 'NotifsTab' && unreadCount > 0) {
            return (
              <View>
                <Ionicons name={iconName} size={size} color={color} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              </View>
            );
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="FeedTab" component={FeedStackNav} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="JobsTab" component={JobsStackNav} options={{ tabBarLabel: 'Jobs' }} />
      <Tab.Screen name="ChatTab" component={ChatStackNav} options={{ tabBarLabel: 'Messages' }} />
      <Tab.Screen name="NotifsTab" component={NotifStackNav} options={{ tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNav} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

const stackOptions = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: '600' },
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabLabel: { fontSize: 11, fontWeight: '500' },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
