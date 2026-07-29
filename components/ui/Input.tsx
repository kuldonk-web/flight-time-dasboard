'use client';

import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  /** Pakai font monospace — untuk field data seperti flight number, ICAO code, flight level. */
  mono?: boolean;
}

export function Input({ label, error, hint, mono, id, className, ...rest }: InputProps) {
  const inputId = id ?? rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          'h-10 rounded-sm border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted',
          'focus-visible:border-accent-cyan',
          mono && 'font-data',
          error ? 'border-status-alert' : 'border-border',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error ? (
        <span id={`${inputId}-error`} className="text-xs text-status-alert">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-text-muted">{hint}</span>
      ) : null}
    </div>
  );
}
