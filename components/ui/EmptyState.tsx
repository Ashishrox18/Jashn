import React from 'react';
import { CalendarHeart } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border-2 border-dashed border-border bg-surface-2/40 max-w-xl mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center text-accent mb-4">
        {icon || <CalendarHeart className="w-8 h-8" aria-hidden="true" />}
      </div>
      <h3 className="text-xl md:text-2xl font-bold font-heading text-ink mb-2">
        {title}
      </h3>
      <p className="text-ink-muted text-sm md:text-base max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

