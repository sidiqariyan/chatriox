import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Globe, 
  Download, 
  Play, 
  Pause, 
  StopCircle, 
  FileText, 
  Users, 
  Mail, 
  Phone,
  Building,
  MapPin,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Settings
} from 'lucide-react';

const MailScraper: React.FC = () => {
  const [scrapingType, setScrapingType] = useState<'website' | 'business_search'>('website');
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState({ country: '', city: '', state: '' });
  const [settings, setSettings] = useState({
    depth: 1,
    maxPages: 50,
    delay: 2,
    pattern: 'all',
    maxResults: 100
  });
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const queryClient = useQueryClient();

  // Fetch scraping jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['scraping-jobs'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scraper/jobs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  // Start scraping mutation
  const startScrapingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scraper/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
      setUrl('');
      setSearchQuery('');
    }
  });

  // Cancel job mutation
  const cancelJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scraper/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
    }
  });

  // Download results mutation
  const downloadResultsMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scraper/jobs/${jobId}/results`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scraping_results_${jobId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      return response.json();
    }
  });

  const handleStartScraping = () => {
    const scrapingData = {
      type: scrapingType,
      ...(scrapingType === 'website' ? { url } : { searchQuery, location }),
      settings
    };
    startScrapingMutation.mutate(scrapingData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'running':
        return <RefreshCw className="text-blue-500 animate-spin" size={16} />;
      case 'failed':
        return <XCircle className="text-red-500" size={16} />;
      case 'cancelled':
        return <StopCircle className="text-gray-500" size={16} />;
      default:
        return <AlertTriangle className="text-yellow-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Business Lead Scraper</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Extract email addresses and business information from websites and search results.</p>
        </div>
        <button 
          onClick={handleStartScraping}
          disabled={startScrapingMutation.isPending || (!url && !searchQuery)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50"
        >
          <Search className="inline mr-2" size={16} />
          {startScrapingMutation.isPending ? 'Starting...' : 'Start Scraping'}
        </button>
      </motion.div>

      {/* Scraping Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Scraping Configuration</h3>
        
        {/* Scraping Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Scraping Type</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setScrapingType('website')}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                scrapingType === 'website'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Globe className="text-blue-600" size={24} />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Website Scraping</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Extract emails from specific websites</p>
                </div>
              </div>
            </div>
            <div
              onClick={() => setScrapingType('business_search')}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                scrapingType === 'business_search'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Building className="text-purple-600" size={24} />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Business Search</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Find businesses by industry and location</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scrapingType === 'website' ? (
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Query</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="restaurants, hotels, software companies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={location.country}
                    onChange={(e) => setLocation({ ...location, country: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Country"
                  />
                  <input
                    type="text"
                    value={location.state}
                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="State"
                  />
                  <input
                    type="text"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Advanced Settings */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Advanced Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Pages</label>
              <input
                type="number"
                value={settings.maxPages}
                onChange={(e) => setSettings({ ...settings, maxPages: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delay (seconds)</label>
              <input
                type="number"
                value={settings.delay}
                onChange={(e) => setSettings({ ...settings, delay: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Results</label>
              <input
                type="number"
                value={settings.maxResults}
                onChange={(e) => setSettings({ ...settings, maxResults: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="10"
                max="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pattern</label>
              <select
                value={settings.pattern}
                onChange={(e) => setSettings({ ...settings, pattern: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Emails</option>
                <option value="business">Business Only</option>
                <option value="personal">Personal Only</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scraping Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white">Scraping Jobs</h3>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] })}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {jobsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : jobs?.data?.length === 0 ? (
          <div className="text-center py-12">
            <Search className="text-gray-400 mx-auto mb-4" size={48} />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Scraping Jobs</h4>
            <p className="text-gray-600 dark:text-gray-400">Start your first scraping job to extract business leads.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Job</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Results</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs?.data?.map((job: any) => (
                  <tr key={job._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {job.type === 'website' ? job.url : job.searchQuery}
                        </div>
                        {job.type === 'business_search' && job.location && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {[job.location.city, job.location.state, job.location.country].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="capitalize text-gray-600 dark:text-gray-400">{job.type.replace('_', ' ')}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress?.percentage || 0}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {job.progress?.percentage || 0}% complete
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="flex items-center space-x-2 text-green-600">
                          <Mail size={14} />
                          <span>{job.progress?.emailsFound || 0} emails</span>
                        </div>
                        {job.type === 'business_search' && (
                          <>
                            <div className="flex items-center space-x-2 text-blue-600">
                              <Building size={14} />
                              <span>{job.progress?.businessesFound || 0} businesses</span>
                            </div>
                            <div className="flex items-center space-x-2 text-purple-600">
                              <Phone size={14} />
                              <span>{job.progress?.phonesFound || 0} phones</span>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {job.status === 'completed' && (
                          <button
                            onClick={() => downloadResultsMutation.mutate(job._id)}
                            disabled={downloadResultsMutation.isPending}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Download Results"
                          >
                            <Download size={14} />
                          </button>
                        )}
                        {job.status === 'running' && (
                          <button
                            onClick={() => cancelJobMutation.mutate(job._id)}
                            disabled={cancelJobMutation.isPending}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Cancel Job"
                          >
                            <StopCircle size={14} />
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

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Scraping Job Details</h3>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Job Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="text-gray-900 dark:text-white capitalize">{selectedJob.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedJob.status)}`}>
                        {selectedJob.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Created:</span>
                      <span className="text-gray-900 dark:text-white">{new Date(selectedJob.createdAt).toLocaleString()}</span>
                    </div>
                    {selectedJob.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                        <span className="text-gray-900 dark:text-white">{new Date(selectedJob.completedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Progress</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                        <span className="text-gray-900 dark:text-white">{selectedJob.progress?.percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedJob.progress?.percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedJob.progress?.emailsFound || 0}</div>
                        <div className="text-gray-600 dark:text-gray-400">Emails Found</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedJob.progress?.validEmails || 0}</div>
                        <div className="text-gray-600 dark:text-gray-400">Valid Emails</div>
                      </div>
                      {selectedJob.type === 'business_search' && (
                        <>
                          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{selectedJob.progress?.businessesFound || 0}</div>
                            <div className="text-gray-600 dark:text-gray-400">Businesses</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{selectedJob.progress?.phonesFound || 0}</div>
                            <div className="text-gray-600 dark:text-gray-400">Phone Numbers</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Preview */}
              {selectedJob.results && selectedJob.results.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Results Preview</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Email</th>
                          {selectedJob.type === 'business_search' && (
                            <>
                              <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Business</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Phone</th>
                            </>
                          )}
                          <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Source</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedJob.results.slice(0, 10).map((result: any, index: number) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-2 px-3 text-gray-900 dark:text-white">{result.email}</td>
                            {selectedJob.type === 'business_search' && (
                              <>
                                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{result.businessName || '-'}</td>
                                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{result.phone || '-'}</td>
                              </>
                            )}
                            <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{result.source}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                result.status === 'valid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                result.status === 'invalid' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              }`}>
                                {result.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {selectedJob.results.length > 10 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 mt-3">
                        Showing 10 of {selectedJob.results.length} results
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
              {selectedJob.status === 'completed' && (
                <button
                  onClick={() => downloadResultsMutation.mutate(selectedJob._id)}
                  disabled={downloadResultsMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Download className="inline mr-2" size={16} />
                  Download CSV
                </button>
              )}
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MailScraper;