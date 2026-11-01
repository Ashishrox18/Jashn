import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label: string;
  helperText?: string;
  variant?: 'primary' | 'accent' | 'ok' | 'warn' | 'danger';
  className?: string;
}

export function ProgressBar({
  value,
  label,
  helperText,
  variant = 'primary',
  className = '',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const colorClasses = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    ok: 'bg-ok',
    warn: 'bg-warn',
    danger: 'bg-danger',
  }[variant];

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1 text-sm font-medium">
        <span id={`progress-label-${label.replace(/\s+/g, '-').toLowerCase()}`} className="text-ink">
          {label}
        </span>
        {helperText && <span className="text-ink-muted">{helperText}</span>}
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby={`progress-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
        className="w-full h-3 bg-surface-2 rounded-full overflow-hidden border border-border"
      >
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${colorClasses}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

