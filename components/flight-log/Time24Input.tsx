'use client';

import { useEffect, useState } from 'react';

interface Time24InputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

/**
 * Text input for 24-hour time entry (HH:mm), e.g. flight times like
 * EOBT / ATD / ETA / ATA.
 *
 * - Accepts digits only, auto-inserts the colon after 2 digits.
 * - Clamps hours to 00-23 and minutes to 00-59 on blur.
 * - Calls onChange with the raw (possibly partial) string as the user
 *   types, and with a normalized "HH:mm" string on blur once complete.
 */
export function Time24Input({
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = 'HH:MM',
}: Time24InputProps) {
  const [internalValue, setInternalValue] = useState(value ?? '');

  // Keep local state in sync if the parent updates the value externally
  useEffect(() => {
    setInternalValue(value ?? '');
  }, [value]);

  const formatInput = (raw: string): string => {
    // Strip everything except digits
    const digits = raw.replace(/\D/g, '').slice(0, 4);

    if (digits.length <= 2) {
      return digits;
    }
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    setInternalValue(formatted);
    onChange(formatted);
  };

  const handleBlur = () => {
    const digits = internalValue.replace(/\D/g, '');

    if (digits.length === 0) {
      setInternalValue('');
      onChange('');
      return;
    }

    // Pad to 4 digits (HHmm), clamp hours/minutes to valid ranges
    const padded = digits.padEnd(4, '0').slice(0, 4);
    let hours = parseInt(padded.slice(0, 2), 10);
    let minutes = parseInt(padded.slice(2, 4), 10);

    if (Number.isNaN(hours) || hours > 23) hours = 23;
    if (Number.isNaN(minutes) || minutes > 59) minutes = 59;

    const normalized = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    setInternalValue(normalized);
    onChange(normalized);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={internalValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={5}
      className={className}
    />
  );
}
