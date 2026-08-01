import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FlightwatchShiftMeta } from '@/types/flight';

interface FlightwatchShiftStoreState {
  shiftEntries: FlightwatchShiftMeta[];
  addShiftEntry: (entry: FlightwatchShiftMeta) => void;
  updateShiftEntry: (id: string, patch: Partial<FlightwatchShiftMeta>) => void;
}

export const useFlightwatchShiftStore = create<FlightwatchShiftStoreState>()(
  persist(
    (set) => ({
      shiftEntries: [],
      addShiftEntry: (entry) => set((state) => ({ shiftEntries: [...state.shiftEntries, entry] })),
      updateShiftEntry: (id, patch) =>
        set((state) => ({
          shiftEntries: state.shiftEntries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
    }),
    {
      name: 'flightwatch-shift-storage',
      partialize: (state) => ({ shiftEntries: state.shiftEntries }),
    }
  )
);
