import type { NotamEntry } from '@/types/flight';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const TABLE = 'notam_entries';

export interface SyncResult {
  success: boolean;
  error?: string;
}

function toRow(n: NotamEntry) {
  return {
    id: n.id,
    notam_number: n.notamNumber,
    description: n.description,
    closing_date: n.closingDate || null,
    document_link: n.documentLink,
    created_at: n.createdAt,
    updated_at: n.updatedAt,
  };
}

function fromRow(r: Record<string, unknown>): NotamEntry {
  return {
    id: r.id as string,
    notamNumber: (r.notam_number as string) ?? '',
    description: (r.description as string) ?? '',
    closingDate: (r.closing_date as string) ?? '',
    documentLink: (r.document_link as string) ?? '',
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function fetchAllNotams(): Promise<{ notams: NotamEntry[] } & SyncResult> {
  if (!isSupabaseConfigured) return { success: false, notams: [], error: 'Supabase belum dikonfigurasi.' };
  const { data, error } = await supabase.from(TABLE).select('*').order('closing_date', { ascending: true });
  if (error) return { success: false, notams: [], error: error.message };
  return { success: true, notams: (data ?? []).map(fromRow) };
}

export async function insertNotam(n: NotamEntry): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(TABLE).insert(toRow(n));
  return error ? { success: false, error: error.message } : { success: true };
}

export async function updateNotam(n: NotamEntry): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(TABLE).update(toRow(n)).eq('id', n.id);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function deleteNotam(id: string): Promise<SyncResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return error ? { success: false, error: error.message } : { success: true };
}
