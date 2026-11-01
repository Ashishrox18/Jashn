import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'surface' | 'surface-2';
}

export function Card({
  children,
  variant = 'surface',
  className = '',
  ...props
}: CardProps) {
  const bgClass = variant === 'surface' ? 'bg-surface' : 'bg-surface-2';

  return (
    <div
      className={`${bgClass} border border-border rounded-xl p-5 md:p-6 transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

