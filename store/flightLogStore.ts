import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FlightLog } from '@/types/flight';
import { LOCAL_STORAGE_KEY } from '@/lib/constants';

/**
 * Store ini sengaja "bodoh" (dumb) — hanya operasi CRUD mentah di atas array logs.
 * Logika bisnis (generate id, timestamp, validasi) ada di hooks/useFlightLogs.ts,
 * supaya store tetap gampang ditest dan tidak tercampur concern UI/business logic.
 */
interface FlightLogStoreState {
  logs: FlightLog[];
  addLog: (log: FlightLog) => void;
  updateLog: (id: string, patch: Partial<FlightLog>) => void;
  deleteLog: (id: string) => void;
  /** Timpa seluruh data logs sekaligus — dipakai untuk fitur import "Replace All". */
  setLogs: (logs: FlightLog[]) => void;
  /** Tambah banyak log sekaligus tanpa menghapus yang lama — dipakai untuk import "Merge". */
  addLogs: (logs: FlightLog[]) => void;
}

export const useFlightLogStore = create<FlightLogStoreState>()(
  persist(
    (set) => ({
      logs: [],

      addLog: (log) =>
        set((state) => ({
          logs: [...state.logs, log],
        })),

      updateLog: (id, patch) =>
        set((state) => ({
          logs: state.logs.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),

      deleteLog: (id) =>
        set((state) => ({
          logs: state.logs.filter((l) => l.id !== id),
        })),

      setLogs: (logs) => set({ logs }),

      addLogs: (newLogs) =>
        set((state) => ({
          logs: [...state.logs, ...newLogs],
        })),
    }),
    {
      name: LOCAL_STORAGE_KEY,
      // Hanya persist field `logs`. Kalau nanti ada field lain di store
      // (misal UI state), ini mencegah ikut kesimpan ke localStorage.
      partialize: (state) => ({ logs: state.logs }),
    }
  )
);
