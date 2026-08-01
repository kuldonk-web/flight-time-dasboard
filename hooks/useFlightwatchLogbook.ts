import { useEffect, useMemo, useState } from 'react';
import type { FlightwatchMovement, FlightwatchMovementInput, FlightwatchShiftMeta, ShiftInfo } from '@/types/flight';
import { useFlightwatchMovementStore } from '@/store/flightwatchMovementStore';
import { useFlightwatchShiftStore } from '@/store/flightwatchShiftStore';
import { useToast } from '@/components/ui/Toast';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  fetchAllFlightwatchMovements,
  insertFlightwatchMovement,
  updateFlightwatchMovement,
  deleteFlightwatchMovement,
  fetchAllFlightwatchShiftMeta,
  insertFlightwatchShiftMeta,
  updateFlightwatchShiftMeta,
} from '@/utils/flightwatchSupabaseSync';

function todayUtcDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const emptyShift: ShiftInfo = { officer: '', startTime: '', endTime: '', signature: '' };

function createEmptyShiftMeta(date: string): FlightwatchShiftMeta {
  const ts = new Date().toISOString();
  return { id: crypto.randomUUID(), date, shift1: { ...emptyShift }, shift2: { ...emptyShift }, createdAt: ts, updatedAt: ts };
}

/** Satu-satunya pintu masuk UI untuk baca/tulis Flightwatch Logbook (shift meta + baris pergerakan). */
export function useFlightwatchLogbook() {
  const movements = useFlightwatchMovementStore((s) => s.movements);
  const addMovementLocal = useFlightwatchMovementStore((s) => s.addMovement);
  const updateMovementLocal = useFlightwatchMovementStore((s) => s.updateMovement);
  const deleteMovementLocal = useFlightwatchMovementStore((s) => s.deleteMovement);

  const shiftEntries = useFlightwatchShiftStore((s) => s.shiftEntries);
  const addShiftEntryLocal = useFlightwatchShiftStore((s) => s.addShiftEntry);
  const updateShiftEntryLocal = useFlightwatchShiftStore((s) => s.updateShiftEntry);

  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(todayUtcDateStr());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    setIsSyncing(true);

    Promise.all([fetchAllFlightwatchMovements(), fetchAllFlightwatchShiftMeta()]).then(([movementResult, shiftResult]) => {
      if (cancelled) return;
      setIsSyncing(false);
      if (movementResult.success) {
        useFlightwatchMovementStore.setState({ movements: movementResult.movements });
      } else {
        showToast(`Gagal memuat data pergerakan dari cloud: ${movementResult.error}`, 'error');
      }
      if (shiftResult.success) {
        useFlightwatchShiftStore.setState({ shiftEntries: shiftResult.entries });
      } else {
        showToast(`Gagal memuat data shift dari cloud: ${shiftResult.error}`, 'error');
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dailyMovements = useMemo(() => movements.filter((m) => m.date === selectedDate), [movements, selectedDate]);

  const knownCallsigns = useMemo(
    () => Array.from(new Set(movements.map((m) => m.callsign).filter(Boolean))).sort(),
    [movements]
  );
  const knownOperators = useMemo(
    () => Array.from(new Set(movements.map((m) => m.operator).filter(Boolean))).sort(),
    [movements]
  );

  const existingShiftEntry = useMemo(() => shiftEntries.find((e) => e.date === selectedDate), [shiftEntries, selectedDate]);
  const shiftMeta = existingShiftEntry ?? createEmptyShiftMeta(selectedDate);

  function addMovementRow(): void {
    const ts = new Date().toISOString();
    const newRow: FlightwatchMovement = {
      id: crypto.randomUUID(),
      date: selectedDate,
      callsign: '',
      registrasi: '',
      aircraftType: '',
      depAirport: '',
      atd: '',
      destAirport: '',
      ata: '',
      operator: '',
      remarks: '',
      createdAt: ts,
      updatedAt: ts,
    };
    addMovementLocal(newRow);
    insertFlightwatchMovement(newRow).then((result) => {
      if (!result.success && isSupabaseConfigured) showToast(`Gagal sync ke cloud: ${result.error}`, 'error');
    });
  }

  function patchMovementRow(id: string, patch: Partial<FlightwatchMovementInput>): void {
    const updatedAt = new Date().toISOString();
    updateMovementLocal(id, { ...patch, updatedAt });
    const current = useFlightwatchMovementStore.getState().movements.find((m) => m.id === id);
    if (current) {
      updateFlightwatchMovement(current).then((result) => {
        if (!result.success && isSupabaseConfigured) showToast(`Gagal sync ke cloud: ${result.error}`, 'error');
      });
    }
  }

  function removeMovementRow(id: string): void {
    deleteMovementLocal(id);
    deleteFlightwatchMovement(id).then((result) => {
      if (!result.success && isSupabaseConfigured) showToast(`Gagal sync ke cloud: ${result.error}`, 'error');
    });
  }

  function patchShiftMeta(patch: Partial<FlightwatchShiftMeta>): void {
    const updatedAt = new Date().toISOString();
    const merged: FlightwatchShiftMeta = { ...shiftMeta, ...patch, updatedAt };
    if (existingShiftEntry) {
      updateShiftEntryLocal(existingShiftEntry.id, { ...patch, updatedAt });
      updateFlightwatchShiftMeta(merged).then((result) => {
        if (!result.success && isSupabaseConfigured) showToast(`Gagal sync ke cloud: ${result.error}`, 'error');
      });
    } else {
      addShiftEntryLocal(merged);
      insertFlightwatchShiftMeta(merged).then((result) => {
        if (!result.success && isSupabaseConfigured) showToast(`Gagal sync ke cloud: ${result.error}`, 'error');
      });
    }
  }

  return {
    movements, // semua tanggal — dipakai untuk grafik tren
    dailyMovements,
    knownCallsigns,
    knownOperators,
    shiftMeta,
    patchShiftMeta,
    selectedDate,
    setSelectedDate,
    addMovementRow,
    patchMovementRow,
    removeMovementRow,
    isSyncing,
    isCloudEnabled: isSupabaseConfigured,
  };
}
