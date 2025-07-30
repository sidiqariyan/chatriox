import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Users, 
  TrendingUp, 
  Activity, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
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
  Bar,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell as RechartsCell
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi } from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', timeRange],
    queryFn: () => dashboardApi.getStats(timeRange)
  });

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics', timeRange],
    queryFn: () => dashboardApi.getAnalytics(timeRange)
  });

  // Fetch top campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['dashboard-campaigns'],
    queryFn: () => dashboardApi.getCampaigns(5)
  });

  const stats = statsData?.data || {};
  const analytics = analyticsData?.data || {};
  const campaigns = campaignsData?.data || [];

  const isInTrial = user?.planStatus === 'trial';
  const trialDaysLeft = user?.trialDaysRemaining || 0;

  const statsCards = [
    {
      title: 'Total Emails Sent',
      value: stats.totalEmailsSent?.toLocaleString() || '0',
      change: `${stats.changes?.emails || 0}%`,
      changeType: (stats.changes?.emails || 0) >= 0 ? 'positive' : 'negative',
      icon: <Mail className="text-blue-500" size={24} />,
      color: 'blue'
    },
    {
      title: 'Open Rate',
      value: `${stats.openRate || 0}%`,
      change: `${stats.changes?.openRate || 0}%`,
      changeType: (stats.changes?.openRate || 0) >= 0 ? 'positive' : 'negative',
      icon: <TrendingUp className="text-green-500" size={24} />,
      color: 'green'
    },
    {
      title: 'Click Rate',
      value: `${stats.clickRate || 0}%`,
      change: `${stats.changes?.clickRate || 0}%`,
      changeType: (stats.changes?.clickRate || 0) >= 0 ? 'positive' : 'negative',
      icon: <Activity className="text-purple-500" size={24} />,
      color: 'purple'
    },
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns?.toString() || '0',
      change: `${stats.changes?.campaigns || 0}%`,
      changeType: (stats.changes?.campaigns || 0) >= 0 ? 'positive' : 'negative',
      icon: <Users className="text-orange-500" size={24} />,
      color: 'orange'
    }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your marketing campaigns today.
          </p>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </motion.div>

      {/* Trial Banner */}
      {isInTrial && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 ${
            trialDaysLeft <= 1 
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {trialDaysLeft <= 1 ? (
                <AlertTriangle className="text-red-500" size={24} />
              ) : (
                <Clock className="text-blue-500" size={24} />
              )}
              <div>
                <h3 className={`font-semibold ${
                  trialDaysLeft <= 1 ? 'text-red-800 dark:text-red-400' : 'text-blue-800 dark:text-blue-400'
                }`}>
                  {trialDaysLeft <= 1 ? 'Trial Ending Soon!' : 'Trial Active'}
                </h3>
                <p className={`text-sm ${
                  trialDaysLeft <= 1 ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'
                }`}>
                  {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left in your trial period
                </p>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/plans'}
              className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                trialDaysLeft <= 1
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Upgrade Now
            </button>
          </div>
        </motion.div>
      )}

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
              <LineChart data={analytics.emailData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#6B7280" />
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
                <Line type="monotone" dataKey="opened" stroke="#10B981" strokeWidth={3} name="Opened" />
                <Line type="monotone" dataKey="clicked" stroke="#F59E0B" strokeWidth={3} name="Clicked" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Device Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Device Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <RechartsPie
                  data={analytics.deviceData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(analytics.deviceData || []).map((entry: any, index: number) => (
                    <RechartsCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RechartsPie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Campaigns and Email Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Top Performing Campaigns</h3>
          <div className="space-y-4">
            {campaigns.map((campaign: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{campaign.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{campaign.sent} emails sent</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{campaign.ctr}%</p>
                  <p className="text-sm text-gray-500">CTR</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Email Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Email Volume (6 Months)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.emailVolumeData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="emails" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/email-sender'}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl hover:shadow-lg transition-all duration-200 text-center"
          >
            <Mail className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="font-medium text-gray-900 dark:text-white">Create Campaign</p>
          </button>
          <button 
            onClick={() => window.location.href = '/mail-scraper'}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl hover:shadow-lg transition-all duration-200 text-center"
          >
            <Users className="mx-auto mb-2 text-green-600" size={24} />
            <p className="font-medium text-gray-900 dark:text-white">Find Leads</p>
          </button>
          <button 
            onClick={() => window.location.href = '/email-validation'}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl hover:shadow-lg transition-all duration-200 text-center"
          >
            <CheckCircle className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="font-medium text-gray-900 dark:text-white">Validate Emails</p>
          </button>
          <button 
            onClick={() => window.location.href = '/email-tracking'}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl hover:shadow-lg transition-all duration-200 text-center"
          >
            <BarChart3 className="mx-auto mb-2 text-orange-600" size={24} />
            <p className="font-medium text-gray-900 dark:text-white">View Analytics</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;