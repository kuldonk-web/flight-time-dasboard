import type { AroLogEntry } from '@/types/flight';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const TABLE = 'aro_logbook_entries';

export interface SyncResult {
  success: boolean;
  error?: string;
}

/** camelCase (app) -> snake_case (kolom Supabase). Field kompleks disimpan sebagai jsonb. */
function toRow(entry: AroLogEntry) {
  return {
    id: entry.id,
    date: entry.date,
    duty_change_time: entry.dutyChangeTime || null,
    shift_pagi: entry.shiftPagi,
    shift_siang: entry.shiftSiang,
    shift_malam: entry.shiftMalam,
    flight_data: entry.flightData,
    facilities: entry.facilities,
    operational_notes: entry.operationalNotes,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  };
}

function fromRow(r: Record<string, unknown>): AroLogEntry {
  return {
    id: r.id as string,
    date: r.date as string,
    dutyChangeTime: (r.duty_change_time as string) ?? '',
    shiftPagi: r.shift_pagi as AroLogEntry['shiftPagi'],
    shiftSiang: r.shift_siang as AroLogEntry['shiftSiang'],
    shiftMalam: r.shift_malam as AroLogEntry['shiftMalam'],
    flightData: r.flight_data as AroLogEntry['flightData'],
    facilities: r.facilities as AroLogEntry['facilities'],
    operationalNotes: (r.operational_notes as string) ?? '',
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function fetchAllAroLogEntries(): Promise<{ entries: AroLogEntry[] } & SyncResult> {
  if (!isSupabaseConfigured) return { success: false, entries: [], error: 'Supabase belum dikonfigurasi.' };

  const { data, error } = await supabase.from(TABLE).select('*').order('date', { ascending: true });
  if (error) return { success: false, entries: [], error: error.message };
  return { success: true, entries: (data ?? []).map(fromRow) };
}

export async function insertAroLogEntry(entry: AroLogEntry): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(TABLE).insert(toRow(entry));
  return error ? { success: false, error: error.message } : { success: true };
}

export async function updateAroLogEntry(entry: AroLogEntry): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(TABLE).update(toRow(entry)).eq('id', entry.id);
  return error ? { success: false, error: error.message } : { success: true };
}
