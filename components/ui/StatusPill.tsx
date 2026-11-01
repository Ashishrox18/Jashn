import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  Check,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { LineStatus } from '@/lib/engines/budget';
import { VendorStatus } from '@/types';

export interface StatusPillProps {
  type: 'budget' | 'vendor' | 'priority' | 'custom';
  status?: LineStatus | VendorStatus | 'high' | 'medium' | 'low';
  label?: string;
  className?: string;
}

export function StatusPill({ type, status, label, className = '' }: StatusPillProps) {
  if (type === 'budget') {
    switch (status) {
      case 'ok':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-ok-soft text-ok border border-ok/20 ${className}`}>
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{label || 'On track'}</span>
          </span>
        );
      case 'warning':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warn-soft text-warn border border-warn/20 ${className}`}>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{label || 'Near limit'}</span>
          </span>
        );
      case 'over':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-soft text-danger border border-danger/20 ${className}`}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{label || 'Over budget'}</span>
          </span>
        );
    }
  }

  if (type === 'priority') {
    switch (status) {
      case 'high':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-danger-soft text-danger border border-danger/20 ${className}`}>
            <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>High</span>
          </span>
        );
      case 'medium':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warn-soft text-warn border border-warn/20 ${className}`}>
            <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>Medium</span>
          </span>
        );
      case 'low':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-2 text-ink-muted border border-border ${className}`}>
            <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>Low</span>
          </span>
        );
    }
  }

  if (type === 'vendor') {
    switch (status) {
      case 'booked':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-ok-soft text-ok border border-ok/20 ${className}`}>
            <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Booked</span>
          </span>
        );
      case 'quoted':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-soft text-accent border border-accent/20 ${className}`}>
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Quote received</span>
          </span>
        );
      case 'contacted':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warn-soft text-warn border border-warn/20 ${className}`}>
            <HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Contacted</span>
          </span>
        );
      case 'dropped':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-2 text-ink-muted border border-border ${className}`}>
            <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Dropped</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-2 text-ink-muted border border-border ${className}`}>
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>To contact</span>
          </span>
        );
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-2 text-ink border border-border ${className}`}>
      <span>{label}</span>
    </span>
  );
}

