import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Logo = ({ onClick, className = '' }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate('/home');
    }
  };

  return (
    <div 
      onClick={handleClick} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex items-center gap-[12px] cursor-pointer group ${className} perspective-1000`}
    >
      {/* Dynamic Aura Background */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1], 
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 90, 180, 270, 360]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute -left-4 top-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-tr from-[#FF6A00]/20 to-[#bd00ff]/20 rounded-full blur-[25px] pointer-events-none"
      />
      
      {/* Intense Hover Aura */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-24 h-24 bg-[#FF6A00]/30 rounded-full blur-[35px] pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      {/* Icon with Floating Animation */}
      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex items-center justify-center"
      >
        <motion.img 
          animate={isHovered ? { rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          src="/logo.png" 
          alt="VaultX Logo" 
          className="h-12 w-12 md:h-[55px] md:w-[55px] object-contain flex-shrink-0 drop-shadow-[0_0_10px_rgba(255,106,0,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(255,106,0,0.9)] transition-all duration-300"
        />
        {/* Flare inside icon */}
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, rotate: 45, scale: 0, x: -20, y: 20 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], x: 20, y: -20 }}
            transition={{ duration: 0.6 }}
            className="absolute w-12 h-1 bg-white shadow-[0_0_10px_#fff] blur-[1px] pointer-events-none z-20 mix-blend-overlay"
          />
        )}
      </motion.div>
      
      {/* Text Container */}
      <div className="flex items-center font-display font-black tracking-widest uppercase relative z-10 pt-1">
        
        {/* VAULT - Metallic Shine */}
        <div className="relative overflow-hidden group-hover:scale-105 transition-transform duration-300 origin-left">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 text-[26px] md:text-[34px] leading-none drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)] block">
            Vault
          </span>
          {/* Shine Sweep Effect */}
          <motion.div 
            animate={isHovered ? { left: ['-100%', '200%'] } : { left: '-100%' }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 skew-x-[-25deg]"
          />
        </div>
        
        {/* X - Neon Glitch / Pulse */}
        <motion.span 
          animate={isHovered ? {
            textShadow: [
              "0 0 20px #FF6A00, 0 0 40px #FF6A00, 0 0 60px #FF6A00, -2px -2px 0 #0ff, 2px 2px 0 #f0f",
              "0 0 10px #FF6A00, 0 0 20px #FF6A00, 0 0 30px #FF6A00, 2px 2px 0 #0ff, -2px -2px 0 #f0f",
              "0 0 30px #FF6A00, 0 0 50px #FF6A00, 0 0 80px #FF6A00, -2px 2px 0 #0ff, 2px -2px 0 #f0f",
              "0 0 20px #FF6A00, 0 0 40px #FF6A00, 0 0 60px #FF6A00, 0px 0px 0 transparent, 0px 0px 0 transparent"
            ],
            x: [0, -2, 2, -1, 1, 0],
            scale: 1.15
          } : {
            textShadow: "0 0 15px rgba(255, 106, 0, 0.6), 0 0 30px rgba(255, 106, 0, 0.3)",
            x: 0,
            scale: 1
          }}
          transition={{ duration: 0.4 }}
          className="text-[36px] md:text-[46px] leading-none ml-1 origin-bottom-left"
          style={{ color: '#FF6A00' }}
        >
          X
        </motion.span>
      </div>
    </div>
  );
};

export default Logo;
