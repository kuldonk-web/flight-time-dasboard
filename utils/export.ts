import type { FlightLog, FlightLogExportPayload } from '@/types/flight';
import { EXPORT_SCHEMA_VERSION } from '@/lib/constants';

/**
 * Serialize logs jadi file JSON dan trigger download browser.
 * Nama file otomatis mengandung tanggal hari ini, e.g. "flight-log-backup-2026-07-28.json".
 */
export function exportLogsToJson(logs: FlightLog[]): void {
  const payload: FlightLogExportPayload = {
    version: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    logs,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);

  const link = document.createElement('a');
  link.href = url;
  link.download = `flight-log-backup-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validasi minimal struktur satu entry sebelum diterima sebagai FlightLog.
 * Sengaja hanya mengecek field wajib & tipe dasar — bukan validasi bisnis
 * lengkap (itu tanggung jawab utils/validation.ts saat input lewat form).
 */
export function validateFlightLogShape(obj: unknown): obj is FlightLog {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;

  const requiredStringFields = [
    'id',
    'flightNumber',
    'aircraftType',
    'flightLevel',
    'departureAirport',
    'destinationAirport',
    'date',
    'estimatedDeparture',
    'estimatedArrival',
    'status',
    'createdAt',
    'updatedAt',
  ];

  return requiredStringFields.every((field) => typeof o[field] === 'string' && o[field] !== '');
}

export interface ImportResult {
  success: boolean;
  logs: FlightLog[];
  validCount: number;
  invalidCount: number;
  error?: string;
}

/**
 * Baca file JSON yang diupload user, parse, lalu validasi tiap entry satu-satu.
 * Entry yang rusak/tidak valid di-skip (tidak menggagalkan keseluruhan import),
 * tapi dilaporkan jumlahnya lewat invalidCount supaya user tahu ada yang terlewat.
 */
export async function importLogsFromJson(file: File): Promise<ImportResult> {
  let rawText: string;
  try {
    rawText = await file.text();
  } catch {
    return { success: false, logs: [], validCount: 0, invalidCount: 0, error: 'Gagal membaca file.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      success: false,
      logs: [],
      validCount: 0,
      invalidCount: 0,
      error: 'File bukan JSON yang valid.',
    };
  }

  const rawLogs = Array.isArray((parsed as Partial<FlightLogExportPayload>)?.logs)
    ? (parsed as FlightLogExportPayload).logs
    : Array.isArray(parsed)
      ? (parsed as unknown[])
      : null;

  if (!rawLogs) {
    return {
      success: false,
      logs: [],
      validCount: 0,
      invalidCount: 0,
      error: 'Struktur file tidak dikenali. Pastikan ini file backup dari fitur Export.',
    };
  }

  const validLogs: FlightLog[] = [];
  let invalidCount = 0;

  for (const item of rawLogs) {
    if (validateFlightLogShape(item)) {
      validLogs.push(item);
    } else {
      invalidCount++;
    }
  }

  return {
    success: validLogs.length > 0,
    logs: validLogs,
    validCount: validLogs.length,
    invalidCount,
    error: validLogs.length === 0 ? 'Tidak ada entry valid yang ditemukan di file ini.' : undefined,
  };
}

/**
 * Gabungkan log hasil import dengan log lokal, skip id yang sudah ada
 * (dipakai untuk strategi "Merge" — lawan dari "Replace All").
 */
export function mergeUniqueByIds(existingLogs: FlightLog[], importedLogs: FlightLog[]): FlightLog[] {
  const existingIds = new Set(existingLogs.map((l) => l.id));
  return importedLogs.filter((l) => !existingIds.has(l.id));
}
