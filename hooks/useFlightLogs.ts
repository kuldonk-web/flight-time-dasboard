import { useMemo, useState } from 'react';
import type { FlightLog, FlightLogFilterState, FlightLogInput } from '@/types/flight';
import { useFlightLogStore } from '@/store/flightLogStore';
import { DEFAULT_FILTERS, filterLogs, sortLogsByDateDesc } from '@/utils/filter';
import { calculateFlightStats } from '@/utils/stats';
import { nowISO } from '@/utils/time';

/**
 * Satu-satunya pintu masuk yang dipakai komponen UI untuk baca/tulis data FlightLog.
 * Komponen tidak pernah import useFlightLogStore langsung — semua lewat hook ini,
 * supaya logic id-generation & filtering tidak terduplikasi di banyak komponen.
 */
export function useFlightLogs() {
  const logs = useFlightLogStore((s) => s.logs);
  const addLog = useFlightLogStore((s) => s.addLog);
  const updateLog = useFlightLogStore((s) => s.updateLog);
  const deleteLog = useFlightLogStore((s) => s.deleteLog);
  const setLogs = useFlightLogStore((s) => s.setLogs);
  const addLogs = useFlightLogStore((s) => s.addLogs);

  const [filters, setFilters] = useState<FlightLogFilterState>(DEFAULT_FILTERS);

  const filteredLogs = useMemo(() => sortLogsByDateDesc(filterLogs(logs, filters)), [logs, filters]);
  const stats = useMemo(() => calculateFlightStats(filteredLogs), [filteredLogs]);

  /** Buat entry baru dari form input: generate id + createdAt/updatedAt otomatis. */
  function createLog(input: FlightLogInput): FlightLog {
    const timestamp = nowISO();
    const newLog: FlightLog = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    addLog(newLog);
    return newLog;
  }

  /** Edit entry: patch field yang berubah, updatedAt selalu di-refresh. */
  function editLog(id: string, patch: Partial<FlightLogInput>): void {
    updateLog(id, { ...patch, updatedAt: nowISO() });
  }

  function removeLog(id: string): void {
    deleteLog(id);
  }

  function resetFilters(): void {
    setFilters(DEFAULT_FILTERS);
  }

  return {
    // data
    logs,
    filteredLogs,
    stats,

    // filter state
    filters,
    setFilters,
    resetFilters,

    // CRUD
    createLog,
    editLog,
    removeLog,

    // dipakai khusus oleh fitur import (Tahap 5)
    replaceAllLogs: setLogs,
    mergeLogs: addLogs,
  };
}
