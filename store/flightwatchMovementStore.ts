import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FlightwatchMovement } from '@/types/flight';

interface FlightwatchMovementStoreState {
  movements: FlightwatchMovement[];
  addMovement: (m: FlightwatchMovement) => void;
  updateMovement: (id: string, patch: Partial<FlightwatchMovement>) => void;
  deleteMovement: (id: string) => void;
}

export const useFlightwatchMovementStore = create<FlightwatchMovementStoreState>()(
  persist(
    (set) => ({
      movements: [],
      addMovement: (m) => set((state) => ({ movements: [...state.movements, m] })),
      updateMovement: (id, patch) =>
        set((state) => ({
          movements: state.movements.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      deleteMovement: (id) => set((state) => ({ movements: state.movements.filter((m) => m.id !== id) })),
    }),
    {
      name: 'flightwatch-movement-storage',
      partialize: (state) => ({ movements: state.movements }),
    }
  )
);
