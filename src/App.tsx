import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EmailSender from './components/EmailSender';
import GmailSender from './components/GmailSender';
import WhatsAppSender from './components/WhatsAppSender';
import MailScraper from './components/MailScraper';
import EmailValidation from './components/EmailValidation';
import Accounts from './components/Accounts';
import Settings from './components/Settings';
import Login from './components/Login';
import Register from './components/Register';
import EmailVerification from './components/EmailVerification';
import Plans from './components/Plans';
import CheckoutPage from './components/CheckoutPage';
import EmailTrackingDashboard from './components/EmailTrackingDashboard';
import AdminDashboard from './components/AdminDashboard';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="*" element={
            authMode === 'login' ? (
              <Login onToggleMode={() => setAuthMode('register')} />
            ) : (
              <Register onSwitchToLogin={() => setAuthMode('login')} />
            )
          } />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/email-sender" element={<EmailSender />} />
              <Route path="/gmail-sender" element={<GmailSender />} />
              <Route path="/whatsapp-sender" element={<WhatsAppSender />} />
              <Route path="/mail-scraper" element={<MailScraper />} />
              <Route path="/email-validation" element={<EmailValidation />} />
              <Route path="/email-tracking" element={<EmailTrackingDashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              {user.role === 'admin' && (
                <Route path="/admin" element={<AdminDashboard />} />
              )}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;