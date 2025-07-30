import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowLeft, 
  Lock,
  Star,
  Clock,
  Users,
  Mail,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const planId = searchParams.get('plan') || 'starter';
  const billingCycle = searchParams.get('billing') || 'monthly';

  const plans = {
    starter: {
      name: 'Starter',
      price: { monthly: 2465, yearly: 24650 },
      originalPrice: { monthly: 29, yearly: 290 },
      features: [
        '5,000 emails per month',
        '1 email account',
        'Basic templates',
        'Email validation',
        'Basic analytics',
        'Email support'
      ],
      popular: false
    },
    professional: {
      name: 'Professional',
      price: { monthly: 6715, yearly: 67150 },
      originalPrice: { monthly: 79, yearly: 790 },
      features: [
        '25,000 emails per month',
        '5 email accounts',
        'Premium templates',
        'Advanced validation',
        'Advanced analytics',
        'WhatsApp integration',
        'Lead scraper',
        'Priority support'
      ],
      popular: true
    },
    enterprise: {
      name: 'Enterprise',
      price: { monthly: 16915, yearly: 169150 },
      originalPrice: { monthly: 199, yearly: 1990 },
      features: [
        'Unlimited emails',
        'Unlimited accounts',
        'Custom templates',
        'Advanced validation',
        'Enterprise analytics',
        'WhatsApp integration',
        'Advanced scraper',
        'Custom branding',
        'API access',
        '24/7 support'
      ],
      popular: false
    }
  };

  const selectedPlan = plans[planId as keyof typeof plans];
  const price = selectedPlan.price[billingCycle as keyof typeof selectedPlan.price];
  const originalPrice = selectedPlan.originalPrice[billingCycle as keyof typeof selectedPlan.originalPrice];
  const savings = billingCycle === 'yearly' ? Math.round(((selectedPlan.price.monthly * 12) - selectedPlan.price.yearly) / 100) : 0;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create payment order
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId,
          billingCycle
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Initialize Cashfree payment
        const cashfree = window.Cashfree({
          mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        });

        const checkoutOptions = {
          paymentSessionId: data.data.paymentSessionId,
          redirectTarget: '_self'
        };

        cashfree.checkout(checkoutOptions).then(() => {
          console.log('Payment initiated');
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => navigate('/plans')}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={16} />
            <span>Back to Plans</span>
          </button>
          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Secure checkout powered by Cashfree
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">
              Order Summary
            </h2>

            {/* Plan Details */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedPlan.name} Plan
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">
                    {billingCycle} billing
                  </p>
                </div>
                {selectedPlan.popular && (
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    {selectedPlan.name} ({billingCycle})
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    ₹{price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
                  <span className="text-gray-900 dark:text-white font-medium">₹5</span>
                </div>
                {billingCycle === 'yearly' && savings > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-600">Yearly Discount</span>
                    <span className="text-green-600 font-medium">-₹{savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{(price + 5).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Originally ${originalPrice} USD
                  </p>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="text-green-600" size={20} />
                <span className="font-semibold text-green-800 dark:text-green-400">
                  Secure Payment
                </span>
              </div>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• 256-bit SSL encryption</li>
                <li>• PCI DSS compliant</li>
                <li>• Powered by Cashfree</li>
                <li>• 30-day money-back guarantee</li>
              </ul>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">
              Payment Details
            </h2>

            {/* User Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Billing Information</h3>
              <p className="text-gray-700 dark:text-gray-300">{user?.name}</p>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h3>
              <div className="grid grid-cols-1 gap-3">
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="text-blue-600" size={20} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Credit/Debit Card</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Visa, Mastercard, RuPay</p>
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Zap className="text-purple-600" size={20} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">UPI</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">PhonePe, Google Pay, Paytm</p>
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="text-green-600" size={20} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Net Banking</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">All major banks supported</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trial Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="text-blue-600" size={20} />
                <span className="font-semibold text-blue-800 dark:text-blue-400">
                  Trial Information
                </span>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Your 3-day trial will end after purchase. You'll get immediate access to all {selectedPlan.name} features.
              </p>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Lock size={20} />
                  <span>Pay ₹{(price + 5).toLocaleString()} Securely</span>
                </div>
              )}
            </button>

            {/* Trust Indicators */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Shield size={14} />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star size={14} />
                  <span>PCI Compliant</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle size={14} />
                  <span>Money Back Guarantee</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Powered by Cashfree • Trusted by 500,000+ businesses
              </p>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, you can cancel your subscription at any time. No long-term commitments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is my payment secure?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Absolutely. We use Cashfree's secure payment gateway with 256-bit SSL encryption.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                What happens after trial?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your trial ends immediately and you get full access to all plan features.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I upgrade later?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, you can upgrade or downgrade your plan at any time from your dashboard.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cashfree Script */}
      <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
    </div>
  );
};

export default CheckoutPage;