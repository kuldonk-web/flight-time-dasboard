import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CtafLogEntry } from '@/types/flight';

interface CtafLogStoreState {
  logs: CtafLogEntry[];
  addLog: (log: CtafLogEntry) => void;
  updateLog: (id: string, patch: Partial<CtafLogEntry>) => void;
  deleteLog: (id: string) => void;
}

export const useCtafLogStore = create<CtafLogStoreState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
      updateLog: (id, patch) =>
        set((state) => ({ logs: state.logs.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
      deleteLog: (id) => set((state) => ({ logs: state.logs.filter((l) => l.id !== id) })),
    }),
    {
      name: 'ctaf-log-storage',
      partialize: (state) => ({ logs: state.logs }),
    }
  )
);
