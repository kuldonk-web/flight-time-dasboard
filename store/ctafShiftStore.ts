import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CtafShiftMeta } from '@/types/flight';

interface CtafShiftStoreState {
  shiftEntries: CtafShiftMeta[];
  addShiftEntry: (entry: CtafShiftMeta) => void;
  updateShiftEntry: (id: string, patch: Partial<CtafShiftMeta>) => void;
}

export const useCtafShiftStore = create<CtafShiftStoreState>()(
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
      name: 'ctaf-shift-storage',
      partialize: (state) => ({ shiftEntries: state.shiftEntries }),
    }
  )
);
