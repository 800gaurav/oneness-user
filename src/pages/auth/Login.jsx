import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Cake, Mail, Phone, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [method, setMethod] = useState('email'); // 'email' | 'whatsapp'
  const [recipient, setRecipient] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const { sendOtp, verifyOtp, isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!recipient.trim()) {
      toast.error('Please enter your email or phone number');
      return;
    }

    setLoading(true);
    const payload = {
      recipient: recipient.trim(),
      type: method,
      action: 'login'
    };

    const res = await sendOtp(payload);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setCountdown(60); // 60 seconds cooldown
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the OTP code');
      return;
    }

    setLoading(true);
    const payload = {
      recipient: recipient.trim(),
      code: otp.trim(),
      action: 'login'
    };

    const res = await verifyOtp(payload);
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-surface))] to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-[rgb(var(--color-border))]"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[rgb(var(--color-pink))] to-[rgb(var(--color-accent))] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Cake className="w-8 h-8 text-[rgb(var(--color-brown))]" />
          </div>
          <h2 className="text-3xl font-bold text-[rgb(var(--color-brown))]">BakeryCRM</h2>
          <p className="text-[rgb(var(--color-text-secondary))] mt-2">Login with passwordless OTP</p>
        </div>

        {/* Method Toggle Buttons */}
        {!otpSent && (
          <div className="flex bg-[rgb(var(--color-surface))] p-1 rounded-xl mb-6 border border-[rgb(var(--color-border))]">
            <button
              type="button"
              onClick={() => { setMethod('email'); setRecipient(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                method === 'email'
                  ? 'bg-white text-[rgb(var(--color-brown))] shadow-sm'
                  : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email OTP
            </button>
            <button
              type="button"
              onClick={() => { setMethod('whatsapp'); setRecipient(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                method === 'whatsapp'
                  ? 'bg-white text-[rgb(var(--color-brown))] shadow-sm'
                  : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
              }`}
            >
              <Phone className="w-4 h-4" />
              WhatsApp OTP
            </button>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {method === 'email' ? 'Email Address' : 'WhatsApp Number (with country code, e.g. 919876543210)'}
              </label>
              <div className="relative">
                {method === 'email' ? (
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
                )}
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={method === 'email' ? 'your@email.com' : '919876543210'}
                  className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[rgb(var(--color-brown))] text-white rounded-xl font-medium hover:bg-[rgb(var(--color-light-brown))] transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4 text-center">
                We sent a 6-digit OTP to <br /><strong>{recipient}</strong> ({method === 'email' ? 'Email' : 'WhatsApp'}).
              </p>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">Enter 6-Digit OTP</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] tracking-[0.5em] text-center font-bold text-lg"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[rgb(var(--color-brown))] text-white rounded-xl font-medium hover:bg-[rgb(var(--color-light-brown))] transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={countdown > 0 || loading}
                className="text-[rgb(var(--color-brown))] font-medium hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
            
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtp(''); }}
                className="text-[rgb(var(--color-text-secondary))] hover:underline"
              >
                Change Email / Phone Number
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[rgb(var(--color-border))] text-center">
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[rgb(var(--color-brown))] font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
