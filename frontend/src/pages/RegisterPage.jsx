import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Award, Eye, EyeOff, Key, Loader } from 'lucide-react';
import api from '../services/api';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter a valid Multiverse email address to receive OTP verification.');
      return;
    }
    setError('');
    setSendingOtp(true);
    setSuccess('');
    try {
      const response = await api.post('auth/otp/send/', { email });
      setOtpSent(true);
      setSuccess(response.data.message || 'OTP verification code sent to your email!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp) {
      setError('OTP verification code is required to complete enlistment.');
      return;
    }

    setLoading(true);

    const result = await register(
      email,
      username,
      password,
      phone,
      otp,
      isAdmin
    );
    setLoading(false);

    if (result.success) {
      setSuccess('Enlistment successful! Welcome email transmitted. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-space-black overflow-y-auto py-12 px-4 font-sans">
      <div 
        className="absolute inset-0 bg-cover bg-bottom opacity-15 pointer-events-none"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600')` 
        }}
      />
      
      {/* Background glow effects */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Registration Card */}
        <div className="w-full glassmorphic rounded-2xl p-8 border border-primary/20 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black font-display tracking-tight text-white mb-2 text-glow-cyan flex items-center justify-center gap-2">
              <Award className="text-primary animate-pulse" />
              JOIN THE ACADEMY
            </h2>
            <p className="text-xs text-slate-400">
              Enlist as a new superhero defender or dashboard admin
            </p>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-500/50 text-red-200 text-xs px-4 py-2.5 rounded-lg mb-4 text-center font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs px-4 py-2.5 rounded-lg mb-4 text-center font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Codename / Username */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Codename / Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="SpiderHero"
                  className="w-full bg-space-black/50 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Multiverse Email with Send OTP */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Multiverse Email
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hero@universe.com"
                    className="w-full bg-space-black/50 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !email}
                  className="px-4 bg-primary hover:bg-[#00d0e6] disabled:bg-slate-800 text-black disabled:text-slate-600 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center min-w-[100px]"
                >
                  {sendingOtp ? <Loader size={14} className="animate-spin" /> : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>
            </div>

            {/* Access Code / Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Access Code / Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-space-black/50 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Comm Frequency / Phone (Formality) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Comm Frequency / Phone
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 99999 99999"
                  className="w-full bg-space-black/50 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {/* OTP Code Input */}
            {otpSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1"
              >
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email OTP Verification Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Key size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-space-black/50 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none font-mono tracking-widest text-center"
                  />
                </div>
              </motion.div>
            )}

            {/* Admin Enlist Option */}
            <div className="flex items-center gap-2 p-3 bg-space-dark/60 rounded-xl border border-slate-800/80">
              <input
                type="checkbox"
                id="admin-check"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-4 h-4 rounded text-secondary focus:ring-secondary/50 bg-space-black border-slate-700"
              />
              <label htmlFor="admin-check" className="text-xs font-bold text-slate-300 cursor-pointer">
                Enlist as Administrator (For Dashboard Management)
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (otpSent && !otp)}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-neon-blue text-black font-bold tracking-wide rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing Enlistment...
                </div>
              ) : (
                'Submit Enlistment Details'
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-slate-400">
            Already enlisted?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-bold hover:underline transition-colors ml-1"
            >
              Access Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
