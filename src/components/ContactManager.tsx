import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Trash2,
  TestTube
} from 'lucide-react';

interface ContactManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactManager: React.FC<ContactManagerProps> = ({ isOpen, onClose }) => {
  const [selectedList, setSelectedList] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  const queryClient = useQueryClient();

  // Fetch contact lists
  const { data: contactLists, isLoading } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contacts/lists`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    enabled: isOpen
  });

  // Fetch selected list details
  const { data: listDetails, isLoading: listLoading } = useQuery({
    queryKey: ['contact-list', selectedList?._id],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contacts/lists/${selectedList._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    enabled: !!selectedList
  });

  // Create contact list mutation
  const createListMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contacts/lists`, {
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
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      setShowCreateForm(false);
      setNewListName('');
      setNewListDescription('');
    }
  });

  // Validate contacts mutation
  const validateContactsMutation = useMutation({
    mutationFn: async (listId: string) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contacts/lists/${listId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ validateAll: false })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-list', selectedList?._id] });
    }
  });

  // Delete contact list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contacts/lists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      setSelectedList(null);
    }
  });

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    createListMutation.mutate({
      name: newListName,
      description: newListDescription
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'invalid':
        return <XCircle className="text-red-500" size={16} />;
      case 'risky':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      default:
        return <AlertTriangle className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'invalid':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'risky':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users size={24} />
              <h2 className="text-2xl font-bold font-display">Contact Manager</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>New List</span>
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

        <div className="flex h-[70vh]">
          {/* Sidebar - Contact Lists */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-600 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Search lists..."
                />
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                </div>
              ) : contactLists?.data?.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="text-gray-400 mx-auto mb-4" size={32} />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No contact lists yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contactLists?.data
                    ?.filter((list: any) => 
                      list.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    ?.map((list: any) => (
                    <div
                      key={list._id}
                      onClick={() => setSelectedList(list)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedList?._id === list._id
                          ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white">{list.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{list.description}</p>
                      <div className="flex items-center justify-between mt-3 text-xs">
                        <span className="text-gray-500">{list.totalContacts} contacts</span>
                        <div className="flex space-x-2">
                          <span className="text-green-600">{list.validContacts} valid</span>
                          <span className="text-red-600">{list.invalidContacts} invalid</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {showCreateForm ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create Contact List</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateList} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      List Name *
                    </label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter list name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter list description"
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createListMutation.isPending}
                      className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {createListMutation.isPending ? 'Creating...' : 'Create List'}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : selectedList ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedList.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedList.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => validateContactsMutation.mutate(selectedList._id)}
                      disabled={validateContactsMutation.isPending}
                      className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                    >
                      <TestTube size={16} />
                      <span>{validateContactsMutation.isPending ? 'Validating...' : 'Validate'}</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <Upload size={16} />
                      <span>Import</span>
                    </button>
                    <button
                      onClick={() => deleteListMutation.mutate(selectedList._id)}
                      disabled={deleteListMutation.isPending}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Contact List Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedList.totalContacts}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedList.validContacts}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valid</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{selectedList.invalidContacts}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Invalid</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {selectedList.totalContacts - selectedList.validContacts - selectedList.invalidContacts}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Unvalidated</p>
                  </div>
                </div>

                {/* Contacts Table */}
                {listLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-600">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Email</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Name</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Company</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listDetails?.data?.contacts?.map((contact: any, index: number) => (
                            <tr key={index} className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(contact.validationStatus)}
                                  <span className="text-gray-900 dark:text-white">{contact.email}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {`${contact.firstName} ${contact.lastName}`.trim() || '-'}
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {contact.company || '-'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.validationStatus)}`}>
                                  {contact.validationStatus || 'Unknown'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <div className="w-12 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        contact.validationScore >= 80 ? 'bg-green-500' : 
                                        contact.validationScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${contact.validationScore || 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {contact.validationScore || 0}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <Users className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a Contact List</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Choose a contact list from the sidebar to view and manage contacts.</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Plus className="inline mr-2" size={16} />
                    Create New List
                  </button>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
                    <TestTube className="inline mr-2" size={16} />
                    Lead Scraper
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactManager;