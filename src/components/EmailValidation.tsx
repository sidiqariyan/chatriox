import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Upload, CheckCircle, XCircle, AlertTriangle, Download, Eye } from 'lucide-react';

const EmailValidation: React.FC = () => {
  const [singleEmail, setSingleEmail] = useState('');
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const handleSingleValidation = async () => {
    if (!singleEmail) return;
    
    setIsValidating(true);
    // Simulate validation
    setTimeout(() => {
      const result = {
        email: singleEmail,
        status: Math.random() > 0.3 ? 'valid' : Math.random() > 0.5 ? 'invalid' : 'risky',
        reason: 'Deliverable',
        score: Math.floor(Math.random() * 100)
      };
      setValidationResults([result, ...validationResults]);
      setSingleEmail('');
      setIsValidating(false);
    }, 1500);
  };

  const validationStats = {
    total: 1247,
    valid: 1087,
    invalid: 98,
    risky: 37,
    unknown: 25
  };

  const sampleResults = [
    { email: 'john@example.com', status: 'valid', reason: 'Deliverable', score: 95 },
    { email: 'invalid@fake.com', status: 'invalid', reason: 'Domain not found', score: 15 },
    { email: 'risky@tempmail.com', status: 'risky', reason: 'Temporary email', score: 45 },
    { email: 'test@gmail.com', status: 'valid', reason: 'Deliverable', score: 92 },
    { email: 'bounce@domain.com', status: 'invalid', reason: 'Mailbox full', score: 20 },
  ];

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

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Email Validation</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Validate email addresses to improve deliverability.</p>
        </div>
        <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg">
          <Shield className="inline mr-2" size={16} />
          Validate Emails
        </button>
      </motion.div>

      {/* Validation Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{validationStats.total.toLocaleString()}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{Math.round((validationStats.valid / validationStats.total) * 100)}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Valid</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{Math.round((validationStats.invalid / validationStats.total) * 100)}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Invalid</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{Math.round((validationStats.risky / validationStats.total) * 100)}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Risky</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{Math.round((validationStats.unknown / validationStats.total) * 100)}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Unknown</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Email Validation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Single Email Validation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input 
                type="email" 
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="test@example.com"
                onKeyPress={(e) => e.key === 'Enter' && handleSingleValidation()}
              />
            </div>
            <button 
              onClick={handleSingleValidation}
              disabled={!singleEmail || isValidating}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Validating...' : 'Validate Email'}
            </button>
          </div>
        </motion.div>

        {/* Bulk Validation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-6">Bulk Validation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload CSV File</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop your CSV file here</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">or click to browse (Max 10MB)</p>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-colors">
                  Choose File
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-1">• CSV format: email,name (optional)</p>
              <p className="mb-1">• Maximum 10,000 emails per file</p>
              <p>• Processing time: ~1 second per email</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Validation Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white">Validation Results</h3>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200">
              <Eye size={16} />
              <span>View Details</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200">
              <Download size={16} />
              <span>Export Results</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Reason</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...validationResults, ...sampleResults].map((result, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium text-gray-900 dark:text-white">{result.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(result.status)}`}>
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{result.reason}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            result.score >= 80 ? 'bg-green-500' : 
                            result.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${result.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{result.score}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailValidation;