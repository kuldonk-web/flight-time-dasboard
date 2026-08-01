import type { CtafLogEntry } from '@/types/flight';

export interface CtafTrendPoint {
  date: string;
  count: number;
}

export function computeCtafTrend(logs: CtafLogEntry[], days = 14): CtafTrendPoint[] {
  const byDate = new Map<string, number>();
  for (const l of logs) {
    byDate.set(l.date, (byDate.get(l.date) ?? 0) + 1);
  }
  return Array.from(byDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-days);
}

export interface CtafDailySummary {
  total: number;
  uniqueUnits: number;
}

export function computeCtafDailySummary(dailyLogs: CtafLogEntry[]): CtafDailySummary {
  return {
    total: dailyLogs.length,
    uniqueUnits: new Set(dailyLogs.map((l) => l.unattendedUnit).filter(Boolean)).size,
  };
}
