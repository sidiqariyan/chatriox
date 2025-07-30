import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Mail, 
  MessageSquare, 
  Search, 
  Shield, 
  Users, 
  Settings, 
  CreditCard,
  Activity,
  UserCog,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Email Sender', href: '/email-sender', icon: Mail },
    { name: 'Gmail Sender', href: '/gmail-sender', icon: Mail },
    { name: 'WhatsApp Sender', href: '/whatsapp-sender', icon: MessageSquare },
    { name: 'Lead Scraper', href: '/mail-scraper', icon: Search },
    { name: 'Email Validation', href: '/email-validation', icon: Shield },
    { name: 'Email Tracking', href: '/email-tracking', icon: Activity },
    { name: 'Accounts', href: '/accounts', icon: Users },
    { name: 'Plans', href: '/plans', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Add admin route if user is admin
  if (user?.role === 'admin') {
    navigationItems.push({ name: 'Admin Dashboard', href: '/admin', icon: UserCog });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Different behavior for mobile vs desktop */}
      <div className="lg:flex lg:flex-shrink-0">
        <div className="lg:flex lg:flex-col lg:w-80">
          {/* Mobile Sidebar */}
          <motion.div
            initial={false}
            animate={{ x: isOpen ? 0 : -320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 border-r border-gray-200 dark:border-gray-700"
          >
            <SidebarContent 
              navigationItems={navigationItems} 
              user={user} 
              onClose={onClose} 
              showCloseButton={true}
            />
          </motion.div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex lg:flex-col lg:w-80 lg:h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <SidebarContent 
              navigationItems={navigationItems} 
              user={user} 
              onClose={onClose} 
              showCloseButton={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// Extracted sidebar content to avoid duplication
const SidebarContent: React.FC<{
  navigationItems: any[];
  user: any;
  onClose: () => void;
  showCloseButton: boolean;
}> = ({ navigationItems, user, onClose, showCloseButton }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Mail className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white">MarketingHub</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Marketing Platform</p>
          </div>
        </div>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={() => window.innerWidth < 1024 && onClose()}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        {/* Plan Info */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.plan?.charAt(0).toUpperCase() + user?.plan?.slice(1)} Plan
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              user?.planStatus === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : user?.planStatus === 'trial'
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {user?.planStatus === 'trial' ? `Trial (${user?.trialDaysRemaining}d left)` : user?.planStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;