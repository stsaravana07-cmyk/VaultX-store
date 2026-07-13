import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Award, Key, X, ShieldAlert, Loader } from 'lucide-react';
import gsap from 'gsap';
import api from '../services/api';

const LoginPage = () => {
  const { login, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password recovery states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetIdentity, setResetIdentity] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [sendingResetOtp, setSendingResetOtp] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const containerRef = useRef(null);
  const cardRef = useRef(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  // Web swing animation with GSAP
  useEffect(() => {
    // Reset initial states
    gsap.set(containerRef.current, {
      transformOrigin: 'top center',
      y: -300,
      rotation: -35,
    });

    // Swing the container in
    gsap.to(containerRef.current, {
      y: 0,
      rotation: 0,
      duration: 3,
      ease: 'elastic.out(1.1, 0.45)',
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.message);
    }
  };

  const handleSendResetOtp = async () => {
    if (!resetIdentity) {
      setResetError('Email or Phone coordinate is required.');
      return;
    }
    setResetError('');
    setResetSuccess('');
    setSendingResetOtp(true);
    try {
      const response = await api.post('auth/password-reset/send-otp/', { identity: resetIdentity });
      setResetOtpSent(true);
      setResetSuccess(response.data.message || 'OTP verification code transmitted!');
    } catch (err) {
      setResetError(err.response?.data?.error || 'Failed to transmit reset OTP.');
    } finally {
      setSendingResetOtp(false);
    }
  };

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);
    try {
      await api.post('auth/password-reset/verify-otp/', {
        identity: resetIdentity,
        otp: resetOtp,
        new_password: resetPassword
      });
      setResetSuccess('Clearance approved. Access code updated.');
      addToast('Password updated successfully.', 'success');
      setTimeout(() => {
        setShowForgotModal(false);
        setResetIdentity('');
        setResetOtp('');
        setResetPassword('');
        setResetOtpSent(false);
      }, 2000);
    } catch (err) {
      setResetError(err.response?.data?.error || 'Verification failed. Invalid OTP.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-space-black overflow-hidden font-sans">
      
      {/* Custom Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none"
        style={{ 
          backgroundImage: `url('/login-bg.jpg')` 
        }}
      />
      
      {/* Cosmic background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Neon Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: ['105vh', '-10vh'],
            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
            opacity: [0, 0.7, 0]
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className="absolute w-[2px] h-[2px] bg-[#00f0ff] rounded-full shadow-[0_0_8px_#00f0ff] pointer-events-none z-0"
        />
      ))}

      {/* swinging anchor node */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-lg shadow-primary/50 z-20" />

      {/* Swinging Container */}
      <div 
        ref={containerRef} 
        className="relative flex flex-col items-center z-10 w-full max-w-md px-4"
        style={{ marginTop: '120px' }}
      >
        {/* Login Card with Pulse Glow */}
        <motion.div 
          ref={cardRef}
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.1)",
              "0 0 35px rgba(189, 0, 255, 0.4), 0 0 70px rgba(189, 0, 255, 0.15)",
              "0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.1)"
            ]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-full glassmorphic rounded-2xl p-8 border border-white/10 transition-shadow duration-500"
        >
          {/* Card Header and Tabs */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black font-display tracking-tight text-white mb-2 text-glow-cyan flex items-center justify-center gap-2">
              <Award className="text-primary animate-pulse" />
              HERO LOGIN
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Access the ultimate dashboard
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-950/40 border border-red-500/50 text-red-200 text-xs px-4 py-2.5 rounded-lg mb-4 text-center font-bold"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-bold">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Multiverse Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#00f0ff] transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="agent@vaultx.com"
                  className="w-full bg-space-black border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Access Code (Password)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#bd00ff] transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-space-black border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#bd00ff] focus:shadow-[0_0_15px_rgba(189,0,255,0.25)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Extra Options */}
            <div className="flex items-center justify-between text-xs mt-1">
              <label className="flex items-center text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 accent-primary"
                />
                Remember Me
              </label>
              <button 
                type="button"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer font-bold"
                onClick={() => {
                  setResetError('');
                  setResetSuccess('');
                  setResetOtpSent(false);
                  setShowForgotModal(true);
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-[#00d0e6] text-black font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 mt-6 cursor-pointer hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]"
            >
              {loading ? 'Establishing Link...' : 'Initiate Secure Login'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-900 pt-4">
            <p className="text-xs text-slate-400 font-bold mb-2">
              Unregistered Operative?
            </p>
            <button
              onClick={() => navigate('/register')}
              className="text-xs font-black text-[#00f0ff] hover:underline uppercase tracking-wider"
            >
              Request Clearance
            </button>
          </div>

        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#0f0e17] border border-[#ff6b0a]/30 p-6 rounded-2xl shadow-2xl relative"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 font-display">Credential Recovery</h3>
              <p className="text-xs text-slate-400 mb-6 font-bold">Transmit an access code to overwrite your password protocol.</p>

              {resetError && (
                <div className="bg-red-950/40 border border-red-500/50 text-red-200 text-xs px-4 py-2.5 rounded-lg mb-4 text-center font-bold">
                  {resetError}
                </div>
              )}

              {resetSuccess && (
                <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs px-4 py-2.5 rounded-lg mb-4 text-center font-bold">
                  {resetSuccess}
                </div>
              )}

              <form onSubmit={handleVerifyResetOtp} className="space-y-4 font-bold">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Identity Coordinates (Email or Phone)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      disabled={resetOtpSent}
                      value={resetIdentity}
                      onChange={(e) => setResetIdentity(e.target.value)}
                      placeholder="e.g. agent@vaultx.com or +919999999999"
                      className="flex-grow bg-space-black border border-slate-800 focus:border-[#ff6b0a] rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={sendingResetOtp || !resetIdentity}
                      onClick={handleSendResetOtp}
                      className="px-4 bg-[#ff6b0a] text-black font-bold text-xs uppercase rounded-xl transition-all cursor-pointer min-w-[100px] flex items-center justify-center"
                    >
                      {sendingResetOtp ? <Loader size={14} className="animate-spin" /> : resetOtpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {resetOtpSent && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        OTP Verification Code
                      </label>
                      <input
                        type="text"
                        required
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-full bg-space-black border border-slate-800 focus:border-[#ff6b0a] rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none font-mono tracking-widest text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        New Access Password
                      </label>
                      <input
                        type="password"
                        required
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-space-black border border-slate-800 focus:border-[#ff6b0a] rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full py-3 bg-[#ff6b0a] text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer mt-4 flex items-center justify-center"
                    >
                      {resetLoading ? 'Authorizing reset...' : 'Confirm Clearance Override'}
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
