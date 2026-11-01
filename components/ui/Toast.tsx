'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container with polite live region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2"
      >
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-ok text-white',
            error: 'bg-danger text-white',
            info: 'bg-surface text-ink border border-border shadow-md',
          }[toast.type];

          const Icon = {
            success: CheckCircle2,
            error: AlertCircle,
            info: Info,
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`flex items-center justify-between gap-3 p-3.5 rounded-lg text-sm font-medium shadow-lg pointer-events-auto transition-all ${typeStyles}`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="p-1 rounded hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
    };
  }
  return context;
}
