import { useEffect, useMemo, useState } from 'react';
import type { NotamEntry, NotamEntryInput } from '@/types/flight';
import { useNotamStore } from '@/store/notamStore';
import { useToast } from '@/components/ui/Toast';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { fetchAllNotams, insertNotam, updateNotam, deleteNotam } from '@/utils/notamSupabaseSync';

function todayUtcDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Satu-satunya pintu masuk UI untuk baca/tulis database NOTAM. */
export function useNotamViewer() {
  const notams = useNotamStore((s) => s.notams);
  const addNotamLocal = useNotamStore((s) => s.addNotam);
  const updateNotamLocal = useNotamStore((s) => s.updateNotam);
  const deleteNotamLocal = useNotamStore((s) => s.deleteNotam);

  const { showToast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    setIsSyncing(true);

    fetchAllNotams().then((result) => {
      if (cancelled) return;
      setIsSyncing(false);
      if (result.success) {
        useNotamStore.setState({ notams: result.notams });
      } else {
        showToast(`Gagal memuat data NOTAM dari cloud: ${result.error}. Menampilkan data lokal.`, 'error');
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedNotams = useMemo(
    () => [...notams].sort((a, b) => (a.closingDate < b.closingDate ? -1 : 1)),
    [notams]
  );

  const today = todayUtcDateStr();
  const activeCount = useMemo(() => notams.filter((n) => !n.closingDate || n.closingDate >= today).length, [notams, today]);
  const expiredCount = notams.length - activeCount;

  function createNotam(input: NotamEntryInput): void {
    const ts = new Date().toISOString();
    const newNotam: NotamEntry = { ...input, id: crypto.randomUUID(), createdAt: ts, updatedAt: ts };
    addNotamLocal(newNotam);
    insertNotam(newNotam).then((result) => {
      if (!result.success && isSupabaseConfigured) {
        showToast(`Tersimpan lokal, tapi gagal sync ke cloud: ${result.error}`, 'error');
      }
    });
  }

  function editNotam(id: string, patch: Partial<NotamEntryInput>): void {
    const updatedAt = new Date().toISOString();
    updateNotamLocal(id, { ...patch, updatedAt });
    const current = useNotamStore.getState().notams.find((n) => n.id === id);
    if (current) {
      updateNotam(current).then((result) => {
        if (!result.success && isSupabaseConfigured) {
          showToast(`Perubahan tersimpan lokal, tapi gagal sync ke cloud: ${result.error}`, 'error');
        }
      });
    }
  }

  function removeNotam(id: string): void {
    deleteNotamLocal(id);
    deleteNotam(id).then((result) => {
      if (!result.success && isSupabaseConfigured) {
        showToast(`Terhapus lokal, tapi gagal sync ke cloud: ${result.error}`, 'error');
      }
    });
  }

  return {
    notams: sortedNotams,
    activeCount,
    expiredCount,
    createNotam,
    editNotam,
    removeNotam,
    isSyncing,
    isCloudEnabled: isSupabaseConfigured,
  };
}
