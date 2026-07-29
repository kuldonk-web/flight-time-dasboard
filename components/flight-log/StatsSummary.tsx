import type { FlightStats } from '@/types/flight';

interface StatsSummaryProps {
  stats: FlightStats;
}

interface StatCardData {
  label: string;
  value: string;
  accent?: 'amber' | 'cyan' | 'alert';
}

const ACCENT_CLASS: Record<NonNullable<StatCardData['accent']>, string> = {
  amber: 'text-accent-amber',
  cyan: 'text-accent-cyan',
  alert: 'text-status-alert',
};

export function StatsSummary({ stats }: StatsSummaryProps) {
  const cards: StatCardData[] = [
    { label: 'Total Log', value: String(stats.totalLogs) },
    { label: 'On-time Takeoff', value: `${stats.onTimeDeparturePct}%`, accent: 'cyan' },
    { label: 'On-time Landing', value: `${stats.onTimeArrivalPct}%`, accent: 'cyan' },
    {
      label: 'Avg Delay Takeoff',
      value: `${stats.avgDepartureDelayMinutes >= 0 ? '+' : ''}${stats.avgDepartureDelayMinutes}m`,
      accent: 'amber',
    },
    {
      label: 'Avg Delay Landing',
      value: `${stats.avgArrivalDelayMinutes >= 0 ? '+' : ''}${stats.avgArrivalDelayMinutes}m`,
      accent: 'amber',
    },
    {
      label: 'RTB / RTA / Divert',
      value: `${stats.rtbCount} / ${stats.rtaCount} / ${stats.divertCount}`,
      accent: stats.divertCount > 0 ? 'alert' : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="rounded-md border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{card.label}</p>
          <p
            className={`mt-1 font-data text-xl font-semibold ${
              card.accent ? ACCENT_CLASS[card.accent] : 'text-text-primary'
            }`}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
