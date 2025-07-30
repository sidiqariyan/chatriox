import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  Filter,
  Download,
  Eye,
  UserCheck,
  UserX,
  Clock,
  CreditCard,
  BarChart3,
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [userFilter, setUserFilter] = useState('all');

  // Fetch admin dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard', timeRange],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/admin/dashboard?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  // Fetch users with filters
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', userFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userFilter !== 'all') params.append('planStatus', userFilter);
      
      const response = await fetch(`http://localhost:5000/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  // Fetch analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics', timeRange],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/admin/analytics?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  const stats = dashboardData?.data?.overview || {};
  const revenue = dashboardData?.data?.revenue || {};
  const campaigns = dashboardData?.data?.campaigns || {};
  const alerts = dashboardData?.data?.alerts || {};

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers?.toLocaleString() || '0',
      change: `+${stats.userGrowthRate || 0}%`,
      changeType: 'positive' as const,
      icon: <Users className="text-blue-500" size={24} />,
      color: 'blue'
    },
    {
      title: 'Active Subscriptions',
      value: stats.paidUsers?.toLocaleString() || '0',
      change: `${stats.trialToPaidUsers || 0} converted`,
      changeType: 'positive' as const,
      icon: <CreditCard className="text-green-500" size={24} />,
      color: 'green'
    },
    {
      title: 'Total Revenue',
      value: `₹${revenue.totalRevenue?.toLocaleString() || '0'}`,
      change: `${revenue.totalTransactions || 0} transactions`,
      changeType: 'positive' as const,
      icon: <DollarSign className="text-purple-500" size={24} />,
      color: 'purple'
    },
    {
      title: 'Trial Users',
      value: stats.trialUsers?.toLocaleString() || '0',
      change: `${alerts.trialExpiringUsers || 0} expiring soon`,
      changeType: alerts.trialExpiringUsers > 0 ? 'negative' : 'neutral' as const,
      icon: <Clock className="text-orange-500" size={24} />,
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
          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor platform performance and user analytics</p>
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
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            <Download className="inline mr-2" size={16} />
            Export Report
          </button>
        </div>
      </motion.div>

      {/* Alerts */}
      {alerts.trialExpiringUsers > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4"
        >
          <div className="flex items-center space-x-3">
            <Clock className="text-orange-500" size={20} />
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-400">Trial Expiry Alert</h4>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                {alerts.trialExpiringUsers} users have trials expiring in the next 24 hours
              </p>
            </div>
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
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 
                stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">User Registration Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.data?.registrationTrends || []}>
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
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Plan Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData?.data?.planPopularity || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {(analyticsData?.data?.planPopularity || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Users Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white">User Management</h3>
          <div className="flex items-center space-x-3">
            <select 
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="trial">Trial Users</option>
              <option value="active">Active Subscribers</option>
              <option value="expired">Expired Users</option>
            </select>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Filter className="inline mr-1" size={16} />
              More Filters
            </button>
          </div>
        </div>

        {usersLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Trial</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.data?.map((user: any) => (
                  <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.plan === 'enterprise' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                        user.plan === 'professional' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.planStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        user.planStatus === 'trial' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {user.planStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {user.isInTrial ? `${user.trialDaysRemaining} days left` : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      ₹{user.totalRevenue?.toLocaleString() || '0'}
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          <Eye size={14} />
                        </button>
                        <button className="text-green-600 hover:text-green-700 text-sm">
                          <UserCheck size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Revenue Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Revenue Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData?.data?.revenueTrends || []}>
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
              <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;