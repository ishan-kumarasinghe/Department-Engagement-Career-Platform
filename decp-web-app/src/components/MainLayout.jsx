import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Briefcase,
  MessageCircle,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import depLogo from '../assets/Dep_logo.png';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Feed', path: '/' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  const isAlumniOrAdmin = user?.role === 'alumni' || user?.role === 'admin';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 fixed h-full left-0 top-0 z-40 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => navigate('/')}>
            <img
              src={depLogo}
              alt="Department Logo"
              className={`${sidebarOpen ? 'h-18' : 'h-10'} w-auto object-contain`}
            />
          </div>
        </div>
       

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={24} className="flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Post Button */}
        <div className="p-4 border-t border-gray-200">
          {isAlumniOrAdmin && (
            <button
              onClick={() => navigate('/create-job')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              {sidebarOpen && 'Post Job'}
            </button>
          )}
          <button
            onClick={() => navigate('/create-post')}
            className={`w-full mt-2 ${isAlumniOrAdmin ? '' : ''} bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2`}
          >
            <Plus size={20} />
            {sidebarOpen && 'Post'}
          </button>
        </div>

        {/* Collapse Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Navigation */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {location.pathname === '/' && 'Feed'}
              {location.pathname === '/jobs' && 'Jobs & Internships'}
              {location.pathname === '/messages' && 'Messages'}
              {location.pathname === '/notifications' && 'Notifications'}
              {location.pathname === '/profile' && 'Profile'}
            </h1>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    <User size={18} />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-lg border-t border-gray-200"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="overflow-auto h-[calc(100vh-73px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
