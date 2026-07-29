import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * true kalau env var Supabase sudah diisi. Dipakai di seluruh app untuk
 * memutuskan apakah fitur cloud sync aktif atau app jalan mode local-only
 * (misalnya saat development tanpa koneksi Supabase).
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Client Supabase. Kalau env var belum diisi, tetap dibuat dengan value dummy
 * supaya tidak crash saat import — tapi semua pemanggil WAJIB cek
 * `isSupabaseConfigured` dulu sebelum benar-benar memakainya.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
