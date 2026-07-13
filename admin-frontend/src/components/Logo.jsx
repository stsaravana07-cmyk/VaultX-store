import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Logo = ({ onClick, className = '' }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <motion.div 
      onClick={handleClick} 
      className={`relative flex items-center gap-[14px] cursor-pointer group transition-transform duration-300 ${className}`}
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      {/* Thunder / Glow background effect behind the icon */}
      <motion.div 
        className="absolute -left-2 -top-2 w-16 h-16 bg-[#FF6A00] rounded-full blur-[35px] pointer-events-none"
        variants={{
          rest: { opacity: 0, scale: 0.8 },
          hover: { opacity: 0.6, scale: 1.5, transition: { duration: 0.3 } }
        }}
      />

      {/* Icon - Perfectly proportional and square */}
      <motion.img 
        variants={{
          rest: { filter: "drop-shadow(0px 0px 5px rgba(255,106,0,0.2))", scale: 1 },
          hover: { filter: "drop-shadow(0px 0px 25px rgba(255,106,0,1))", scale: 1.05 }
        }}
        transition={{ duration: 0.3 }}
        src="/logo.png" 
        alt="VaultX Admin Logo" 
        className="h-12 w-12 md:h-[60px] md:w-[60px] object-contain flex-shrink-0 relative z-10"
      />
      
      {/* Text Container */}
      <div className="flex items-center font-display font-black tracking-widest uppercase relative z-10">
        {/* VAULT - White with light premium shadow */}
        <motion.span 
          variants={{
            rest: { textShadow: "0 2px 10px rgba(0,0,0,0.1)" },
            hover: { textShadow: "0 0 20px rgba(0,0,0,0.5)" }
          }}
          transition={{ duration: 0.3 }}
          className="text-slate-800 text-2xl md:text-[32px] leading-none"
        >
          Vault
        </motion.span>
        
        {/* X - Bright Orange (#FF6A00) with subtle glow */}
        <motion.span 
          variants={{
            rest: { textShadow: "0 0 15px rgba(255, 106, 0, 0.6)", scale: 1 },
            hover: { textShadow: "0 0 35px rgba(255, 106, 0, 1), 0 0 15px rgba(255, 106, 0, 0.8)", scale: 1.1 }
          }}
          transition={{ duration: 0.3 }}
          className="text-[32px] md:text-[42px] leading-none ml-1"
          style={{ color: '#FF6A00' }}
        >
          X
        </motion.span>
      </div>
    </motion.div>
  );
};

export default Logo;
