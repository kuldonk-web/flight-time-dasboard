import type { FlightwatchMovement, FlightwatchShiftMeta } from '@/types/flight';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const MOVEMENT_TABLE = 'flightwatch_movements';
const SHIFT_TABLE = 'flightwatch_shift_meta';

export interface SyncResult {
  success: boolean;
  error?: string;
}

/* ---------- Movements ---------- */

function movementToRow(m: FlightwatchMovement) {
  return {
    id: m.id,
    date: m.date,
    callsign: m.callsign,
    registrasi: m.registrasi,
    aircraft_type: m.aircraftType,
    dep_airport: m.depAirport,
    atd: m.atd || null,
    dest_airport: m.destAirport,
    ata: m.ata || null,
    operator: m.operator,
    remarks: m.remarks,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}

function movementFromRow(r: Record<string, unknown>): FlightwatchMovement {
  return {
    id: r.id as string,
    date: r.date as string,
    callsign: (r.callsign as string) ?? '',
    registrasi: (r.registrasi as string) ?? '',
    aircraftType: (r.aircraft_type as string) ?? '',
    depAirport: (r.dep_airport as string) ?? '',
    atd: (r.atd as string) ?? '',
    destAirport: (r.dest_airport as string) ?? '',
    ata: (r.ata as string) ?? '',
    operator: (r.operator as string) ?? '',
    remarks: (r.remarks as string) ?? '',
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function fetchAllFlightwatchMovements(): Promise<{ movements: FlightwatchMovement[] } & SyncResult> {
  if (!isSupabaseConfigured) return { success: false, movements: [], error: 'Supabase belum dikonfigurasi.' };
  const { data, error } = await supabase
    .from(MOVEMENT_TABLE)
    .select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return { success: false, movements: [], error: error.message };
  return { success: true, movements: (data ?? []).map(movementFromRow) };
}

export async function insertFlightwatchMovement(m: FlightwatchMovement): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(MOVEMENT_TABLE).insert(movementToRow(m));
  return error ? { success: false, error: error.message } : { success: true };
}

export async function updateFlightwatchMovement(m: FlightwatchMovement): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(MOVEMENT_TABLE).update(movementToRow(m)).eq('id', m.id);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function deleteFlightwatchMovement(id: string): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(MOVEMENT_TABLE).delete().eq('id', id);
  return error ? { success: false, error: error.message } : { success: true };
}

/* ---------- Shift meta ---------- */

function shiftToRow(s: FlightwatchShiftMeta) {
  return {
    id: s.id,
    date: s.date,
    shift1: s.shift1,
    shift2: s.shift2,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

function shiftFromRow(r: Record<string, unknown>): FlightwatchShiftMeta {
  return {
    id: r.id as string,
    date: r.date as string,
    shift1: r.shift1 as FlightwatchShiftMeta['shift1'],
    shift2: r.shift2 as FlightwatchShiftMeta['shift2'],
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function fetchAllFlightwatchShiftMeta(): Promise<{ entries: FlightwatchShiftMeta[] } & SyncResult> {
  if (!isSupabaseConfigured) return { success: false, entries: [], error: 'Supabase belum dikonfigurasi.' };
  const { data, error } = await supabase.from(SHIFT_TABLE).select('*').order('date', { ascending: true });
  if (error) return { success: false, entries: [], error: error.message };
  return { success: true, entries: (data ?? []).map(shiftFromRow) };
}

export async function insertFlightwatchShiftMeta(s: FlightwatchShiftMeta): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(SHIFT_TABLE).insert(shiftToRow(s));
  return error ? { success: false, error: error.message } : { success: true };
}

export async function updateFlightwatchShiftMeta(s: FlightwatchShiftMeta): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(SHIFT_TABLE).update(shiftToRow(s)).eq('id', s.id);
  return error ? { success: false, error: error.message } : { success: true };
}
