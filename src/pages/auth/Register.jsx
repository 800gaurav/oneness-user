import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnimatedPage from '../../components/ui/AnimatedPage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Building, User, Mail, Phone, ShieldCheck, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [method, setMethod] = useState('email'); // 'email' | 'whatsapp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    address: ''
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuth();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    const recipient = method === 'email' ? formData.email.trim() : formData.phone.trim();
    if (!recipient) {
      toast.error(`Please enter your ${method === 'email' ? 'email address' : 'WhatsApp number'}`);
      return;
    }

    setLoading(true);
    const payload = {
      recipient,
      type: method,
      action: 'register'
    };

    const res = await sendOtp(payload);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setCountdown(60);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the OTP verification code');
      return;
    }

    const recipient = method === 'email' ? formData.email.trim() : formData.phone.trim();

    setLoading(true);
    const payload = {
      recipient,
      code: otp.trim(),
      action: 'register',
      additionalData: {
        name: formData.name.trim(),
        bakeryName: formData.businessName.trim() || 'My Bakery',
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined
      }
    };

    const res = await verifyOtp(payload);
    setLoading(false);

    if (res.success) {
      navigate('/login');
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="text-center mb-8">
            <Building className="mx-auto text-indigo-600 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">Create Account</h2>
            <p className="text-gray-600 dark:text-gray-400">Join MaterialCRM today using passwordless OTP</p>
          </div>

          {/* Verification Method Toggle */}
          {!otpSent && (
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  method === 'email'
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Mail className="w-4 h-4" />
                Verify via Email
              </button>
              <button
                type="button"
                onClick={() => setMethod('whatsapp')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  method === 'whatsapp'
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Phone className="w-4 h-4" />
                Verify via WhatsApp
              </button>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              {method === 'email' ? (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white disabled:opacity-50"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">WhatsApp Number (e.g. 919876543210)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="919876543210"
                      className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white disabled:opacity-50"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Collect optional but useful bakery details */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Bakery Name (Business Name)</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="My Bakery"
                    className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Send Verification OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                  We sent a 6-digit verification code to <br />
                  <strong>{method === 'email' ? formData.email : formData.phone}</strong>.
                </p>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 text-center font-medium">Enter 6-Digit OTP</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white disabled:opacity-50 tracking-[0.5em] text-center font-bold text-lg"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Verify & Register'}
              </button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={countdown > 0 || loading}
                  className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(''); }}
                  className="text-gray-500 dark:text-gray-400 hover:underline"
                >
                  Change Account Details
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}