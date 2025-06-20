import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search, Menu } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const Header = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const unreadCount = notifications.length;

  const getRoleColor = () => {
    switch (user?.role) {
      case 'shopkeeper':
        return 'text-blue-600';
      case 'supervisor':
        return 'text-green-600';
      case 'operator':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'shopkeeper' && 'Shopkeeper Dashboard'}
            {user?.role === 'supervisor' && 'Supervisor Dashboard'}
            {user?.role === 'operator' && 'Operator Dashboard'}
          </h1>
          <div className="flex items-center gap-2 text-gray-600">
            <span>Welcome back, <span className={`font-medium ${getRoleColor()}`}>{user?.name}</span></span>
            {user?.shopName && <span className="text-sm">• Shop: {user.shopName}</span>}
            {user?.companyName && <span className="text-sm">• Company: {user.companyName}</span>}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools, orders..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;