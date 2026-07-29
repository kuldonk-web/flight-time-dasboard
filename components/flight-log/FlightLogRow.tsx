import type { FlightLog, FlightStatus } from '@/types/flight';
import { Badge, delayToTone, statusToTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  formatDelayLabel,
  getArrivalDelayMinutes,
  getArrivalStatus,
  getDepartureDelayMinutes,
  getDepartureStatus,
} from '@/utils/delay';
import { formatTime } from '@/utils/time';
import { cn } from '@/utils/cn';

interface FlightLogRowProps {
  log: FlightLog;
  onEdit: (log: FlightLog) => void;
  onDeleteRequest: (log: FlightLog) => void;
}

/** Warna garis tepi kiri strip — elemen signature yang meniru flight progress strip ATC. */
const STATUS_STRIP_CLASS: Record<FlightStatus, string> = {
  NORMAL: 'border-l-border',
  RTB: 'border-l-status-delay',
  RTA: 'border-l-status-delay',
  DIVERT: 'border-l-status-alert',
};

export function FlightLogRow({ log, onEdit, onDeleteRequest }: FlightLogRowProps) {
  const depDelay = getDepartureDelayMinutes(log);
  const arrDelay = getArrivalDelayMinutes(log);
  const depStatus = getDepartureStatus(log);
  const arrStatus = getArrivalStatus(log);

  return (
    <div
      className={cn(
        'grid grid-cols-12 items-center gap-3 border-b border-border border-l-4 bg-surface px-4 py-3',
        'transition-colors hover:bg-surface-raised',
        STATUS_STRIP_CLASS[log.status]
      )}
    >
      {/* Flight number + aircraft type */}
      <div className="col-span-2 flex flex-col">
        <span className="font-data text-sm font-semibold text-text-primary">{log.flightNumber}</span>
        <span className="font-data text-xs text-text-secondary">{log.aircraftType}</span>
      </div>

      {/* Rute */}
      <div className="col-span-2 flex items-center gap-1.5 font-data text-sm text-text-primary">
        <span>{log.departureAirport}</span>
        <span className="text-text-muted">→</span>
        <span>{log.destinationAirport}</span>
      </div>

      {/* Flight level */}
      <div className="col-span-1 font-data text-sm text-text-secondary">{log.flightLevel}</div>

      {/* Departure: ETD / ATD + delay badge */}
      <div className="col-span-2 flex flex-col gap-0.5">
        <div className="flex items-baseline gap-1.5 font-data text-sm">
          <span className="text-text-muted">ETD</span>
          <span className="text-text-primary">{formatTime(log.estimatedDeparture)}</span>
          <span className="text-text-muted">/ ATD</span>
          <span className="text-text-primary">{formatTime(log.actualDeparture)}</span>
        </div>
        <Badge label={formatDelayLabel(depStatus, depDelay)} tone={delayToTone(depStatus)} className="w-fit" />
      </div>

      {/* Arrival: ETA / ATA + delay badge */}
      <div className="col-span-2 flex flex-col gap-0.5">
        <div className="flex items-baseline gap-1.5 font-data text-sm">
          <span className="text-text-muted">ETA</span>
          <span className="text-text-primary">{formatTime(log.estimatedArrival)}</span>
          <span className="text-text-muted">/ ATA</span>
          <span className="text-text-primary">{formatTime(log.actualArrival)}</span>
        </div>
        <Badge label={formatDelayLabel(arrStatus, arrDelay)} tone={delayToTone(arrStatus)} className="w-fit" />
      </div>

      {/* Status operasional */}
      <div className="col-span-2 flex flex-col gap-0.5">
        <Badge label={log.status} tone={statusToTone(log.status)} className="w-fit" />
        {log.statusRemarks && (
          <span className="truncate text-xs text-text-secondary" title={log.statusRemarks}>
            {log.statusRemarks}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-1 flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => onEdit(log)}>
          Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDeleteRequest(log)} className="hover:text-status-alert">
          Hapus
        </Button>
      </div>
    </div>
  );
}
