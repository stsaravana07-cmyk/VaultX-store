import React from 'react';
import { Shield } from 'lucide-react';

const AdminFooter = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-auto font-sans shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs font-bold">
        <div className="flex items-center gap-2">
          <Shield className="text-secondary w-5 h-5" />
          <span className="font-bold text-slate-650">HQ CONTROL CENTER</span>
        </div>
        <p className="text-center font-medium">
          &copy; {new Date().getFullYear()} Multiverse Superhero Store Inc. Restricted Access Console.
        </p>
        <p className="font-mono text-[10px] text-slate-650">
          SECURE PROTOCOL v4.3.0
        </p>
      </div>
    </footer>
  );
};

export default AdminFooter;
