'use client';

import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export function Select({ label, options, error, id, className, ...rest }: SelectProps) {
  const selectId = id ?? rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-xs font-medium text-text-secondary">
        {label}
      </label>
      <select
        id={selectId}
        className={cn(
          'h-10 rounded-sm border bg-surface px-3 text-sm text-text-primary',
          'focus-visible:border-accent-cyan',
          error ? 'border-status-alert' : 'border-border',
          className
        )}
        aria-invalid={!!error}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-status-alert">{error}</span>}
    </div>
  );
}
