'use client';

import { useAroLogbook } from '@/hooks/useAroLogbook';
import { ARO_STATION_INFO, FACILITY_ROWS } from '@/lib/constants';
import { Time24Input } from '@/components/flight-log/Time24Input';
import { SignaturePad } from '@/components/ui/SignaturePad';
import { AroLogbookRealizationChart } from '@/components/aro-logbook/AroLogbookRealizationChart';
import { exportAroLogEntryToPdf } from '@/utils/exportAroLogbookPdf';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { FacilityValue, FlightDataRow, ShiftInfo } from '@/types/flight';

const TIME_INPUT_CLASS =
  'h-8 w-20 rounded-sm border border-border bg-surface px-2 text-center font-data text-sm text-text-primary outline-none focus:bg-surface-raised';

const FLIGHT_DATA_COLUMNS: { key: keyof FlightDataRow; label: string; group: string }[] = [
  { key: 'fpl', label: 'FPL', group: 'DATA PENERBANGAN' },
  { key: 'dep', label: 'DEP', group: 'DATA PENERBANGAN' },
  { key: 'arr', label: 'ARR', group: 'DATA PENERBANGAN' },
  { key: 'chg', label: 'CHG', group: 'DATA PENERBANGAN' },
  { key: 'cnl', label: 'CNL', group: 'DATA PENERBANGAN' },
  { key: 'domScheduled', label: 'DOM', group: 'BERJADWAL' },
  { key: 'intScheduled', label: 'INT', group: 'BERJADWAL' },
  { key: 'domNonScheduled', label: 'DOM', group: 'TIDAK BERJADWAL' },
  { key: 'intNonScheduled', label: 'INT', group: 'TIDAK BERJADWAL' },
  { key: 'rta', label: 'RTA', group: 'KONDISI KHUSUS' },
  { key: 'rtb', label: 'RTB', group: 'KONDISI KHUSUS' },
  { key: 'div', label: 'DIV', group: 'KONDISI KHUSUS' },
  { key: 'post', label: 'POST', group: 'KONDISI KHUSUS' },
  { key: 'local', label: 'LOCAL', group: 'KONDISI KHUSUS' },
];

const SHIFT_KEYS = ['pagi', 'siang', 'malam'] as const;
type ShiftKey = (typeof SHIFT_KEYS)[number];
const SHIFT_LABEL: Record<ShiftKey, string> = { pagi: 'PAGI', siang: 'SIANG', malam: 'MALAM' };

function sumColumn(rows: FlightDataRow[], key: keyof FlightDataRow): number {
  return rows.reduce((total, row) => total + (row[key] || 0), 0);
}

export function AroLogbookForm() {
  const { entries, entry, selectedDate, setSelectedDate, patchEntry, knownOfficers, isSyncing, isCloudEnabled } =
    useAroLogbook();
  const { showToast } = useToast();

  function patchShift(shiftKey: 'shiftPagi' | 'shiftSiang' | 'shiftMalam', patch: Partial<ShiftInfo>) {
    patchEntry({ [shiftKey]: { ...entry[shiftKey], ...patch } });
  }

  function patchFlightData(shiftKey: ShiftKey, field: keyof FlightDataRow, value: number) {
    patchEntry({
      flightData: {
        ...entry.flightData,
        [shiftKey]: { ...entry.flightData[shiftKey], [field]: value },
      },
    });
  }

  function patchFacility(shiftKey: ShiftKey, field: keyof typeof entry.facilities.pagi, value: FacilityValue) {
    patchEntry({
      facilities: {
        ...entry.facilities,
        [shiftKey]: { ...entry.facilities[shiftKey], [field]: value },
      },
    });
  }

  function handleExportPdf() {
    exportAroLogEntryToPdf(entry);
    showToast(`Halaman ARO Logbook tanggal ${selectedDate} berhasil di-export ke PDF.`, 'success');
  }

  const flightRows = SHIFT_KEYS.map((key) => entry.flightData[key]);

  return (
    <div className="flex w-full flex-col gap-5 px-4 py-6">
      {/* Header / kop */}
      <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-surface-raised p-4">
        <div className="flex-1">
          <div className="text-sm font-semibold text-text-primary">{ARO_STATION_INFO.line1}</div>
          <div className="text-sm text-text-secondary">{ARO_STATION_INFO.line2}</div>
          <div className="text-sm text-text-secondary">{ARO_STATION_INFO.line3}</div>
        </div>
        {isCloudEnabled && (
          <span className="text-xs text-text-muted">{isSyncing ? 'Menyinkronkan…' : 'Cloud aktif'}</span>
        )}
        <div className="flex items-center gap-2">
          <label htmlFor="aro-date" className="text-xs font-medium text-text-secondary">
            Date (UTC)
          </label>
          <input
            id="aro-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-8 rounded-sm border border-border bg-surface px-2 font-data text-sm text-text-primary"
          />
        </div>
      </div>

      <h1 className="text-center font-display text-sm font-semibold uppercase tracking-wide text-text-primary">
        {ARO_STATION_INFO.title}
      </h1>

      {/* Blok shift */}
      <div className="flex flex-col gap-3 rounded-sm border border-border p-4">
        {(
          [
            ['shiftPagi', 'SHIFT PAGI'],
            ['shiftSiang', 'SHIFT SIANG'],
            ['shiftMalam', 'SHIFT MALAM'],
          ] as const
        ).map(([shiftField, label]) => {
          const shift = entry[shiftField];
          return (
            <div key={shiftField} className="flex flex-wrap items-center gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
              <span className="w-28 shrink-0 text-xs font-semibold text-text-secondary">{label}</span>
              <input
                list="aro-officer-options"
                value={shift.officer}
                onChange={(e) => patchShift(shiftField, { officer: e.target.value.toUpperCase() })}
                placeholder="Nama petugas"
                className="h-8 w-40 rounded-sm border border-border bg-surface px-2 text-sm text-text-primary outline-none focus:bg-surface-raised"
              />
              <SignaturePad value={shift.signature} onChange={(v) => patchShift(shiftField, { signature: v })} />
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">TIME:</span>
                <Time24Input
                  value={shift.startTime}
                  onChange={(v) => patchShift(shiftField, { startTime: v })}
                  className={TIME_INPUT_CLASS}
                />
                <span className="text-xs text-text-secondary">–</span>
                <Time24Input
                  value={shift.endTime}
                  onChange={(v) => patchShift(shiftField, { endTime: v })}
                  className={TIME_INPUT_CLASS}
                />
                <span className="text-xs text-text-secondary">UTC</span>
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs font-semibold text-text-secondary">PERGANTIAN DINAS PUKUL :</span>
          <Time24Input
            value={entry.dutyChangeTime}
            onChange={(v) => patchEntry({ dutyChangeTime: v })}
            className={TIME_INPUT_CLASS}
          />
          <span className="text-xs text-text-secondary">UTC</span>
        </div>
      </div>

      <datalist id="aro-officer-options">
        {knownOfficers.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {/* Tabel Data Penerbangan */}
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full min-w-[900px] border-collapse text-xs">
          <thead>
            <tr className="bg-surface-raised text-[10px] uppercase tracking-wide text-text-secondary">
              <th rowSpan={2} className="border border-border px-2 py-1">Shift</th>
              <th colSpan={5} className="border border-border px-2 py-1">Data Penerbangan</th>
              <th colSpan={2} className="border border-border px-2 py-1">Berjadwal</th>
              <th colSpan={2} className="border border-border px-2 py-1">Tidak Berjadwal</th>
              <th colSpan={5} className="border border-border px-2 py-1">Kondisi Khusus</th>
            </tr>
            <tr className="bg-surface-raised text-[10px] uppercase tracking-wide text-text-secondary">
              {FLIGHT_DATA_COLUMNS.map((col) => (
                <th key={col.key} className="border border-border px-1 py-1">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIFT_KEYS.map((shiftKey) => (
              <tr key={shiftKey} className="odd:bg-surface even:bg-surface/60">
                <td className="border border-border px-2 py-1 text-center font-semibold text-text-secondary">
                  {SHIFT_LABEL[shiftKey]}
                </td>
                {FLIGHT_DATA_COLUMNS.map((col) => (
                  <td key={col.key} className="border border-border p-0">
                    <input
                      type="number"
                      min={0}
                      value={entry.flightData[shiftKey][col.key] || ''}
                      onChange={(e) => patchFlightData(shiftKey, col.key, Number(e.target.value) || 0)}
                      className="h-8 w-full bg-transparent px-1 text-center font-data text-xs text-text-primary outline-none focus:bg-surface-raised"
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-surface-raised font-semibold text-text-primary">
              <td className="border border-border px-2 py-1 text-center">JUMLAH</td>
              {FLIGHT_DATA_COLUMNS.map((col) => (
                <td key={col.key} className="border border-border px-1 py-1 text-center font-data">
                  {sumColumn(flightRows, col.key)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Kondisi Fasilitas + Catatan Operasional */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="overflow-x-auto rounded-sm border border-border lg:w-[420px] lg:shrink-0">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-surface-raised text-[10px] uppercase tracking-wide text-text-secondary">
                <th rowSpan={2} className="border border-border px-2 py-1">Peralatan</th>
                <th colSpan={3} className="border border-border px-2 py-1">Shift</th>
              </tr>
              <tr className="bg-surface-raised text-[10px] uppercase tracking-wide text-text-secondary">
                {SHIFT_KEYS.map((k) => (
                  <th key={k} className="border border-border px-2 py-1">
                    {SHIFT_LABEL[k]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FACILITY_ROWS.map((row) => (
                <tr key={row.key} className="odd:bg-surface even:bg-surface/60">
                  <td className="border border-border px-2 py-1 font-medium text-text-secondary">{row.label}</td>
                  {SHIFT_KEYS.map((shiftKey) => (
                    <td key={shiftKey} className="border border-border p-0">
                      <select
                        value={entry.facilities[shiftKey][row.key]}
                        onChange={(e) => patchFacility(shiftKey, row.key, e.target.value as FacilityValue)}
                        className="h-8 w-full bg-transparent px-1 text-center text-xs text-text-primary outline-none focus:bg-surface-raised"
                      >
                        <option value="">-</option>
                        <option value="V">V</option>
                        <option value="-">-</option>
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Catatan Operasional
          </span>
          <textarea
            value={entry.operationalNotes}
            onChange={(e) => patchEntry({ operationalNotes: e.target.value })}
            placeholder="Catatan operasional hari ini…"
            className="min-h-[180px] flex-1 resize-none rounded-sm border border-border bg-surface p-3 text-sm text-text-primary outline-none focus:bg-surface-raised"
          />
        </div>
      </div>

      {/* Tombol aksi */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={handleExportPdf}>
          Export PDF (Halaman Ini)
        </Button>
      </div>

      {/* Grafik realisasi — di PALING BAWAH halaman */}
      <AroLogbookRealizationChart allEntries={entries} entry={entry} />
    </div>
  );
}
