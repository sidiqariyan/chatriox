import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Mail, 
  Key, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const Accounts: React.FC = () => {
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});

  const emailAccounts = [
    { 
      id: 1,
      type: 'Gmail', 
      email: 'john@gmail.com', 
      status: 'connected', 
      dailyLimit: 500, 
      sent: 127,
      lastUsed: '2 hours ago'
    },
    { 
      id: 2,
      type: 'Gmail', 
      email: 'marketing@company.com', 
      status: 'connected', 
      dailyLimit: 500, 
      sent: 89,
      lastUsed: '1 day ago'
    },
    { 
      id: 3,
      type: 'Outlook', 
      email: 'support@company.com', 
      status: 'disconnected', 
      dailyLimit: 300, 
      sent: 0,
      lastUsed: 'Never'
    },
  ];

  const apiKeys = [
    { 
      id: 1,
      name: 'SendGrid API Key', 
      key: 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      status: 'active',
      lastUsed: '1 hour ago'
    },
    { 
      id: 2,
      name: 'WhatsApp API Key', 
      key: 'EAAG...xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      status: 'active',
      lastUsed: '3 hours ago'
    },
    { 
      id: 3,
      name: 'Mailgun API Key', 
      key: 'key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      status: 'inactive',
      lastUsed: '1 week ago'
    },
  ];

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskApiKey = (key: string, show: boolean) => {
    if (show) return key;
    return key.substring(0, 8) + '•'.repeat(key.length - 16) + key.substring(key.length - 8);
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your connected accounts and API keys.</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
          <Plus className="inline mr-2" size={16} />
          Add Account
        </button>
      </motion.div>

      {/* Email Accounts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white">Email Accounts</h3>
          <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200">
            <Plus size={16} />
            <span>Connect Account</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {emailAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  account.type === 'Gmail' 
                    ? 'bg-red-100 dark:bg-red-900/20' 
                    : 'bg-blue-100 dark:bg-blue-900/20'
                }`}>
                  <Mail className={`${
                    account.type === 'Gmail' ? 'text-red-600' : 'text-blue-600'
                  }`} size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 dark:text-white">{account.email}</p>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      {account.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {account.sent}/{account.dailyLimit} sent today
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Last used: {account.lastUsed}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  account.status === 'connected' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {account.status === 'connected' ? (
                    <>
                      <CheckCircle size={12} className="mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <XCircle size={12} className="mr-1" />
                      Disconnected
                    </>
                  )}
                </span>
                <div className="flex space-x-1">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* API Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white">API Keys</h3>
          <button className="flex items-center space-x-2 px-4 py-2 text-purple-600 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200">
            <Plus size={16} />
            <span>Add API Key</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Key className="text-purple-600" size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{apiKey.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Last used: {apiKey.lastUsed}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    apiKey.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {apiKey.status}
                  </span>
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={maskApiKey(apiKey.key, showApiKey[apiKey.id] || false)}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-mono"
                />
                <button 
                  onClick={() => toggleApiKeyVisibility(apiKey.id.toString())}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showApiKey[apiKey.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Account Settings</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
            <input 
              type="text" 
              defaultValue="MarketingHub Inc."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Zone</label>
            <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
              <option>UTC (GMT +0)</option>
              <option>EST (GMT -5)</option>
              <option>PST (GMT -8)</option>
              <option>CET (GMT +1)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Email Signature</label>
            <textarea 
              rows={3}
              defaultValue="Best regards,&#10;MarketingHub Team&#10;https://marketinghub.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notification Settings</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Email notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">SMS notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Campaign alerts</span>
              </label>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
            Save Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Accounts;