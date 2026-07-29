import type { DelayCategory, FlightLog } from '@/types/flight';
import { DELAY_THRESHOLD_MINUTES, EARLY_THRESHOLD_MINUTES } from '@/lib/constants';
import { diffInMinutes } from './time';

/**
 * Klasifikasi delay dari selisih menit (actual - estimated).
 * null (waktu aktual belum diisi) -> PENDING.
 */
export function classifyDelay(diffMinutes: number | null): DelayCategory {
  if (diffMinutes === null) return 'PENDING';
  if (diffMinutes > DELAY_THRESHOLD_MINUTES) return 'DELAY';
  if (diffMinutes < -EARLY_THRESHOLD_MINUTES) return 'EARLY';
  return 'ON_TIME';
}

/** Selisih menit keberangkatan (ATD - ETD). */
export function getDepartureDelayMinutes(log: FlightLog): number | null {
  return diffInMinutes(log.estimatedDeparture, log.actualDeparture);
}

/** Selisih menit kedatangan (ATA - ETA). */
export function getArrivalDelayMinutes(log: FlightLog): number | null {
  return diffInMinutes(log.estimatedArrival, log.actualArrival);
}

export function getDepartureStatus(log: FlightLog): DelayCategory {
  return classifyDelay(getDepartureDelayMinutes(log));
}

export function getArrivalStatus(log: FlightLog): DelayCategory {
  return classifyDelay(getArrivalDelayMinutes(log));
}

/** Label singkat untuk ditampilkan di Badge, termasuk tanda +/- menit. */
export function formatDelayLabel(category: DelayCategory, minutes: number | null): string {
  switch (category) {
    case 'PENDING':
      return 'Pending';
    case 'ON_TIME':
      return 'On-time';
    case 'DELAY':
      return `Delay +${minutes}m`;
    case 'EARLY':
      return `Early ${minutes}m`;
  }
}
