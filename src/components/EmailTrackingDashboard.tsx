import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Mail,
  Eye,
  MousePointer,
  TrendingUp,
  Download,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight
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
  Bar
} from 'recharts';

const EmailTrackingDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch email analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['email-analytics', timeRange],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/email-tracking/analytics?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  // Fetch email activities
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['email-activities', statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('recipient', searchTerm);
      
      const response = await fetch(`http://localhost:5000/api/email-tracking/activities?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  const analytics = analyticsData?.data?.overview || {};
  const dailyStats = analyticsData?.data?.dailyStats || [];
  const topTemplates = analyticsData?.data?.topTemplates || [];
  const activities = activitiesData?.data || [];

  const statsCards = [
    {
      title: 'Total Emails Sent',
      value: analytics.totalEmails?.toLocaleString() || '0',
      change: '+12%',
      changeType: 'positive' as const,
      icon: <Mail className="text-blue-500" size={24} />,
      color: 'blue'
    },
    {
      title: 'Delivery Rate',
      value: `${analytics.deliveryRate || 0}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: <TrendingUp className="text-green-500" size={24} />,
      color: 'green'
    },
    {
      title: 'Open Rate',
      value: `${analytics.openRate || 0}%`,
      change: '+5.3%',
      changeType: 'positive' as const,
      icon: <Eye className="text-purple-500" size={24} />,
      color: 'purple'
    },
    {
      title: 'Click Rate',
      value: `${analytics.clickRate || 0}%`,
      change: '+1.8%',
      changeType: 'positive' as const,
      icon: <MousePointer className="text-orange-500" size={24} />,
      color: 'orange'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'opened':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'clicked':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'bounced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'failed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      params.append('format', 'csv');
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('recipient', searchTerm);

      const response = await fetch(`http://localhost:5000/api/email-tracking/export?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email_activities_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Email Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor email performance and engagement metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button 
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Download className="inline mr-2" size={16} />
            Export
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
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
              {stat.changeType === 'positive' ? (
                <ArrowUpRight className="text-green-500 mr-1" size={16} />
              ) : (
                <ArrowDownRight className="text-red-500 mr-1" size={16} />
              )}
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Performance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Email Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
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
                <Line type="monotone" dataKey="opened" stroke="#8B5CF6" strokeWidth={3} name="Opened" />
                <Line type="monotone" dataKey="clicked" stroke="#F59E0B" strokeWidth={3} name="Clicked" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Templates */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Top Performing Templates</h3>
          <div className="space-y-4">
            {topTemplates.map((template: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{template._id || 'Unknown Template'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.sent} emails sent</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{template.openRate?.toFixed(1) || 0}%</p>
                  <p className="text-sm text-gray-500">open rate</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Email Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white">Recent Email Activities</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search recipients..."
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="clicked">Clicked</option>
              <option value="bounced">Bounced</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {activitiesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Recipient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Template</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Sent At</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Opens</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity: any) => (
                  <tr key={activity._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{activity.recipient.email}</div>
                        {activity.recipient.name && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">{activity.recipient.name}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-xs truncate text-gray-900 dark:text-white">
                        {activity.emailDetails.subject}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {activity.template.name || 'Custom'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(activity.tracking.sentAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-purple-600 font-medium">{activity.tracking.opens}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-orange-600 font-medium">{activity.tracking.clicks}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EmailTrackingDashboard;