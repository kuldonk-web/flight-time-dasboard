'use client';

import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({ label, error, id, className, ...rest }: TextareaProps) {
  const textareaId = id ?? rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="text-xs font-medium text-text-secondary">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={3}
        className={cn(
          'resize-none rounded-sm border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted',
          'focus-visible:border-accent-cyan',
          error ? 'border-status-alert' : 'border-border',
          className
        )}
        aria-invalid={!!error}
        {...rest}
      />
      {error && <span className="text-xs text-status-alert">{error}</span>}
    </div>
  );
}
