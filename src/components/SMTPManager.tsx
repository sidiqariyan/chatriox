import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Server, 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  AlertCircle
} from 'lucide-react';

interface SMTPManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SMTPManager: React.FC<SMTPManagerProps> = ({ isOpen, onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromName: '',
    fromEmail: ''
  });

  const queryClient = useQueryClient();

  // Fetch SMTP configurations
  const { data: smtpConfigs, isLoading } = useQuery({
    queryKey: ['smtp-configs'],
    queryFn: async () => {
     const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/smtp/configs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    enabled: isOpen
  });

  // Create SMTP config mutation
  const createConfigMutation = useMutation({
    mutationFn: async (data: any) => {
     const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/smtp/configs`, {
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
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
      setShowForm(false);
      resetForm();
    }
  });

  // Update SMTP config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
     const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/smtp/configs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
      setEditingConfig(null);
      setShowForm(false);
      resetForm();
    }
  });

  // Delete SMTP config mutation
  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string) => {
     const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/smtp/configs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
    }
  });

  // Test SMTP config mutation
  const testConfigMutation = useMutation({
    mutationFn: async (id: string) => {
     const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/smtp/test/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
      fromName: '',
      fromEmail: ''
    });
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      password: '', // Don't populate password for security
      fromName: config.fromName,
      fromEmail: config.fromEmail
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingConfig) {
      updateConfigMutation.mutate({ id: editingConfig._id, data: formData });
    } else {
      createConfigMutation.mutate(formData);
    }
  };

  const togglePasswordVisibility = (configId: string) => {
    setShowPassword(prev => ({ ...prev, [configId]: !prev[configId] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Server size={24} />
              <h2 className="text-2xl font-bold font-display">SMTP Configuration</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowForm(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add SMTP</span>
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {showForm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingConfig ? 'Edit SMTP Configuration' : 'Add SMTP Configuration'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingConfig(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Configuration Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="My SMTP Server"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Host *
                    </label>
                    <input
                      type="text"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="smtp.gmail.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Port *
                    </label>
                    <input
                      type="number"
                     value={formData.port.toString()}
                      onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="587"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="secure"
                      checked={formData.secure}
                      onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="secure" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use SSL/TLS
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your-email@gmail.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="App password or SMTP password"
                      required={!editingConfig}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fromName}
                      onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Email *
                    </label>
                    <input
                      type="email"
                      value={formData.fromEmail}
                      onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your-email@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingConfig(null);
                      resetForm();
                    }}
                    className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createConfigMutation.isPending || updateConfigMutation.isPending}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {createConfigMutation.isPending || updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : smtpConfigs?.data?.length === 0 ? (
                <div className="text-center py-12">
                  <Server className="text-gray-400 mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No SMTP Configurations</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Add your first SMTP configuration to start sending emails.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="inline mr-2" size={16} />
                    Add SMTP Configuration
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {smtpConfigs?.data?.map((config: any) => (
                    <div key={config._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{config.name}</h4>
                        <div className="flex items-center space-x-2">
                          {config.isVerified ? (
                            <CheckCircle className="text-green-500" size={16} />
                          ) : (
                            <AlertCircle className="text-yellow-500" size={16} />
                          )}
                          <div className="flex space-x-1">
                            <button
                              onClick={() => testConfigMutation.mutate(config._id)}
                              disabled={testConfigMutation.isPending}
                              className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                              title="Test Configuration"
                            >
                              <TestTube size={14} />
                            </button>
                            <button
                              onClick={() => handleEdit(config)}
                              className="p-1 text-gray-600 hover:text-gray-700 dark:hover:text-gray-300"
                              title="Edit Configuration"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => deleteConfigMutation.mutate(config._id)}
                              disabled={deleteConfigMutation.isPending}
                              className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                              title="Delete Configuration"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Host:</span>
                          <span className="text-gray-900 dark:text-white">{config.host}:{config.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Username:</span>
                          <span className="text-gray-900 dark:text-white">{config.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">From:</span>
                          <span className="text-gray-900 dark:text-white">{config.fromName} &lt;{config.fromEmail}&gt;</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <span className={`font-medium ${
                            config.isVerified ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {config.isVerified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                        {config.lastTested && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Last Tested:</span>
                            <span className="text-gray-900 dark:text-white">
                              {new Date(config.lastTested).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SMTPManager;