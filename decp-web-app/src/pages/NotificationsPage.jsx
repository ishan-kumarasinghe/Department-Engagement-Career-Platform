import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  MessageCircle,
  Briefcase,
  User,
  Settings,
  Trash2,
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, likes, comments, jobs
  const [preferences, setPreferences] = useState({
    likesNotifications: true,
    commentsNotifications: true,
    jobNotifications: true,
    messageNotifications: true,
  });

  // Mock data
  useEffect(() => {
    const mockNotifications = [
      {
        id: '1',
        type: 'like',
        actor: { _id: 'user1', fullName: 'Alice Johnson' },
        targetType: 'post',
        targetId: 'post1',
        message: 'liked your post',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        read: false,
      },
      {
        id: '2',
        type: 'comment',
        actor: { _id: 'user2', fullName: 'Bob Smith' },
        targetType: 'post',
        targetId: 'post1',
        message: 'commented on your post: "Great work!"',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
      },
      {
        id: '3',
        type: 'job',
        actor: { _id: 'user3', fullName: 'Carol Davis' },
        message: 'posted a new Full-Stack Developer Internship',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
      },
      {
        id: '4',
        type: 'job_application',
        actor: { _id: 'user4', fullName: 'David Martin' },
        message: 'applied for your Data Science Associate position',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        read: true,
      },
      {
        id: '5',
        type: 'like',
        actor: { _id: 'user5', fullName: 'Emma Wilson' },
        targetType: 'post',
        targetId: 'post2',
        message: 'liked your post',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true,
      },
      {
        id: '6',
        type: 'message',
        actor: { _id: 'user1', fullName: 'Alice Johnson' },
        message: 'sent you a message',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: true,
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={20} className="text-red-600" />;
      case 'comment':
        return <MessageCircle size={20} className="text-blue-600" />;
      case 'job':
      case 'job_application':
        return <Briefcase size={20} className="text-green-600" />;
      case 'message':
        return <MessageCircle size={20} className="text-purple-600" />;
      case 'follow':
        return <User size={20} className="text-blue-600" />;
      default:
        return <MessageCircle size={20} className="text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'like':
        return 'bg-red-50';
      case 'comment':
        return 'bg-blue-50';
      case 'job':
      case 'job_application':
        return 'bg-green-50';
      case 'message':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );

    // In production, call notificationApi.post(`/api/notifications/${id}/read`)
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));

    // In production, call notificationApi.post('/api/notifications/read-all')
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));

    // In production, call notificationApi.delete(`/api/notifications/${id}`)
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'likes') return notif.type === 'like';
    if (filter === 'comments') return notif.type === 'comment';
    if (filter === 'jobs') return notif.type === 'job' || notif.type === 'job_application';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-30">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} {unreadCount === 1 ? 'unread' : 'unread'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium text-sm"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 border-t border-gray-200 flex gap-4 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'likes', label: 'Likes' },
            { id: 'comments', label: 'Comments' },
            { id: 'jobs', label: 'Jobs' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-4 border-b-2 font-medium transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-700 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`p-6 hover:bg-gray-50 cursor-pointer transition-all ${
                !notification.read ? 'bg-blue-50 hover:bg-blue-100' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-gray-900">
                    <span className="font-semibold">
                      {notification.actor?.fullName}
                    </span>{' '}
                    <span className="text-gray-700">
                      {notification.message}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatTime(new Date(notification.timestamp))}
                  </p>
                </div>

                {!notification.read && (
                  <div className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-600 flex-shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No notifications</p>
            <p className="text-gray-500 text-sm mt-1">
              You're all caught up! Stay active to get new notifications.
            </p>
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="m-6 bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings size={24} className="text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              id: 'likesNotifications',
              label: 'Post Likes',
              description: 'Get notified when someone likes your post',
            },
            {
              id: 'commentsNotifications',
              label: 'Comments',
              description: 'Get notified when someone comments on your post',
            },
            {
              id: 'jobNotifications',
              label: 'New Job Postings',
              description: 'Get notified about new jobs and internships',
            },
            {
              id: 'messageNotifications',
              label: 'Messages',
              description: 'Get notified when you receive a new message',
            },
          ].map(pref => (
            <div key={pref.id} className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">{pref.label}</p>
                <p className="text-sm text-gray-600">{pref.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences[pref.id]}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      [pref.id]: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>

        <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
