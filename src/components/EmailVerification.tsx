import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-email?token=${token}`
        );
        
        const data = await response.json();
        
        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          
          // Auto-login user after verification
          if (data.token && data.user) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate, setUser, setToken]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center"
      >
        <div className="mb-6">
          {status === 'verifying' && (
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="text-white animate-spin" size={32} />
            </div>
          )}
          
          {status === 'success' && (
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-white" size={32} />
            </div>
          )}
          
          {status === 'error' && (
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-white" size={32} />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-4">
          {status === 'verifying' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {status === 'verifying' && 'Please wait while we verify your email address.'}
          {message}
        </p>

        {status === 'success' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
            <p className="text-green-800 dark:text-green-400 text-sm">
              You're being redirected to your dashboard...
            </p>
          </div>
        )}

        <div className="space-y-3">
          {status === 'success' && (
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Go to Dashboard
            </button>
          )}
          
          {status === 'error' && (
            <button
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Back to Login
            </button>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
            <Globe size={16} />
            <span className="text-sm">MarketingHub</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;