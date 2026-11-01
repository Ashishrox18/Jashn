import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export interface NoticeProps {
  type?: 'info' | 'warn' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Notice({
  type = 'info',
  title,
  children,
  className = '',
}: NoticeProps) {
  const styles = {
    info: {
      bg: 'bg-surface-2 border-border text-ink',
      icon: <Info className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />,
    },
    warn: {
      bg: 'bg-warn-soft border-warn/30 text-warn',
      icon: <AlertTriangle className="w-5 h-5 text-warn shrink-0" aria-hidden="true" />,
    },
    error: {
      bg: 'bg-danger-soft border-danger/30 text-danger',
      icon: <AlertCircle className="w-5 h-5 text-danger shrink-0" aria-hidden="true" />,
    },
    success: {
      bg: 'bg-ok-soft border-ok/30 text-ok',
      icon: <CheckCircle2 className="w-5 h-5 text-ok shrink-0" aria-hidden="true" />,
    },
  }[type];

  return (
    <div
      role={type === 'error' || type === 'warn' ? 'alert' : 'status'}
      className={`flex items-start gap-3 p-4 rounded-xl border ${styles.bg} ${className}`}
    >
      <div className="mt-0.5">{styles.icon}</div>
      <div className="text-sm md:text-base leading-relaxed">
        {title && <strong className="font-semibold block mb-0.5">{title}</strong>}
        {children}
      </div>
    </div>
  );
}

