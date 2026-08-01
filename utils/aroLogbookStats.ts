import type { AroLogEntry, FlightDataRow } from '@/types/flight';

export interface AroTrendPoint {
  date: string;
  fpl: number;
  dep: number;
  arr: number;
}

function sumShifts(entry: AroLogEntry, key: keyof FlightDataRow): number {
  return entry.flightData.pagi[key] + entry.flightData.siang[key] + entry.flightData.malam[key];
}

/** Tren FPL/DEP/ARR per tanggal, N hari terakhir yang ada datanya. */
export function computeAroTrend(entries: AroLogEntry[], days = 14): AroTrendPoint[] {
  return [...entries]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-days)
    .map((e) => ({ date: e.date, fpl: sumShifts(e, 'fpl'), dep: sumShifts(e, 'dep'), arr: sumShifts(e, 'arr') }));
}

export interface AroDailySummary {
  fpl: number;
  dep: number;
  arr: number;
  cnl: number;
  scheduled: number;
  nonScheduled: number;
  specialConditions: number;
}

/** Ringkasan (total ketiga shift) untuk tanggal yang sedang dipilih. */
export function computeAroDailySummary(entry: AroLogEntry): AroDailySummary {
  return {
    fpl: sumShifts(entry, 'fpl'),
    dep: sumShifts(entry, 'dep'),
    arr: sumShifts(entry, 'arr'),
    cnl: sumShifts(entry, 'cnl'),
    scheduled: sumShifts(entry, 'domScheduled') + sumShifts(entry, 'intScheduled'),
    nonScheduled: sumShifts(entry, 'domNonScheduled') + sumShifts(entry, 'intNonScheduled'),
    specialConditions:
      sumShifts(entry, 'rta') +
      sumShifts(entry, 'rtb') +
      sumShifts(entry, 'div') +
      sumShifts(entry, 'post') +
      sumShifts(entry, 'local'),
  };
}
