import type { FlightLog } from '@/types/flight';
import { FlightLogRow } from './FlightLogRow';

interface FlightLogTableProps {
  logs: FlightLog[];
  onEdit: (log: FlightLog) => void;
  onDeleteRequest: (log: FlightLog) => void;
}

const COLUMN_HEADERS = [
  { label: 'Flight / A/C', spanClass: 'col-span-2' },
  { label: 'Route', spanClass: 'col-span-2' },
  { label: 'FL', spanClass: 'col-span-1' },
  { label: 'Departure', spanClass: 'col-span-2' },
  { label: 'Arrival', spanClass: 'col-span-2' },
  { label: 'Status', spanClass: 'col-span-2' },
  { label: '', spanClass: 'col-span-1' },
];

export function FlightLogTable({ logs, onEdit, onDeleteRequest }: FlightLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border py-16 text-center">
        <p className="font-display text-sm font-medium text-text-primary">Belum ada log penerbangan</p>
        <p className="max-w-xs text-xs text-text-secondary">
          Tambahkan log pertama untuk mulai mencatat estimasi dan waktu aktual takeoff/landing.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="grid grid-cols-12 gap-3 border-b border-border bg-surface-raised px-4 py-2.5">
        {COLUMN_HEADERS.map((col, i) => (
          <span
            key={i}
            className={`${col.spanClass} text-xs font-medium uppercase tracking-wide text-text-muted`}
          >
            {col.label}
          </span>
        ))}
      </div>
      <div>
        {logs.map((log) => (
          <FlightLogRow key={log.id} log={log} onEdit={onEdit} onDeleteRequest={onDeleteRequest} />
        ))}
      </div>
    </div>
  );
}
