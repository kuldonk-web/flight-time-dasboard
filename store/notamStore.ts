import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NotamEntry } from '@/types/flight';

interface NotamStoreState {
  notams: NotamEntry[];
  addNotam: (n: NotamEntry) => void;
  updateNotam: (id: string, patch: Partial<NotamEntry>) => void;
  deleteNotam: (id: string) => void;
}

export const useNotamStore = create<NotamStoreState>()(
  persist(
    (set) => ({
      notams: [],
      addNotam: (n) => set((state) => ({ notams: [...state.notams, n] })),
      updateNotam: (id, patch) =>
        set((state) => ({ notams: state.notams.map((n) => (n.id === id ? { ...n, ...patch } : n)) })),
      deleteNotam: (id) => set((state) => ({ notams: state.notams.filter((n) => n.id !== id) })),
    }),
    {
      name: 'notam-storage',
      partialize: (state) => ({ notams: state.notams }),
    }
  )
);
