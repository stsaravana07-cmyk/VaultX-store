import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ShieldAlert } from 'lucide-react';
import gsap from 'gsap';

const AdminLoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const containerRef = useRef(null);
  const ropeRef = useRef(null);
  const cardRef = useRef(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Web rope swing animation with GSAP
  useEffect(() => {
    // Reset initial states
    gsap.set(containerRef.current, {
      transformOrigin: 'top center',
      y: -300,
      rotation: -35,
    });
    gsap.set(ropeRef.current, {
      strokeDasharray: 1000,
      strokeDashoffset: 1000,
    });

    // Animate rope shooting down
    gsap.to(ropeRef.current, {
      strokeDashoffset: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        // Swing the container in
        gsap.to(containerRef.current, {
          y: 0,
          rotation: 0,
          duration: 3,
          ease: 'elastic.out(1.1, 0.45)',
        });
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#faf9ff] to-[#f4f3ff] overflow-hidden font-sans">
      {/* Dynamic Night City Silhouette Background */}
      <div 
        className="absolute inset-0 bg-cover bg-bottom opacity-20 pointer-events-none mix-blend-multiply"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600')` 
        }}
      />
      
      {/* Cosmic background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-[120px] pointer-events-none" />

      {/* swinging anchor node */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-secondary rounded-full shadow-lg shadow-secondary/50 z-20" />

      {/* Swinging Container */}
      <div 
        ref={containerRef} 
        className="relative flex flex-col items-center z-10 w-full max-w-md px-4"
        style={{ marginTop: '120px' }}
      >
        {/* SVG Web Rope */}
        <svg 
          className="absolute overflow-visible pointer-events-none"
          style={{ top: '-130px', left: '50%', transform: 'translateX(-50%)', width: '2px', height: '140px' }}
        >
          <path 
            ref={ropeRef}
            d="M 1 0 L 1 140" 
            stroke="#bd00ff" 
            strokeWidth="3" 
            fill="none"
            className="drop-shadow-[0_0_8px_rgba(189,0,255,0.8)]"
          />
        </svg>

        {/* Login Card */}
        <div 
          ref={cardRef}
          className="w-full bg-white/80 border border-slate-200 shadow-2xl rounded-2xl p-8 transition-shadow duration-500 backdrop-blur-md"
        >
          {/* Card Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black font-display tracking-tight text-slate-800 mb-2 flex items-center justify-center gap-2">
              <ShieldAlert className="text-secondary animate-pulse" />
              HQ ACCESS CONTROL
            </h2>
            <p className="text-xs text-slate-500 font-bold">
              Enter administrator decryption credentials
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 text-red-650 text-xs px-4 py-2.5 rounded-lg mb-4 text-center font-bold"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@universe.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Access Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-3 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold tracking-wide transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-secondary to-pink-600 text-white shadow-lg shadow-secondary/20 hover:shadow-secondary/40"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Authenticating admin...
                </div>
              ) : (
                'Decrypt Console Access'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
