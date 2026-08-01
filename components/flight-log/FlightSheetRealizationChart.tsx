'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { computeDailySummary, computeMovementTrend } from '@/utils/flightSheetStats';
import type { FlightSheetRow } from '@/types/flight';

interface Props {
  allLogs: FlightSheetRow[];
  dailyLogs: FlightSheetRow[];
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-sm border border-border bg-surface px-3 py-2">
      <span className="text-[10px] uppercase tracking-wide text-text-secondary">{label}</span>
      <span className="font-data text-lg font-semibold text-text-primary">{value}</span>
    </div>
  );
}

/** Grafik realisasi pergerakan: ringkasan hari ini + tren jumlah pergerakan per tanggal. */
export function FlightSheetRealizationChart({ allLogs, dailyLogs }: Props) {
  const trend = computeMovementTrend(allLogs);
  const summary = computeDailySummary(dailyLogs);

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border bg-surface-raised p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Realisasi Pergerakan</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <SummaryCard label="Total Hari Ini" value={summary.total} />
        <SummaryCard label="Departure" value={summary.departure} />
        <SummaryCard label="Arrival" value={summary.arrival} />
        <SummaryCard label="Lokal" value={summary.lokal} />
        <SummaryCard label="Ada Keterangan" value={summary.withNotes} />
      </div>
      {trend.length > 0 && (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--text-secondary)" />
              <YAxis tick={{ fontSize: 10 }} stroke="var(--text-secondary)" allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="departure" name="Departure" fill="#0e7490" />
              <Bar dataKey="arrival" name="Arrival" fill="#15803d" />
              <Bar dataKey="lokal" name="Lokal" fill="#b7791f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {trend.length === 0 && <p className="text-xs text-text-muted">Belum ada data untuk ditampilkan trennya.</p>}
    </div>
  );
}
