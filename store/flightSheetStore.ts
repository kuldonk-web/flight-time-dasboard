import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FlightSheetRow } from '@/types/flight';

interface FlightSheetStoreState {
  logs: FlightSheetRow[];
  addLog: (log: FlightSheetRow) => void;
  updateLog: (id: string, patch: Partial<FlightSheetRow>) => void;
  deleteLog: (id: string) => void;
}

/**
 * Store "bodoh" untuk tabel gabungan Departure/Arrival/Lokal.
 * Menggantikan departureLogStore.ts + arrivalLogStore.ts dari iterasi sebelumnya —
 * file-file itu boleh dihapus dari project setelah ini terpasang.
 */
export const useFlightSheetStore = create<FlightSheetStoreState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
      updateLog: (id, patch) =>
        set((state) => ({
          logs: state.logs.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),
      deleteLog: (id) => set((state) => ({ logs: state.logs.filter((l) => l.id !== id) })),
    }),
    {
      name: 'flight-sheet-storage',
      partialize: (state) => ({ logs: state.logs }),
    }
  )
);
