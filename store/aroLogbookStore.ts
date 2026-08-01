import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AroLogEntry } from '@/types/flight';

interface AroLogbookStoreState {
  entries: AroLogEntry[];
  addEntry: (entry: AroLogEntry) => void;
  updateEntry: (id: string, patch: Partial<AroLogEntry>) => void;
}

/** Store "bodoh": satu record per tanggal. Tidak ada deleteEntry — datanya adalah arsip harian. */
export const useAroLogbookStore = create<AroLogbookStoreState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),
      updateEntry: (id, patch) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
    }),
    {
      name: 'aro-logbook-storage',
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);
