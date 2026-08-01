'use client';

import { useEffect, useState } from 'react';
import { useFlightwatchLogbook } from '@/hooks/useFlightwatchLogbook';
import { Time24Input } from '@/components/flight-log/Time24Input';
import { SignaturePad } from '@/components/ui/SignaturePad';
import { FlightwatchRealizationChart } from '@/components/flightwatch/FlightwatchRealizationChart';
import { exportFlightwatchToPdf } from '@/utils/exportFlightwatchPdf';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type { ShiftInfo } from '@/types/flight';

const TIME_INPUT_CLASS =
  'h-8 w-20 rounded-sm border border-border bg-surface px-2 text-center font-data text-sm text-text-primary outline-none focus:bg-surface-raised';

const CELL_INPUT =
  'h-9 w-full bg-transparent px-1.5 text-xs text-text-primary outline-none focus:bg-surface-raised';

function UtcClock() {
  const [now, setNow] = useState('');
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

export function FlightwatchLogbookPage() {
  const {
    movements,
    dailyMovements,
    knownCallsigns,
    knownOperators,
    shiftMeta,
    patchShiftMeta,
    selectedDate,
    setSelectedDate,
    addMovementRow,
    patchMovementRow,
    removeMovementRow,
    isSyncing,
    isCloudEnabled,
  } = useFlightwatchLogbook();

  const { showToast } = useToast();
  const [rowPendingDelete, setRowPendingDelete] = useState<string | null>(null);

  function patchShift(shiftField: 'shift1' | 'shift2', patch: Partial<ShiftInfo>) {
    patchShiftMeta({ [shiftField]: { ...shiftMeta[shiftField], ...patch } });
  }

  function confirmDelete() {
    if (!rowPendingDelete) return;
    removeMovementRow(rowPendingDelete);
    setRowPendingDelete(null);
    showToast('Baris berhasil dihapus.', 'success');
  }

  function handleExportPdf() {
    if (movements.length === 0) {
      showToast('Belum ada data untuk di-export.', 'info');
      return;
    }
    exportFlightwatchToPdf(movements);
    showToast(`${movements.length} baris berhasil di-export ke PDF.`, 'success');
  }

  return (
    <div className="flex w-full flex-col gap-5 px-4 py-6">
      <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-surface-raised p-4">
        <h1 className="font-display text-sm font-semibold uppercase tracking-wide text-text-primary">
          Flight Watch Traffic Movement Logbook
        </h1>
        <UtcClock />
        {isCloudEnabled && (
          <span className="text-xs text-text-muted">{isSyncing ? 'Menyinkronkan…' : 'Cloud aktif'}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="fw-date" className="text-xs font-medium text-text-secondary">
            Date (UTC)
          </label>
          <input
            id="fw-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-8 rounded-sm border border-border bg-surface px-2 font-data text-sm text-text-primary"
          />
        </div>
      </div>

      {/* Blok Shift 1 / Shift 2 */}
      <div className="flex flex-col gap-3 rounded-sm border border-border p-4">
        {(
          [
            ['shift1', 'SHIFT 1'],
            ['shift2', 'SHIFT 2'],
          ] as const
        ).map(([shiftField, label]) => {
          const shift = shiftMeta[shiftField];
          return (
            <div key={shiftField} className="flex flex-wrap items-center gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
              <span className="w-20 shrink-0 text-xs font-semibold text-text-secondary">{label}</span>
              <input
                list="fw-officer-options"
                value={shift.officer}
                onChange={(e) => patchShift(shiftField, { officer: e.target.value.toUpperCase() })}
                placeholder="Nama petugas"
                className="h-8 w-40 rounded-sm border border-border bg-surface px-2 text-sm text-text-primary outline-none focus:bg-surface-raised"
              />
              <SignaturePad value={shift.signature} onChange={(v) => patchShift(shiftField, { signature: v })} />
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">TIME:</span>
                <Time24Input value={shift.startTime} onChange={(v) => patchShift(shiftField, { startTime: v })} className={TIME_INPUT_CLASS} />
                <span className="text-xs text-text-secondary">–</span>
                <Time24Input value={shift.endTime} onChange={(v) => patchShift(shiftField, { endTime: v })} className={TIME_INPUT_CLASS} />
                <span className="text-xs text-text-secondary">UTC</span>
              </div>
            </div>
          );
        })}
      </div>

      <datalist id="fw-officer-options">
        {knownCallsigns.map((cs) => (
          <option key={cs} value={cs} />
        ))}
      </datalist>
      <datalist id="fw-operator-options">
        {knownOperators.map((op) => (
          <option key={op} value={op} />
        ))}
      </datalist>
      <datalist id="fw-callsign-options">
        {knownCallsigns.map((cs) => (
          <option key={cs} value={cs} />
        ))}
      </datalist>

      {/* Tabel pergerakan */}
      <div className="w-full rounded-sm border border-border">
        <table className="w-full table-fixed border-collapse text-xs">
          <thead>
            <tr className="bg-surface-raised text-[10px] uppercase tracking-wide text-text-secondary">
              <th className="border border-border px-1 py-2 w-[3%]">No</th>
              <th className="border border-border px-1 py-2 w-[10%]">Callsign</th>
              <th className="border border-border px-1 py-2 w-[10%]">Reg</th>
              <th className="border border-border px-1 py-2 w-[8%]">Type A/C</th>
              <th className="border border-border px-1 py-2 w-[9%]">Dep AD</th>
              <th className="border border-border px-1 py-2 w-[7%]">ATD</th>
              <th className="border border-border px-1 py-2 w-[9%]">Dest AD</th>
              <th className="border border-border px-1 py-2 w-[7%]">ATA</th>
              <th className="border border-border px-1 py-2 w-[14%]">Operator</th>
              <th className="border border-border px-1 py-2 w-[20%]">RMK</th>
              <th className="border border-border px-1 py-2 w-[3%]" />
            </tr>
          </thead>
          <tbody>
            {dailyMovements.map((row, idx) => (
              <tr key={row.id} className="text-text-primary odd:bg-surface even:bg-surface/60">
                <td className="border border-border px-1 py-1 text-center font-data text-text-secondary">{idx + 1}</td>
                <td className="border border-border p-0">
                  <input
                    list="fw-callsign-options"
                    value={row.callsign}
                    onChange={(e) => patchMovementRow(row.id, { callsign: e.target.value.toUpperCase() })}
                    className={`${CELL_INPUT} font-data uppercase`}
                  />
                </td>
                <td className="border border-border p-0">
                  <input
                    value={row.registrasi}
                    onChange={(e) => patchMovementRow(row.id, { registrasi: e.target.value.toUpperCase() })}
                    className={`${CELL_INPUT} font-data uppercase`}
                  />
                </td>
                <td className="border border-border p-0">
                  <input
                    value={row.aircraftType}
                    onChange={(e) => patchMovementRow(row.id, { aircraftType: e.target.value.toUpperCase() })}
                    className={`${CELL_INPUT} font-data uppercase`}
                  />
                </td>
                <td className="border border-border p-0">
                  <input
                    value={row.depAirport}
                    maxLength={4}
                    onChange={(e) => patchMovementRow(row.id, { depAirport: e.target.value.toUpperCase().slice(0, 4) })}
                    className={`${CELL_INPUT} text-center font-data uppercase`}
                  />
                </td>
                <td className="border border-border p-0">
                  <Time24Input value={row.atd} onChange={(v) => patchMovementRow(row.id, { atd: v })} className={`${CELL_INPUT} text-center font-data`} />
                </td>
                <td className="border border-border p-0">
                  <input
                    value={row.destAirport}
                    maxLength={4}
                    onChange={(e) => patchMovementRow(row.id, { destAirport: e.target.value.toUpperCase().slice(0, 4) })}
                    className={`${CELL_INPUT} text-center font-data uppercase`}
                  />
                </td>
                <td className="border border-border p-0">
                  <Time24Input value={row.ata} onChange={(v) => patchMovementRow(row.id, { ata: v })} className={`${CELL_INPUT} text-center font-data`} />
                </td>
                <td className="border border-border p-0">
                  <input
                    list="fw-operator-options"
                    value={row.operator}
                    onChange={(e) => patchMovementRow(row.id, { operator: e.target.value.toUpperCase() })}
                    className={`${CELL_INPUT} uppercase`}
                  />
                </td>
                <td className="border border-border p-0">
                  <input
                    value={row.remarks}
                    onChange={(e) => patchMovementRow(row.id, { remarks: e.target.value })}
                    className={CELL_INPUT}
                  />
                </td>
                <td className="border border-border px-1 py-1 text-center">
                  <button onClick={() => setRowPendingDelete(row.id)} aria-label="Hapus baris" className="text-xs text-status-alert hover:underline">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {dailyMovements.length === 0 && (
              <tr>
                <td colSpan={11} className="border border-border px-2 py-6 text-center text-sm text-text-muted">
                  Belum ada data untuk tanggal ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tombol aksi */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={addMovementRow}>
          + Tambah Baris
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button variant="secondary" size="sm" onClick={handleExportPdf}>
          Export PDF (Rekap Semua)
        </Button>
      </div>

      {/* Grafik realisasi — di PALING BAWAH halaman */}
      <FlightwatchRealizationChart allMovements={movements} dailyMovements={dailyMovements} />

      <Modal open={!!rowPendingDelete} onClose={() => setRowPendingDelete(null)} title="Hapus Baris?" size="sm">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-text-secondary">Yakin ingin menghapus baris ini? Tindakan ini tidak bisa dibatalkan.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRowPendingDelete(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Ya, Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
