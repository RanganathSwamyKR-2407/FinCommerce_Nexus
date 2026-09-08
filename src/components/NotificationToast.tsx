import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCart } from '../context/CartContext.js';

export const NotificationToast: React.FC = () => {
  const { toast, closeToast } = useCart();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="flex items-center space-x-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 max-w-sm">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0" aria-hidden="true" />}
        <p className="text-xs font-medium flex-1 text-slate-100">{toast.message}</p>
        <button
          onClick={closeToast}
          aria-label="Dismiss notification"
          className="text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded p-0.5"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
