import React, { createContext, useState, useContext } from 'react';
import { CheckCircle, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null, onCancel: null });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-dismiss toast
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({
      show: true,
      message,
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, show: false }));
        onConfirm();
      },
      onCancel: () => {
        setConfirmDialog((prev) => ({ ...prev, show: false }));
      }
    });
  };

  return (
    <ToastContext.Provider value={{ addToast, showConfirm }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="pointer-events-auto p-4 bg-slate-900/95 border border-slate-700/40 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md"
            >
              <div className={`p-1.5 rounded-xl flex-shrink-0 ${
                toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                toast.type === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              </div>
              <p className="flex-grow text-left text-xs font-black text-white leading-normal">{toast.message}</p>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer focus:outline-none"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Custom Confirm dialog modal for storefront */}
      <AnimatePresence>
        {confirmDialog.show && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/45 backdrop-blur-[3px] p-4 animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-6 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <ShieldAlert size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 font-mono">Action Authorization</h3>
                <p className="text-sm font-extrabold text-slate-800 leading-relaxed">{confirmDialog.message}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={confirmDialog.onCancel}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-black text-slate-700 uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-550 to-red-600 hover:shadow-lg text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
