import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, CheckCircle, AlertCircle, Settings, RefreshCw } from 'lucide-react';

const GmailSender: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 2000);
  };

  const gmailAccounts = [
    { email: 'john@gmail.com', status: 'connected', dailyLimit: 500, sent: 127 },
    { email: 'marketing@company.com', status: 'connected', dailyLimit: 500, sent: 89 },
    { email: 'support@company.com', status: 'disconnected', dailyLimit: 500, sent: 0 },
  ];

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Gmail Sender</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Send emails directly through Gmail integration.</p>
        </div>
        <button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg disabled:opacity-50"
        >
          {isConnecting ? (
            <RefreshCw className="animate-spin" size={16} />
          ) : (
            <Mail size={16} />
          )}
          <span>{isConnecting ? 'Connecting...' : 'Connect Gmail'}</span>
        </button>
      </motion.div>

      {!isConnected ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8"
        >
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="text-red-600" size={40} />
            </div>
            <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-4">Connect Your Gmail Account</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              To start sending emails through Gmail, you need to connect your account first. We use OAuth 2.0 for secure authentication.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="text-blue-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Connection</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">OAuth 2.0 authentication ensures your credentials are safe</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Settings className="text-green-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Easy Setup</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">One-click setup with automatic configuration</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Mail className="text-purple-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">High Deliverability</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Send up to 500 emails per day per account</p>
              </div>
            </div>
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Gmail Account'}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Connected Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Connected Gmail Accounts</h3>
            <div className="space-y-4">
              {gmailAccounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-xl flex items-center justify-center">
                      <Mail className="text-red-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{account.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {account.sent}/{account.dailyLimit} emails sent today
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
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
                            <AlertCircle size={12} className="mr-1" />
                            Disconnected
                          </>
                        )}
                      </span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      {account.status === 'connected' ? 'Manage' : 'Reconnect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Gmail Composer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Compose Gmail</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Account</label>
                  <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200">
                    {gmailAccounts.filter(acc => acc.status === 'connected').map((account, index) => (
                      <option key={index} value={account.email}>{account.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="recipient@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea 
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Write your message here..."
                ></textarea>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200">
                  Save Draft
                </button>
                <button className="flex items-center space-x-2 px-6 py-2 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg">
                  <Send size={16} />
                  <span>Send via Gmail</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GmailSender;