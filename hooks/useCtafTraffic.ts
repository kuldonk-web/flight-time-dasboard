import { useEffect, useMemo, useState } from 'react';
import type { CtafLogEntry, CtafLogEntryInput, CtafShiftInfo, CtafShiftMeta } from '@/types/flight';
import { useCtafLogStore } from '@/store/ctafLogStore';
import { useCtafShiftStore } from '@/store/ctafShiftStore';
import { useToast } from '@/components/ui/Toast';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  fetchAllCtafLogs,
  insertCtafLog,
  updateCtafLog,
  deleteCtafLog,
  fetchAllCtafShiftMeta,
  insertCtafShiftMeta,
  updateCtafShiftMeta,
} from '@/utils/ctafSupabaseSync';

function todayUtcDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const emptyCtafShift: CtafShiftInfo = { officer: '', time: '', signature: '' };

function createEmptyShiftMeta(date: string): CtafShiftMeta {
  const ts = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    date,
    shift1: { ...emptyCtafShift },
    shift2: { ...emptyCtafShift },
    transferOfDutyTime: '',
    createdAt: ts,
    updatedAt: ts,
  };
}

/** Satu-satunya pintu masuk UI untuk baca/tulis CTAF Traffic (shift meta + baris log monitoring). */
export function useCtafTraffic() {
  const logs = useCtafLogStore((s) => s.logs);
  const addLogLocal = useCtafLogStore((s) => s.addLog);
  const updateLogLocal = useCtafLogStore((s) => s.updateLog);
  const deleteLogLocal = useCtafLogStore((s) => s.deleteLog);

  const shiftEntries = useCtafShiftStore((s) => s.shiftEntries);
  const addShiftEntryLocal = useCtafShiftStore((s) => s.addShiftEntry);
  const updateShiftEntryLocal = useCtafShiftStore((s) => s.updateShiftEntry);

  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(todayUtcDateStr());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    setIsSyncing(true);

    Promise.all([fetchAllCtafLogs(), fetchAllCtafShiftMeta()]).then(([logResult, shiftResult]) => {
      if (cancelled) return;
      setIsSyncing(false);
      if (logResult.success) {
        useCtafLogStore.setState({ logs: logResult.logs });
      } else {
        showToast(`Gagal memuat data log dari cloud: ${logResult.error}`, 'error');
      }
      if (shiftResult.success) {
        useCtafShiftStore.setState({ shiftEntries: shiftResult.entries });
      } else {
        showToast(`Gagal memuat data shift dari cloud: ${shiftResult.error}`, 'error');
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dailyLogs = useMemo(() => logs.filter((l) => l.date === selectedDate), [logs, selectedDate]);

  const knownUnits = useMemo(
    () => Array.from(new Set(logs.map((l) => l.unattendedUnit).filter(Boolean))).sort(),
    [logs]
  );
  const knownOfficers = useMemo(() => {
    const names = shiftEntries.flatMap((e) => [e.shift1.officer, e.shift2.officer]);
    return Array.from(new Set(names.filter(Boolean))).sort();
  }, [shiftEntries]);

  const existingShiftEntry = useMemo(() => shiftEntries.find((e) => e.date === selectedDate), [shiftEntries, selectedDate]);
  const shiftMeta = existingShiftEntry ?? createEmptyShiftMeta(selectedDate);

  function addLogRow(): void {
    const ts = new Date().toISOString();
    const newRow: CtafLogEntry = {
      id: crypto.randomUUID(),
      date: selectedDate,
      unattendedUnit: '',
      procedure: '',
      timeStart: '',
      timeEnd: '',
      operationalLog: '',
      createdAt: ts,
      updatedAt: ts,
    };
    addLogLocal(newRow);
    insertCtafLog(newRow).then((result) => {
      if (!result.success && isSupabaseConfigured) showToast(`Gagal sync ke cloud: ${result.error}`, 'error');
    });
  }

  function patchLogRow(id: string, patch: Partial<CtafLogEntryInput>): void {
    const updatedAt = new Date().toISOString();
    updateLogLocal(id, { ...patch, updatedAt });
    const current = useCtafLogStore.getState().logs.find((l) => l.id === id);
    if (current) {
      updateCtafLog(current).then((result) => {
        if (!result.success && isSupabaseConfigured) showToast(`Gagal sync ke cloud: ${result.error}`, 'error');
      });
    }
  }

  function removeLogRow(id: string): void {
    deleteLogLocal(id);
    deleteCtafLog(id).then((result) => {
      if (!result.success && isSupabaseConfigured) showToast(`Gagal sync ke cloud: ${result.error}`, 'error');
    });
  }

  function patchShiftMeta(patch: Partial<CtafShiftMeta>): void {
    const updatedAt = new Date().toISOString();
    const merged: CtafShiftMeta = { ...shiftMeta, ...patch, updatedAt };
    if (existingShiftEntry) {
      updateShiftEntryLocal(existingShiftEntry.id, { ...patch, updatedAt });
      updateCtafShiftMeta(merged).then((result) => {
        if (!result.success && isSupabaseConfigured) showToast(`Gagal sync ke cloud: ${result.error}`, 'error');
      });
    } else {
      addShiftEntryLocal(merged);
      insertCtafShiftMeta(merged).then((result) => {
        if (!result.success && isSupabaseConfigured) showToast(`Gagal sync ke cloud: ${result.error}`, 'error');
      });
    }
  }

  return {
    logs, // semua tanggal — dipakai untuk grafik tren
    dailyLogs,
    knownUnits,
    knownOfficers,
    shiftMeta,
    patchShiftMeta,
    selectedDate,
    setSelectedDate,
    addLogRow,
    patchLogRow,
    removeLogRow,
    isSyncing,
    isCloudEnabled: isSupabaseConfigured,
  };
}
