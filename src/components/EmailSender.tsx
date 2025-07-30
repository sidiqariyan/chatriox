import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Save, Users, Calendar, Image, Paperclip, Eye, Settings, FileText, TestTube } from 'lucide-react';
import CampaignWizard from './CampaignWizard';
import SMTPManager from './SMTPManager';
import TemplateManager from './TemplateManager';
import ContactManager from './ContactManager';

const EmailSender: React.FC = () => {
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);
  const [showSMTPManager, setShowSMTPManager] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showContactManager, setShowContactManager] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Email Campaign System</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Complete email marketing solution with SMTP, templates, and contact management.</p>
          </div>
          <button 
            onClick={() => setShowCampaignWizard(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <Mail className="inline mr-2" size={16} />
            Create Campaign
          </button>
        </motion.div>

        {/* Quick Setup Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Step 1: SMTP Configuration */}
          <div 
            onClick={() => setShowSMTPManager(true)}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="text-blue-600" size={24} />
              </div>
              <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full font-medium">
                Required First
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">SMTP Setup</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Configure your SMTP server settings to send emails</p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <span>Configure SMTP</span>
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Step 2: Template Management */}
          <div 
            onClick={() => setShowTemplateManager(true)}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="text-purple-600" size={24} />
              </div>
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                Ready
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Templates</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Browse, create, and manage email templates</p>
            <div className="flex items-center text-purple-600 text-sm font-medium">
              <span>Manage Templates</span>
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Step 3: Contact Management */}
          <div 
            onClick={() => setShowContactManager(true)}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="text-green-600" size={24} />
              </div>
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                Ready
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contacts</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Manage contact lists and validate email addresses</p>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <span>Manage Contacts</span>
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Step 4: Lead Generation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TestTube className="text-orange-600" size={24} />
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                Optional
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lead Scraper</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Extract email addresses from websites</p>
            <div className="flex items-center text-orange-600 text-sm font-medium">
              <span>Start Scraping</span>
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Campaign Workflow Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-xl font-semibold font-display text-gray-900 dark:text-white mb-6">Campaign Creation Workflow</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: 1, title: 'SMTP Setup', desc: 'Configure email server', required: true },
              { step: 2, title: 'Campaign Details', desc: 'Set subject & sender info', required: true },
              { step: 3, title: 'Template Selection', desc: 'Choose email template', required: true },
              { step: 4, title: 'Contact Management', desc: 'Select recipient list', required: true },
              { step: 5, title: 'Review & Send', desc: 'Send now or schedule', required: true }
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  item.required ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' : 'bg-gray-100 text-gray-600 dark:bg-gray-700'
                }`}>
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                {item.required && (
                  <span className="inline-block mt-2 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full">
                    Required
                  </span>
                )}
                {index < 4 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gray-200 dark:bg-gray-600 transform translate-x-2"></div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-2xl p-6"
        >
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ready to Create Your First Campaign?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Follow our step-by-step wizard to create professional email campaigns</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setShowCampaignWizard(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-medium"
              >
                <Mail className="inline mr-2" size={16} />
                Start Campaign Wizard
              </button>
              <button 
                onClick={() => setShowSMTPManager(true)}
                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600 font-medium"
              >
                <Settings className="inline mr-2" size={16} />
                Configure SMTP First
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <CampaignWizard 
        isOpen={showCampaignWizard} 
        onClose={() => setShowCampaignWizard(false)} 
      />
      <SMTPManager 
        isOpen={showSMTPManager} 
        onClose={() => setShowSMTPManager(false)} 
      />
      <TemplateManager 
        isOpen={showTemplateManager} 
        onClose={() => setShowTemplateManager(false)} 
      />
      <ContactManager 
        isOpen={showContactManager} 
        onClose={() => setShowContactManager(false)} 
      />
    </>
  );
};

export default EmailSender;