'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { computeFlightwatchDailySummary, computeFlightwatchTrend } from '@/utils/flightwatchStats';
import type { FlightwatchMovement } from '@/types/flight';

interface Props {
  allMovements: FlightwatchMovement[];
  dailyMovements: FlightwatchMovement[];
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-sm border border-border bg-surface px-3 py-2">
      <span className="text-[10px] uppercase tracking-wide text-text-secondary">{label}</span>
      <span className="font-data text-lg font-semibold text-text-primary">{value}</span>
    </div>
  );
}

export function FlightwatchRealizationChart({ allMovements, dailyMovements }: Props) {
  const trend = computeFlightwatchTrend(allMovements);
  const summary = computeFlightwatchDailySummary(dailyMovements);

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border bg-surface-raised p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Realisasi Traffic</h3>
      <div className="grid grid-cols-3 gap-2 sm:max-w-md">
        <SummaryCard label="Total Hari Ini" value={summary.total} />
        <SummaryCard label="Callsign Unik" value={summary.uniqueCallsigns} />
        <SummaryCard label="Operator Unik" value={summary.uniqueOperators} />
      </div>
      {trend.length > 0 && (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--text-secondary)" />
              <YAxis tick={{ fontSize: 10 }} stroke="var(--text-secondary)" allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Bar dataKey="count" name="Pergerakan" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {trend.length === 0 && <p className="text-xs text-text-muted">Belum ada data untuk ditampilkan trennya.</p>}
    </div>
  );
}
