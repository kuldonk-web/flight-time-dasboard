import type { CtafLogEntry, CtafShiftMeta } from '@/types/flight';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const LOG_TABLE = 'ctaf_log_entries';
const SHIFT_TABLE = 'ctaf_shift_meta';

export interface SyncResult {
  success: boolean;
  error?: string;
}

/* ---------- Log entries ---------- */

function logToRow(l: CtafLogEntry) {
  return {
    id: l.id,
    date: l.date,
    unattended_unit: l.unattendedUnit,
    procedure: l.procedure,
    time_start: l.timeStart || null,
    time_end: l.timeEnd || null,
    operational_log: l.operationalLog,
    created_at: l.createdAt,
    updated_at: l.updatedAt,
  };
}

function logFromRow(r: Record<string, unknown>): CtafLogEntry {
  return {
    id: r.id as string,
    date: r.date as string,
    unattendedUnit: (r.unattended_unit as string) ?? '',
    procedure: (r.procedure as string) ?? '',
    timeStart: (r.time_start as string) ?? '',
    timeEnd: (r.time_end as string) ?? '',
    operationalLog: (r.operational_log as string) ?? '',
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function fetchAllCtafLogs(): Promise<{ logs: CtafLogEntry[] } & SyncResult> {
  if (!isSupabaseConfigured) return { success: false, logs: [], error: 'Supabase belum dikonfigurasi.' };
  const { data, error } = await supabase
    .from(LOG_TABLE)
    .select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return { success: false, logs: [], error: error.message };
  return { success: true, logs: (data ?? []).map(logFromRow) };
}

export async function insertCtafLog(l: CtafLogEntry): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(LOG_TABLE).insert(logToRow(l));
  return error ? { success: false, error: error.message } : { success: true };
}

export async function updateCtafLog(l: CtafLogEntry): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(LOG_TABLE).update(logToRow(l)).eq('id', l.id);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function deleteCtafLog(id: string): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(LOG_TABLE).delete().eq('id', id);
  return error ? { success: false, error: error.message } : { success: true };
}

/* ---------- Shift meta ---------- */

function shiftToRow(s: CtafShiftMeta) {
  return {
    id: s.id,
    date: s.date,
    shift1: s.shift1,
    shift2: s.shift2,
    transfer_of_duty_time: s.transferOfDutyTime || null,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

function shiftFromRow(r: Record<string, unknown>): CtafShiftMeta {
  return {
    id: r.id as string,
    date: r.date as string,
    shift1: r.shift1 as CtafShiftMeta['shift1'],
    shift2: r.shift2 as CtafShiftMeta['shift2'],
    transferOfDutyTime: (r.transfer_of_duty_time as string) ?? '',
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function fetchAllCtafShiftMeta(): Promise<{ entries: CtafShiftMeta[] } & SyncResult> {
  if (!isSupabaseConfigured) return { success: false, entries: [], error: 'Supabase belum dikonfigurasi.' };
  const { data, error } = await supabase.from(SHIFT_TABLE).select('*').order('date', { ascending: true });
  if (error) return { success: false, entries: [], error: error.message };
  return { success: true, entries: (data ?? []).map(shiftFromRow) };
}

export async function insertCtafShiftMeta(s: CtafShiftMeta): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(SHIFT_TABLE).insert(shiftToRow(s));
  return error ? { success: false, error: error.message } : { success: true };
}

export async function updateCtafShiftMeta(s: CtafShiftMeta): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(SHIFT_TABLE).update(shiftToRow(s)).eq('id', s.id);
  return error ? { success: false, error: error.message } : { success: true };
}
