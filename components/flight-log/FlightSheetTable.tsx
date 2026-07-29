'use client';

import { useEffect, useState } from 'react';
import { useFlightSheet } from '@/hooks/useFlightSheet';
import { ALT_FL_OPTIONS, FLIGHT_SHEET_KIND_OPTIONS, SHEET_STATUS_OPTIONS } from '@/lib/constants';
import type { FlightSheetKind } from '@/types/flight';
import { Button } from '@/components/ui/Button';
import { exportFlightSheetToXlsx } from '@/utils/exportFlightSheetXlsx';
import { exportFlightSheetToPdf } from '@/utils/exportFlightSheetPdf';
import { useToast } from '@/components/ui/Toast';

const CELL_INPUT =
  'h-9 w-full bg-transparent px-2 text-sm text-text-primary outline-none focus:bg-surface-raised disabled:cursor-not-allowed disabled:bg-bg disabled:text-text-muted';

/** Field jam mana yang relevan/aktif untuk tiap jenis baris. */
const TIME_FIELDS_ENABLED: Record<FlightSheetKind, { eobt: boolean; atd: boolean; eta: boolean; ata: boolean }> = {
  DEPARTURE: { eobt: true, atd: true, eta: false, ata: false },
  ARRIVAL: { eobt: false, atd: false, eta: true, ata: true },
  LOKAL: { eobt: false, atd: true, eta: false, ata: true },
};

function UtcClock() {
  const [now, setNow] = useState<string>('');

  useEffect(() => {
    function tick() {
      setNow(new Date().toISOString().slice(11, 19));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-data text-xs text-text-secondary">
      UTC: <span className="text-text-primary">{now || '--:--:--'}</span>Z
    </span>
  );
}

export function FlightSheetTable() {
  const {
    logs,
    dailyLogs,
    knownCallsigns,
    knownAircraftTypes,
    selectedDate,
    setSelectedDate,
    addEmptyRow,
    patchRow,
    removeRow,
    isSyncing,
    isCloudEnabled,
  } = useFlightSheet();

  const { showToast } = useToast();

  function handleExportXlsx() {
    if (logs.length === 0) {
      showToast('Belum ada data untuk di-export.', 'info');
      return;
    }
    exportFlightSheetToXlsx(logs);
    showToast(`${logs.length} baris berhasil di-export ke Excel.`, 'success');
  }

  function handleExportPdf() {
    if (logs.length === 0) {
      showToast('Belum ada data untuk di-export.', 'info');
      return;
    }
    exportFlightSheetToPdf(logs);
    showToast(`${logs.length} baris berhasil di-export ke PDF.`, 'success');
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 rounded-t-sm bg-surface-raised px-4 py-2.5">
        <h2 className="font-display text-sm font-semibold text-text-primary">Flight Log</h2>
        <UtcClock />
        {isCloudEnabled && (
          <span className="text-xs text-text-muted">{isSyncing ? 'Menyinkronkan…' : 'Cloud aktif'}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="sheet-date" className="text-xs font-medium text-text-secondary">
            Date (UTC)
          </label>
          <input
            id="sheet-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-8 rounded-sm border border-border bg-surface px-2 font-data text-sm text-text-primary"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full min-w-[1450px] border-collapse text-sm">
          <thead>
            <tr className="bg-surface-raised text-xs uppercase tracking-wide text-text-secondary">
              <th className="w-10 border border-border px-2 py-2">No</th>
              <th className="border border-border px-2 py-2">Jenis</th>
              <th className="border border-border px-2 py-2">Callsign</th>
              <th className="border border-border px-2 py-2">Registrasi</th>
              <th className="border border-border px-2 py-2">ALT/FL</th>
              <th className="border border-border px-2 py-2">Type</th>
              <th className="border border-border px-2 py-2">Route</th>
              <th className="border border-border px-2 py-2">Bandara</th>
              <th className="border border-border px-2 py-2">EOBT (UTC)</th>
              <th className="border border-border px-2 py-2">ATD (UTC)</th>
              <th className="border border-border px-2 py-2">ETA (UTC)</th>
              <th className="border border-border px-2 py-2">ATA (UTC)</th>
              <th className="border border-border px-2 py-2">Ket.</th>
              <th className="w-9 border border-border px-1 py-2" />
            </tr>
          </thead>
          <tbody>
            {dailyLogs.map((row, idx) => {
              const timeEnabled = TIME_FIELDS_ENABLED[row.kind];
              return (
                <tr key={row.id} className="text-text-primary odd:bg-surface even:bg-surface/60">
                  <td className="border border-border px-2 py-1 text-center font-data text-text-secondary">
                    {idx + 1}
                  </td>
                  <td className="border border-border p-0">
                    <select
                      value={row.kind}
                      onChange={(e) => patchRow(row.id, { kind: e.target.value as FlightSheetKind })}
                      className={`${CELL_INPUT} font-medium`}
                    >
                      {FLIGHT_SHEET_KIND_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-border p-0">
                    <input
                      list="sheet-callsign-options"
                      value={row.callsign}
                      onChange={(e) => patchRow(row.id, { callsign: e.target.value.toUpperCase() })}
                      placeholder="BTK6899"
                      className={`${CELL_INPUT} font-data uppercase`}
                    />
                  </td>
                  <td className="border border-border p-0">
                    <input
                      value={row.registrasi}
                      onChange={(e) => patchRow(row.id, { registrasi: e.target.value.toUpperCase() })}
                      placeholder="PK-XXX"
                      className={`${CELL_INPUT} font-data uppercase`}
                    />
                  </td>
                  <td className="border border-border p-0">
                    <select
                      value={row.altFl}
                      onChange={(e) => patchRow(row.id, { altFl: e.target.value })}
                      className={`${CELL_INPUT} font-data`}
                    >
                      <option value="">-</option>
                      {ALT_FL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-border p-0">
                    <input
                      list="sheet-aircraft-type-options"
                      value={row.aircraftType}
                      onChange={(e) => patchRow(row.id, { aircraftType: e.target.value.toUpperCase() })}
                      placeholder="B738 / ketik baru"
                      className={`${CELL_INPUT} font-data uppercase`}
                    />
                  </td>
                  <td className="border border-border p-0">
                    <input
                      value={row.route}
                      onChange={(e) => patchRow(row.id, { route: e.target.value.toUpperCase() })}
                      placeholder="T5"
                      className={`${CELL_INPUT} font-data uppercase`}
                    />
                  </td>
                  <td className="border border-border p-0">
                    <input
                      value={row.airport}
                      maxLength={4}
                      onChange={(e) => patchRow(row.id, { airport: e.target.value.toUpperCase().slice(0, 4) })}
                      placeholder="WIII"
                      className={`${CELL_INPUT} text-center font-data uppercase`}
                    />
                  </td>
                  <td className="border border-border p-0">
                    <input
                      type="time"
                      value={row.eobt}
                      disabled={!timeEnabled.eobt}
                      onChange={(e) => patchRow(row.id, { eobt: e.target.value })}
                      className={`${CELL_INPUT} font-data`}
                    />
                  </td>
                  <td className="border border-border p-0">
                    <input
                      type="time"
                      value={row.atd}
                      disabled={!timeEnabled.atd}
                      onChange={(e) => patchRow(row.id, { atd: e.target.value })}
                      className={`${CELL_INPUT} font-data`}
                    />
                  </td>
                  <td className="border border-border p-0">
                    <input
                      type="time"
                      value={row.eta}
                      disabled={!timeEnabled.eta}
                      onChange={(e) => patchRow(row.id, { eta: e.target.value })}
                      className={`${CELL_INPUT} font-data`}
                    />
                  </td>
                  <td className="border border-border p-0">
                    <input
                      type="time"
                      value={row.ata}
                      disabled={!timeEnabled.ata}
                      onChange={(e) => patchRow(row.id, { ata: e.target.value })}
                      className={`${CELL_INPUT} font-data`}
                    />
                  </td>
                  <td className="border border-border p-0">
                    <select
                      value={row.status}
                      onChange={(e) => patchRow(row.id, { status: e.target.value as typeof row.status })}
                      className={CELL_INPUT}
                    >
                      {SHEET_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-border px-1 py-1 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      aria-label="Hapus baris"
                      className="text-xs text-status-alert hover:underline"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
            {dailyLogs.length === 0 && (
              <tr>
                <td colSpan={14} className="border border-border px-2 py-6 text-center text-sm text-text-muted">
                  Belum ada data untuk tanggal ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <datalist id="sheet-callsign-options">
        {knownCallsigns.map((cs) => (
          <option key={cs} value={cs} />
        ))}
      </datalist>
      <datalist id="sheet-aircraft-type-options">
        {knownAircraftTypes.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => addEmptyRow('DEPARTURE')}>
          + Departure
        </Button>
        <Button variant="secondary" size="sm" onClick={() => addEmptyRow('ARRIVAL')}>
          + Arrival
        </Button>
        <Button variant="secondary" size="sm" onClick={() => addEmptyRow('LOKAL')}>
          + Lokal
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button variant="secondary" size="sm" onClick={handleExportXlsx}>
          Export Excel (Rekap Semua)
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExportPdf}>
          Export PDF (Rekap Semua)
        </Button>
      </div>
    </section>
  );
}
