'use client';

import { useEffect, useState } from 'react';
import { useCtafTraffic } from '@/hooks/useCtafTraffic';
import { CTAF_PROCEDURE_SUGGESTIONS } from '@/lib/constants';
import { Time24Input } from '@/components/flight-log/Time24Input';
import { SignaturePad } from '@/components/ui/SignaturePad';
import { CtafRealizationChart } from '@/components/ctaf/CtafRealizationChart';
import { exportCtafToPdf } from '@/utils/exportCtafPdf';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type { CtafShiftInfo } from '@/types/flight';

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

export function CtafTrafficPage() {
  const {
    logs,
    dailyLogs,
    knownUnits,
    knownOfficers,
    shiftMeta,
    patchShiftMeta,
    selectedDate,
    setSelectedDate,
    addLogRow,
    patchLogRow,
    removeLogRow,
    isSyncing,
    isCloudEnabled,
  } = useCtafTraffic();

  const { showToast } = useToast();
  const [rowPendingDelete, setRowPendingDelete] = useState<string | null>(null);

  function patchShift(shiftField: 'shift1' | 'shift2', patch: Partial<CtafShiftInfo>) {
    patchShiftMeta({ [shiftField]: { ...shiftMeta[shiftField], ...patch } });
  }

  function confirmDelete() {
    if (!rowPendingDelete) return;
    removeLogRow(rowPendingDelete);
    setRowPendingDelete(null);
    showToast('Baris berhasil dihapus.', 'success');
  }

  function handleExportPdf() {
    if (logs.length === 0) {
      showToast('Belum ada data untuk di-export.', 'info');
      return;
    }
    exportCtafToPdf(logs);
    showToast(`${logs.length} baris berhasil di-export ke PDF.`, 'success');
  }

  return (
    <div className="flex w-full flex-col gap-5 px-4 py-6">
      <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-surface-raised p-4">
        <h1 className="font-display text-sm font-semibold uppercase tracking-wide text-text-primary">
          CTAF Traffic
        </h1>
        <UtcClock />
        {isCloudEnabled && (
          <span className="text-xs text-text-muted">{isSyncing ? 'Menyinkronkan…' : 'Cloud aktif'}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="ctaf-date" className="text-xs font-medium text-text-secondary">
            Date (UTC)
          </label>
          <input
            id="ctaf-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-8 rounded-sm border border-border bg-surface px-2 font-data text-sm text-text-primary"
          />
        </div>
      </div>

      {/* Blok Shift 1 / Shift 2 + Transfer of Duty */}
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
                list="ctaf-officer-options"
                value={shift.officer}
                onChange={(e) => patchShift(shiftField, { officer: e.target.value.toUpperCase() })}
                placeholder="Nama petugas"
                className="h-8 w-40 rounded-sm border border-border bg-surface px-2 text-sm text-text-primary outline-none focus:bg-surface-raised"
              />
              <SignaturePad value={shift.signature} onChange={(v) => patchShift(shiftField, { signature: v })} />
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">TIME:</span>
                <Time24Input value={shift.time} onChange={(v) => patchShift(shiftField, { time: v })} className={TIME_INPUT_CLASS} />
                <span className="text-xs text-text-secondary">UTC</span>
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs font-semibold text-text-secondary">TRANSFER OF DUTY AT TIME :</span>
          <Time24Input
            value={shiftMeta.transferOfDutyTime}
            onChange={(v) => patchShiftMeta({ transferOfDutyTime: v })}
            className={TIME_INPUT_CLASS}
          />
          <span className="text-xs text-text-secondary">UTC</span>
        </div>
      </div>

      <datalist id="ctaf-officer-options">
        {knownOfficers.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id="ctaf-unit-options">
        {knownUnits.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
      <datalist id="ctaf-procedure-options">
        {CTAF_PROCEDURE_SUGGESTIONS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>

      {/* Tabel log monitoring */}
      <div className="w-full rounded-sm border border-border">
        <table className="w-full table-fixed border-collapse text-xs">
          <thead>
            <tr className="bg-surface-raised text-[10px] uppercase tracking-wide text-text-secondary">
              <th className="border border-border px-1 py-2 w-[4%]">No</th>
              <th className="border border-border px-1 py-2 w-[16%]">Un-attended Unit</th>
              <th className="border border-border px-1 py-2 w-[14%]">Procedure</th>
              <th className="border border-border px-1 py-2 w-[10%]">Time Start</th>
              <th className="border border-border px-1 py-2 w-[10%]">Time End</th>
              <th className="border border-border px-1 py-2 w-[42%]">Operational Log</th>
              <th className="border border-border px-1 py-2 w-[4%]" />
            </tr>
          </thead>
          <tbody>
            {dailyLogs.map((row, idx) => (
              <tr key={row.id} className="text-text-primary odd:bg-surface even:bg-surface/60">
                <td className="border border-border px-1 py-1 text-center font-data text-text-secondary">{idx + 1}</td>
                <td className="border border-border p-0">
                  <input
                    list="ctaf-unit-options"
                    value={row.unattendedUnit}
                    maxLength={4}
                    onChange={(e) => patchLogRow(row.id, { unattendedUnit: e.target.value.toUpperCase().slice(0, 4) })}
                    placeholder="WIMG"
                    className={`${CELL_INPUT} text-center font-data uppercase`}
                  />
                </td>
                <td className="border border-border p-0">
                  <input
                    list="ctaf-procedure-options"
                    value={row.procedure}
                    onChange={(e) => patchLogRow(row.id, { procedure: e.target.value.toUpperCase() })}
                    placeholder="CTAF"
                    className={`${CELL_INPUT} text-center font-data uppercase`}
                  />
                </td>
                <td className="border border-border p-0">
                  <Time24Input value={row.timeStart} onChange={(v) => patchLogRow(row.id, { timeStart: v })} className={`${CELL_INPUT} text-center font-data`} />
                </td>
                <td className="border border-border p-0">
                  <Time24Input value={row.timeEnd} onChange={(v) => patchLogRow(row.id, { timeEnd: v })} className={`${CELL_INPUT} text-center font-data`} />
                </td>
                <td className="border border-border p-0">
                  <textarea
                    value={row.operationalLog}
                    onChange={(e) => patchLogRow(row.id, { operationalLog: e.target.value })}
                    placeholder="Catatan operasional…"
                    rows={Math.max(1, row.operationalLog.split('\n').length)}
                    className={`${CELL_INPUT} resize-none py-1.5 leading-tight`}
                  />
                </td>
                <td className="border border-border px-1 py-1 text-center">
                  <button onClick={() => setRowPendingDelete(row.id)} aria-label="Hapus baris" className="text-xs text-status-alert hover:underline">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {dailyLogs.length === 0 && (
              <tr>
                <td colSpan={7} className="border border-border px-2 py-6 text-center text-sm text-text-muted">
                  Belum ada data untuk tanggal ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tombol aksi */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={addLogRow}>
          + Tambah Baris
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button variant="secondary" size="sm" onClick={handleExportPdf}>
          Export PDF (Rekap Semua)
        </Button>
      </div>

      {/* Grafik realisasi — di paling bawah halaman */}
      <CtafRealizationChart allLogs={logs} dailyLogs={dailyLogs} />

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
