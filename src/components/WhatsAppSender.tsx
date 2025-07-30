import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Plus, 
  QrCode, 
  Send, 
  Users, 
  Image, 
  FileText, 
  Video, 
  Mic,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  BarChart3,
  Clock,
  Zap,
  Shield,
  Upload,
  Download,
  Eye,
  Filter,
  Search,
  Phone,
  Mail,
  Building,
  Trash2,
  Play,
  Pause,
  StopCircle,
  TrendingUp,
  Activity,
  MousePointer
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';

const WhatsAppSender: React.FC = () => {
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [messageContent, setMessageContent] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [showContactImport, setShowContactImport] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: string }>({});

  const queryClient = useQueryClient();

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join_user_room', user?.id);

    // Listen for WhatsApp events
    newSocket.on('qr_code', (data) => {
      setQrCodeData(data.qrCode);
      setShowQRCode(true);
      setConnectionStatus(prev => ({ ...prev, [data.accountId]: 'connecting' }));
    });

    newSocket.on('whatsapp_authenticated', (data) => {
      setConnectionStatus(prev => ({ ...prev, [data.accountId]: 'authenticated' }));
    });

    newSocket.on('whatsapp_ready', (data) => {
      setConnectionStatus(prev => ({ ...prev, [data.accountId]: 'ready' }));
      setShowQRCode(false);
      queryClient.invalidateQueries({ queryKey: ['whatsapp-accounts'] });
    });

    newSocket.on('whatsapp_disconnected', (data) => {
      setConnectionStatus(prev => ({ ...prev, [data.accountId]: 'disconnected' }));
      queryClient.invalidateQueries({ queryKey: ['whatsapp-accounts'] });
    });

    newSocket.on('campaign_progress', (data) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
    });

    return () => newSocket.close();
  }, [user?.id, queryClient]);

  // Fetch WhatsApp accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['whatsapp-accounts'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/whatsapp/accounts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  // Fetch contact lists
  const { data: contactLists, isLoading: contactsLoading } = useQuery({
    queryKey: ['whatsapp-contact-lists'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/whatsapp-web/contacts/lists', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  // Fetch campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['whatsapp-campaigns'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/whatsapp/campaigns', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['whatsapp-analytics'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/whatsapp-web/analytics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  // Connect WhatsApp account mutation
  const connectAccountMutation = useMutation({
    mutationFn: async (accountData: any) => {
      const response = await fetch('http://localhost:5000/api/whatsapp-web/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(accountData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-accounts'] });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const formData = new FormData();
      formData.append('accountId', messageData.accountId);
      formData.append('recipients', JSON.stringify(messageData.recipients));
      formData.append('content', JSON.stringify(messageData.content));
      
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      const response = await fetch('http://localhost:5000/api/whatsapp-web/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      return response.json();
    },
    onSuccess: () => {
      setMessageContent('');
      setSelectedContacts([]);
      setMediaFile(null);
      queryClient.invalidateQueries({ queryKey: ['whatsapp-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
    }
  });

  // Import contacts mutation
  const importContactsMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('csvFile', data.file);
      formData.append('listName', data.listName);
      formData.append('listDescription', data.listDescription);

      const response = await fetch('http://localhost:5000/api/whatsapp-web/contacts/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-contact-lists'] });
      setShowContactImport(false);
    }
  });

  const handleConnectAccount = () => {
    const accountName = `WhatsApp Account ${(accounts?.data?.length || 0) + 1}`;
    connectAccountMutation.mutate({ accountName });
  };

  const handleSendMessage = () => {
    if (!selectedAccount || !messageContent || selectedContacts.length === 0) return;

    sendMessageMutation.mutate({
      accountId: selectedAccount._id,
      recipients: selectedContacts,
      content: {
        type: messageType,
        text: messageContent
      }
    });
  };

  const getStatusIcon = (status: string) => {
    const currentStatus = connectionStatus[status] || status;
    switch (currentStatus) {
      case 'ready':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'connecting':
      case 'authenticated':
        return <RefreshCw className="text-blue-500 animate-spin" size={16} />;
      case 'disconnected':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <AlertTriangle className="text-yellow-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    const currentStatus = connectionStatus[status] || status;
    switch (currentStatus) {
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'connecting':
      case 'authenticated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'disconnected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">WhatsApp Bulk Sender</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Send bulk WhatsApp messages with advanced analytics and anti-blocking features.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="inline mr-2" size={16} />
            Analytics
          </button>
          <button 
            onClick={handleConnectAccount}
            disabled={connectAccountMutation.isPending}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg disabled:opacity-50"
          >
            <Plus className="inline mr-2" size={16} />
            {connectAccountMutation.isPending ? 'Connecting...' : 'Connect Account'}
          </button>
        </div>
      </motion.div>

      {/* Analytics Dashboard */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Analytics Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Messages',
                  value: analytics?.data?.overview?.totalMessages?.toLocaleString() || '0',
                  change: '+12%',
                  icon: <MessageSquare className="text-blue-500" size={24} />,
                  color: 'blue'
                },
                {
                  title: 'Delivery Rate',
                  value: `${analytics?.data?.overview?.deliveryRate || 0}%`,
                  change: '+5.2%',
                  icon: <TrendingUp className="text-green-500" size={24} />,
                  color: 'green'
                },
                {
                  title: 'Read Rate',
                  value: `${analytics?.data?.overview?.readRate || 0}%`,
                  change: '+3.1%',
                  icon: <Eye className="text-purple-500" size={24} />,
                  color: 'purple'
                },
                {
                  title: 'Click Rate',
                  value: `${analytics?.data?.overview?.clickRate || 0}%`,
                  change: '+1.8%',
                  icon: <MousePointer className="text-orange-500" size={24} />,
                  color: 'orange'
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold font-display text-gray-900 dark:text-white mt-1">{stat.value}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Message Performance Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Message Performance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.data?.dailyStats || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="_id.day" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Line type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={3} name="Sent" />
                      <Line type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={3} name="Delivered" />
                      <Line type="monotone" dataKey="read" stroke="#8B5CF6" strokeWidth={3} name="Read" />
                      <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={3} name="Failed" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Message Types Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Message Types</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.data?.messageTypes || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {(analytics?.data?.messageTypes || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Accounts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Connected WhatsApp Accounts</h3>
        
        {accountsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : accounts?.data?.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="text-gray-400 mx-auto mb-4" size={48} />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No WhatsApp Accounts Connected</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Connect your first WhatsApp account to start sending bulk messages.</p>
            <button 
              onClick={handleConnectAccount}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
            >
              <QrCode className="inline mr-2" size={16} />
              Connect WhatsApp Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts?.data?.map((account: any) => (
              <div
                key={account._id}
                onClick={() => setSelectedAccount(account)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedAccount?._id === account._id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{account.accountName}</h4>
                  {getStatusIcon(account._id)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="text-gray-900 dark:text-white">{account.phoneNumber || 'Not connected'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(account._id)}`}>
                      {connectionStatus[account._id] || account.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Messages Today:</span>
                    <span className="text-gray-900 dark:text-white">{account.dailyMessageCount || 0}/{account.dailyLimit || 1000}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Message Composer */}
      {selectedAccount && (connectionStatus[selectedAccount._id] === 'ready' || selectedAccount.status === 'ready') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white">Compose Message</h3>
            <button
              onClick={() => setShowContactImport(true)}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Upload size={16} />
              <span>Import Contacts</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Message Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'text', icon: MessageSquare, label: 'Text' },
                  { type: 'image', icon: Image, label: 'Image' },
                  { type: 'video', icon: Video, label: 'Video' },
                  { type: 'document', icon: FileText, label: 'Document' },
                  { type: 'audio', icon: Mic, label: 'Audio' }
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setMessageType(type)}
                    className={`p-3 border-2 rounded-xl transition-all ${
                      messageType === type
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`mx-auto mb-2 ${messageType === type ? 'text-green-600' : 'text-gray-400'}`} size={20} />
                    <p className={`text-sm font-medium ${messageType === type ? 'text-green-800 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recipients</label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter phone numbers (comma separated)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onChange={(e) => {
                    const phones = e.target.value.split(',').map(p => p.trim()).filter(p => p);
                    setSelectedContacts(phones);
                  }}
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedContacts.length} recipient{selectedContacts.length !== 1 ? 's' : ''} selected
                </div>
              </div>
            </div>
          </div>

          {/* Media Upload */}
          {messageType !== 'text' && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Media</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                <input
                  type="file"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                  accept={
                    messageType === 'image' ? 'image/*' :
                    messageType === 'video' ? 'video/*' :
                    messageType === 'audio' ? 'audio/*' :
                    messageType === 'document' ? '.pdf,.doc,.docx,.txt' : '*'
                  }
                  className="hidden"
                  id="media-upload"
                />
                <label htmlFor="media-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {mediaFile ? mediaFile.name : `Upload ${messageType} file`}
                  </p>
                  <button type="button" className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors">
                    Choose File
                  </button>
                </label>
              </div>
            </div>
          )}

          {/* Message Content */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {messageType === 'text' ? 'Message Content' : 'Caption (Optional)'}
            </label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Type your message here..."
            />
          </div>

          {/* Anti-Blocking Settings */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="text-blue-600" size={20} />
              <h4 className="font-semibold text-blue-800 dark:text-blue-400">Anti-Blocking Features</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Zap className="text-blue-600" size={16} />
                <span className="text-blue-700 dark:text-blue-300">Human-like delays</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-blue-600" size={16} />
                <span className="text-blue-700 dark:text-blue-300">Smart timing</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="text-blue-600" size={16} />
                <span className="text-blue-700 dark:text-blue-300">Risk monitoring</span>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!messageContent || selectedContacts.length === 0 || sendMessageMutation.isPending}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendMessageMutation.isPending ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Messages</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Recent Campaigns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white">Recent Campaigns</h3>
          <button className="flex items-center space-x-2 px-4 py-2 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <Download size={16} />
            <span>Export Data</span>
          </button>
        </div>
        
        {campaignsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : campaigns?.data?.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">No campaigns yet. Send your first message to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Campaign</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Recipients</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Delivery Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Read Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns?.data?.map((campaign: any) => (
                  <tr key={campaign._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{campaign.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{campaign.description}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{campaign.progress?.total || 0}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{campaign.analytics?.deliveryRate?.toFixed(1) || 0}%</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{campaign.analytics?.readRate?.toFixed(1) || 0}%</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <Eye size={14} />
                        </button>
                        {campaign.status === 'running' && (
                          <button className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Pause size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full"
          >
            <div className="text-center">
              <QrCode className="text-green-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Scan QR Code</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Open WhatsApp on your phone and scan this QR code to connect your account.
              </p>
              
              {/* QR Code Display */}
              <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-6">
                {qrCodeData ? (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrCodeData)}`}
                    alt="WhatsApp QR Code"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <QrCode className="text-gray-400" size={64} />
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowQRCode(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Contact Import Modal */}
      {showContactImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full"
          >
            <div className="text-center">
              <Upload className="text-blue-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Import Contacts</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upload a CSV file with phone numbers and contact information.
              </p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Contact list name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="file"
                  accept=".csv"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowContactImport(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Import
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppSender;