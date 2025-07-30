import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Mail, 
  Server, 
  FileText, 
  Users, 
  Send, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Settings,
  Upload,
  Download,
  Eye,
  TestTube
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface CampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const CampaignWizard: React.FC<CampaignWizardProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    name: '',
    subject: '',
    smtpConfigId: '',
    templateId: '',
    contactListId: '',
    scheduleType: 'now',
    scheduledAt: '',
    customFromName: '',
    customFromEmail: ''
  });

  const steps = [
    { id: 1, title: 'SMTP Setup', icon: <Server size={20} />, required: true },
    { id: 2, title: 'Campaign Details', icon: <Mail size={20} />, required: true },
    { id: 3, title: 'Template Selection', icon: <FileText size={20} />, required: true },
    { id: 4, title: 'Contact Management', icon: <Users size={20} />, required: true },
    { id: 5, title: 'Review & Send', icon: <Send size={20} />, required: true }
  ];

  // Fetch SMTP configurations
  const { data: smtpConfigs, isLoading: smtpLoading } = useQuery({
    queryKey: ['smtp-configs'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/smtp/configs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    enabled: isOpen
  });

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/templates`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    enabled: isOpen
  });

  // Fetch contact lists
  const { data: contactLists, isLoading: contactsLoading } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contacts/lists`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    enabled: isOpen
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/campaigns/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        onClose();
        // Show success message
      }
    }
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createCampaignMutation.mutate(campaignData);
  };

  const isStepValid = (stepId: number) => {
    switch (stepId) {
      case 1:
        return campaignData.smtpConfigId !== '';
      case 2:
        return campaignData.name !== '' && campaignData.subject !== '';
      case 3:
        return campaignData.templateId !== '';
      case 4:
        return campaignData.contactListId !== '';
      case 5:
        return true;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

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
            <h2 className="text-2xl font-bold font-display">Create Email Campaign</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep === step.id
                    ? 'bg-white text-blue-600 border-white'
                    : currentStep > step.id
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-white/50 text-white/70'
                }`}>
                  {currentStep > step.id ? <Check size={16} /> : step.icon}
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-white' : 'text-white/70'
                  }`}>
                    Step {step.id}
                  </p>
                  <p className={`text-xs ${
                    currentStep >= step.id ? 'text-white' : 'text-white/50'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="mx-4 text-white/50" size={16} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {/* Step 1: SMTP Setup */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Server className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">SMTP Configuration</h3>
                  <p className="text-gray-600 dark:text-gray-400">Select your SMTP configuration to send emails</p>
                </div>

                {smtpLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : smtpConfigs?.data?.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="text-yellow-500 mx-auto mb-4" size={48} />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No SMTP Configuration Found</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">You need to configure SMTP settings before creating a campaign.</p>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
                      <Settings className="inline mr-2" size={16} />
                      Configure SMTP
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {smtpConfigs?.data?.map((config: any) => (
                      <div
                        key={config._id}
                        onClick={() => setCampaignData({ ...campaignData, smtpConfigId: config._id })}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          campaignData.smtpConfigId === config._id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{config.name}</h4>
                          {config.isVerified && <CheckCircle className="text-green-500" size={16} />}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{config.host}:{config.port}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{config.fromName} &lt;{config.fromEmail}&gt;</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Campaign Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Campaign Details</h3>
                  <p className="text-gray-600 dark:text-gray-400">Configure your campaign settings</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign Name</label>
                    <input
                      type="text"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter campaign name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Subject</label>
                    <input
                      type="text"
                      value={campaignData.subject}
                      onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom From Name (Optional)</label>
                    <input
                      type="text"
                      value={campaignData.customFromName}
                      onChange={(e) => setCampaignData({ ...campaignData, customFromName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Override default from name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom From Email (Optional)</label>
                    <input
                      type="email"
                      value={campaignData.customFromEmail}
                      onChange={(e) => setCampaignData({ ...campaignData, customFromEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Override default from email"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Template Selection */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-purple-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Template Selection</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose an email template for your campaign</p>
                </div>

                {templatesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates?.data?.map((template: any) => (
                      <div
                        key={template._id}
                        onClick={() => setCampaignData({ ...campaignData, templateId: template._id })}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          campaignData.templateId === template._id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                          <FileText className="text-gray-400" size={32} />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.subject}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            template.type === 'system' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {template.type === 'system' ? 'System' : 'Custom'}
                          </span>
                          <div className="flex space-x-1">
                            <button className="p-1 text-gray-400 hover:text-blue-600">
                              <Eye size={14} />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-green-600">
                              <Download size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Don't have a template?</p>
                  <div className="flex justify-center space-x-4">
                    <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30">
                      <Upload size={16} />
                      <span>Upload Template</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30">
                      <Download size={16} />
                      <span>Browse Templates</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Contact Management */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-orange-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contact Management</h3>
                  <p className="text-gray-600 dark:text-gray-400">Select your contact list for this campaign</p>
                </div>

                {contactsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  </div>
                ) : contactLists?.data?.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="text-gray-400 mx-auto mb-4" size={48} />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Contact Lists Found</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Create a contact list or use our lead generation tools.</p>
                    <div className="flex justify-center space-x-4">
                      <button className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors">
                        <Users className="inline mr-2" size={16} />
                        Create Contact List
                      </button>
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
                        <TestTube className="inline mr-2" size={16} />
                        Lead Scraper
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contactLists?.data?.map((list: any) => (
                      <div
                        key={list._id}
                        onClick={() => setCampaignData({ ...campaignData, contactListId: list._id })}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          campaignData.contactListId === list._id
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{list.name}</h4>
                          <span className="text-sm text-gray-500">{list.totalContacts} contacts</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{list.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-600">{list.validContacts} valid</span>
                          <span className="text-red-600">{list.invalidContacts} invalid</span>
                          <span className="text-gray-500">Updated {new Date(list.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: Review & Send */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review & Send</h3>
                  <p className="text-gray-600 dark:text-gray-400">Review your campaign settings and choose when to send</p>
                </div>

                {/* Campaign Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Campaign Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Campaign Name:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{campaignData.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{campaignData.subject}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">SMTP Config:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {smtpConfigs?.data?.find((c: any) => c._id === campaignData.smtpConfigId)?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Template:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {templates?.data?.find((t: any) => t._id === campaignData.templateId)?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Contact List:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {contactLists?.data?.find((l: any) => l._id === campaignData.contactListId)?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Recipients:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {contactLists?.data?.find((l: any) => l._id === campaignData.contactListId)?.validContacts || 0} contacts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Schedule Options */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Send Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setCampaignData({ ...campaignData, scheduleType: 'now' })}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        campaignData.scheduleType === 'now'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Send className="text-green-600" size={20} />
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">Send Now</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Start sending immediately</p>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => setCampaignData({ ...campaignData, scheduleType: 'scheduled' })}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        campaignData.scheduleType === 'scheduled'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="text-blue-600" size={20} />
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">Schedule</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Send at a specific time</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {campaignData.scheduleType === 'scheduled' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule Date</label>
                        <input
                          type="datetime-local"
                          value={campaignData.scheduledAt}
                          onChange={(e) => setCampaignData({ ...campaignData, scheduledAt: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === step.id
                    ? 'bg-blue-600 w-8'
                    : currentStep > step.id
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed || createCampaignMutation.isPending}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createCampaignMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>{campaignData.scheduleType === 'now' ? 'Send Now' : 'Schedule Campaign'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CampaignWizard;