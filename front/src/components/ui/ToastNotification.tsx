import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

export function showToast(message: string, type: ToastType = 'info') {
  window.dispatchEvent(
    new CustomEvent('aurea_toast', {
      detail: { message, type },
    })
  );
}

export const ToastNotification: React.FC = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ message: string; type: ToastType }>;
      const id = Date.now();
      const newToast: ToastState = {
        id,
        message: custom.detail.message,
        type: custom.detail.type,
      };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    };

    window.addEventListener('aurea_toast', handler);
    return () => window.removeEventListener('aurea_toast', handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xl';
        let iconColor = 'text-amber-600 dark:text-amber-400';
        let Icon = AlertTriangle;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xl';
          iconColor = 'text-emerald-600 dark:text-emerald-400';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xl';
          iconColor = 'text-rose-600 dark:text-rose-400';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            data-testid="toast-message"
            data-toast-type={toast.type}
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border transition-all ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-xs leading-relaxed font-medium">
              {toast.message}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
