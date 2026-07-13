import React from 'react';
import { Award } from 'lucide-react';

const AnimatedLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-space-black font-sans">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute w-24 h-24 rounded-full border-4 border-primary/20 animate-ping" />
        {/* Rotating dash ring */}
        <div className="w-20 h-20 rounded-full border-2 border-t-primary border-r-secondary border-b-accent-gold border-l-transparent animate-spin" />
        
        {/* Center icon */}
        <div className="absolute">
          <Award className="text-white text-glow-cyan animate-pulse w-8 h-8" />
        </div>
      </div>
      <p className="mt-6 text-sm font-bold text-slate-450 tracking-widest uppercase animate-pulse">
        Establishing Secure Comm-link...
      </p>
    </div>
  );
};

export default AnimatedLoader;
