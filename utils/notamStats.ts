import type { NotamEntry } from '@/types/flight';

export interface NotamExpiryPoint {
  month: string; // "2026-12"
  count: number;
}

/** Rekap jumlah NOTAM yang tutup per bulan — membantu lihat beban kadaluarsa ke depan. */
export function computeNotamExpiryTrend(notams: NotamEntry[]): NotamExpiryPoint[] {
  const byMonth = new Map<string, number>();
  for (const n of notams) {
    if (!n.closingDate) continue;
    const month = n.closingDate.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
  }
  return Array.from(byMonth.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));
}
