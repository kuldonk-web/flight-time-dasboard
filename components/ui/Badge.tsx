import type { DelayCategory, FlightStatus } from '@/types/flight';
import { cn } from '@/utils/cn';

type BadgeTone = 'ontime' | 'delay' | 'early' | 'pending' | 'alert' | 'neutral';

const TONE_CLASSES: Record<BadgeTone, string> = {
  ontime: 'text-status-ontime border-status-ontime/40 bg-status-ontime/10',
  delay: 'text-status-delay border-status-delay/40 bg-status-delay/10',
  early: 'text-status-early border-status-early/40 bg-status-early/10',
  pending: 'text-status-pending border-status-pending/40 bg-status-pending/10',
  alert: 'text-status-alert border-status-alert/40 bg-status-alert/10',
  neutral: 'text-text-secondary border-border bg-surface-raised',
};

interface BadgeProps {
  label: string;
  tone: BadgeTone;
  className?: string;
}

export function Badge({ label, tone, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 font-data text-xs',
        TONE_CLASSES[tone],
        className
      )}
    >
      {label}
    </span>
  );
}

/** Pemetaan FlightStatus -> tone Badge. Dipakai di FlightLogTable/Form. */
export function statusToTone(status: FlightStatus): BadgeTone {
  switch (status) {
    case 'NORMAL':
      return 'neutral';
    case 'RTB':
    case 'RTA':
      return 'delay';
    case 'DIVERT':
      return 'alert';
  }
}

/** Pemetaan DelayCategory -> tone Badge. */
export function delayToTone(category: DelayCategory): BadgeTone {
  switch (category) {
    case 'ON_TIME':
      return 'ontime';
    case 'DELAY':
      return 'delay';
    case 'EARLY':
      return 'early';
    case 'PENDING':
      return 'pending';
  }
}
