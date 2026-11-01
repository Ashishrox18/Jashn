import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface CountdownRingProps {
  days: number;
  phaseName: string;
  className?: string;
}

export function CountdownRing({ days, phaseName, className = '' }: CountdownRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const radius = 64;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  // Visual progress: map 0 to 180 days (or more) into a circle percentage
  // E.g., at 0 days (event day), ring is 100% full; at 180+ days, ring is 5%
  const maxDays = 180;
  const progressRatio = Math.max(0, Math.min(1, (maxDays - Math.max(0, days)) / maxDays));
  const strokeDashoffset = circumference - progressRatio * circumference;

  const displayDays = days < 0 ? 0 : days;
  const labelText = days < 0 ? 'Event concluded' : days === 0 ? 'Event Day!' : `${days} Days to go`;

  return (
    <div
      role="img"
      aria-label={`Event countdown: ${labelText}, current phase: ${phaseName}`}
      className={`relative inline-flex flex-col items-center justify-center p-4 ${className}`}
    >
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="text-surface-2 stroke-current"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated or instant progress stroke */}
          {shouldReduceMotion ? (
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="text-primary stroke-current"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          ) : (
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              className="text-primary stroke-current"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
              fill="transparent"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="text-3xl md:text-4xl font-extrabold font-heading text-ink leading-tight">
            {displayDays}
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
            {days === 1 ? 'Day' : 'Days'}
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-accent-soft px-3 py-1 rounded-full border border-accent/20">
          {phaseName}
        </span>
      </div>
    </div>
  );
}

