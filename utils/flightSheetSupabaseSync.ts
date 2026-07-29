import type { FlightSheetRow } from '@/types/flight';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const TABLE = 'flight_sheet_rows';

export interface SyncResult {
  success: boolean;
  error?: string;
}

/** camelCase (app) -> snake_case (kolom tabel Supabase). */
function toRow(row: FlightSheetRow) {
  return {
    id: row.id,
    date: row.date,
    kind: row.kind,
    callsign: row.callsign,
    registrasi: row.registrasi,
    alt_fl: row.altFl,
    aircraft_type: row.aircraftType,
    route: row.route,
    airport: row.airport,
    eobt: row.eobt || null,
    atd: row.atd || null,
    eta: row.eta || null,
    ata: row.ata || null,
    status: row.status,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

/** snake_case (row Supabase) -> camelCase (FlightSheetRow). */
function fromRow(r: Record<string, unknown>): FlightSheetRow {
  return {
    id: r.id as string,
    date: r.date as string,
    kind: r.kind as FlightSheetRow['kind'],
    callsign: (r.callsign as string) ?? '',
    registrasi: (r.registrasi as string) ?? '',
    altFl: (r.alt_fl as string) ?? '',
    aircraftType: (r.aircraft_type as string) ?? '',
    route: (r.route as string) ?? '',
    airport: (r.airport as string) ?? '',
    eobt: (r.eobt as string) ?? '',
    atd: (r.atd as string) ?? '',
    eta: (r.eta as string) ?? '',
    ata: (r.ata as string) ?? '',
    status: (r.status as FlightSheetRow['status']) ?? '',
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

/** Ambil semua baris dari Supabase, urut tanggal lalu jam dibuat. */
export async function fetchAllFlightSheetRows(): Promise<{ rows: FlightSheetRow[] } & SyncResult> {
  if (!isSupabaseConfigured) return { success: false, rows: [], error: 'Supabase belum dikonfigurasi.' };

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return { success: false, rows: [], error: error.message };
  return { success: true, rows: (data ?? []).map(fromRow) };
}

export async function insertFlightSheetRow(row: FlightSheetRow): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(TABLE).insert(toRow(row));
  return error ? { success: false, error: error.message } : { success: true };
}

export async function updateFlightSheetRow(row: FlightSheetRow): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(TABLE).update(toRow(row)).eq('id', row.id);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function deleteFlightSheetRow(id: string): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return error ? { success: false, error: error.message } : { success: true };
}
