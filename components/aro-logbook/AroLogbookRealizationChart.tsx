'use client';

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { computeAroDailySummary, computeAroTrend } from '@/utils/aroLogbookStats';
import type { AroLogEntry } from '@/types/flight';

interface Props {
  allEntries: AroLogEntry[];
  entry: AroLogEntry;
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-sm border border-border bg-surface px-3 py-2">
      <span className="text-[10px] uppercase tracking-wide text-text-secondary">{label}</span>
      <span className="font-data text-lg font-semibold text-text-primary">{value}</span>
    </div>
  );
}

/** Grafik realisasi ARO: ringkasan hari ini (total 3 shift) + tren FPL/DEP/ARR per tanggal. */
export function AroLogbookRealizationChart({ allEntries, entry }: Props) {
  const trend = computeAroTrend(allEntries);
  const summary = computeAroDailySummary(entry);

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border bg-surface-raised p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Realisasi Operasional</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        <SummaryCard label="FPL" value={summary.fpl} />
        <SummaryCard label="DEP" value={summary.dep} />
        <SummaryCard label="ARR" value={summary.arr} />
        <SummaryCard label="CNL" value={summary.cnl} />
        <SummaryCard label="Berjadwal" value={summary.scheduled} />
        <SummaryCard label="Tidak Berjadwal" value={summary.nonScheduled} />
        <SummaryCard label="Kondisi Khusus" value={summary.specialConditions} />
      </div>
      {trend.length > 0 && (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--text-secondary)" />
              <YAxis tick={{ fontSize: 10 }} stroke="var(--text-secondary)" allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="fpl" name="FPL" stroke="#0e7490" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="dep" name="DEP" stroke="#15803d" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="arr" name="ARR" stroke="#b7791f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {trend.length === 0 && <p className="text-xs text-text-muted">Belum ada data untuk ditampilkan trennya.</p>}
    </div>
  );
}
