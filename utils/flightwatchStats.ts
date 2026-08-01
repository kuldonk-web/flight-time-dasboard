import type { FlightwatchMovement } from '@/types/flight';

export interface FlightwatchTrendPoint {
  date: string;
  count: number;
}

export function computeFlightwatchTrend(movements: FlightwatchMovement[], days = 14): FlightwatchTrendPoint[] {
  const byDate = new Map<string, number>();
  for (const m of movements) {
    byDate.set(m.date, (byDate.get(m.date) ?? 0) + 1);
  }
  return Array.from(byDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-days);
}

export interface FlightwatchDailySummary {
  total: number;
  uniqueCallsigns: number;
  uniqueOperators: number;
}

export function computeFlightwatchDailySummary(dailyMovements: FlightwatchMovement[]): FlightwatchDailySummary {
  return {
    total: dailyMovements.length,
    uniqueCallsigns: new Set(dailyMovements.map((m) => m.callsign).filter(Boolean)).size,
    uniqueOperators: new Set(dailyMovements.map((m) => m.operator).filter(Boolean)).size,
  };
}
