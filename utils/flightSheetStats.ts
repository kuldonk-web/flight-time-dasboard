import type { FlightSheetRow } from '@/types/flight';

export interface DailyMovementPoint {
  date: string;
  departure: number;
  arrival: number;
  lokal: number;
}

/** Rekap jumlah pergerakan per tanggal (semua data), diambil N hari terakhir yang ada datanya. */
export function computeMovementTrend(logs: FlightSheetRow[], days = 14): DailyMovementPoint[] {
  const byDate = new Map<string, DailyMovementPoint>();
  for (const log of logs) {
    if (!byDate.has(log.date)) byDate.set(log.date, { date: log.date, departure: 0, arrival: 0, lokal: 0 });
    const point = byDate.get(log.date) as DailyMovementPoint;
    if (log.kind === 'DEPARTURE') point.departure += 1;
    else if (log.kind === 'ARRIVAL') point.arrival += 1;
    else point.lokal += 1;
  }
  return Array.from(byDate.values())
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-days);
}

export interface DailyMovementSummary {
  total: number;
  departure: number;
  arrival: number;
  lokal: number;
  withNotes: number;
}

/** Ringkasan angka untuk tanggal yang sedang dipilih. */
export function computeDailySummary(dailyLogs: FlightSheetRow[]): DailyMovementSummary {
  return {
    total: dailyLogs.length,
    departure: dailyLogs.filter((l) => l.kind === 'DEPARTURE').length,
    arrival: dailyLogs.filter((l) => l.kind === 'ARRIVAL').length,
    lokal: dailyLogs.filter((l) => l.kind === 'LOKAL').length,
    withNotes: dailyLogs.filter((l) => l.status.trim().length > 0).length,
  };
}
