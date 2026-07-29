import { useEffect, useMemo, useState } from 'react';
import type { FlightSheetKind, FlightSheetRow, FlightSheetRowInput } from '@/types/flight';
import { useFlightSheetStore } from '@/store/flightSheetStore';
import { SHEET_AIRCRAFT_TYPE_OPTIONS } from '@/lib/constants';
import { useToast } from '@/components/ui/Toast';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  fetchAllFlightSheetRows,
  insertFlightSheetRow,
  updateFlightSheetRow,
  deleteFlightSheetRow,
} from '@/utils/flightSheetSupabaseSync';

/**
 * "Hari ini" dihitung dari UTC (toISOString selalu UTC, apapun timezone browser),
 * supaya tanggal yang dipakai konsisten dengan waktu UTC yang diisi di kolom-kolom jam.
 */
function todayUtcDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Satu-satunya pintu masuk yang dipakai UI untuk baca/tulis tabel gabungan Departure/Arrival/Lokal.
 * Strategi cloud sync: "local-first" — setiap perubahan langsung ke localStorage (lewat store)
 * biar UI tetap responsif walau offline, lalu dikirim ke Supabase di background. Kalau
 * Supabase belum dikonfigurasi (env var kosong), app tetap jalan normal mode local-only.
 */
export function useFlightSheet() {
  const logs = useFlightSheetStore((s) => s.logs);
  const addLog = useFlightSheetStore((s) => s.addLog);
  const updateLog = useFlightSheetStore((s) => s.updateLog);
  const deleteLog = useFlightSheetStore((s) => s.deleteLog);

  const { showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState(todayUtcDateStr());
  const [isSyncing, setIsSyncing] = useState(false);

  // Tarik data terbaru dari Supabase saat pertama kali dibuka, supaya konsisten antar device.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    setIsSyncing(true);

    fetchAllFlightSheetRows().then((result) => {
      if (cancelled) return;
      setIsSyncing(false);
      if (result.success) {
        useFlightSheetStore.setState({ logs: result.rows });
      } else {
        showToast(`Gagal memuat data dari cloud: ${result.error}. Menampilkan data lokal.`, 'error');
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dailyLogs = useMemo(() => logs.filter((l) => l.date === selectedDate), [logs, selectedDate]);

  const knownCallsigns = useMemo(
    () => Array.from(new Set(logs.map((l) => l.callsign).filter(Boolean))).sort(),
    [logs]
  );

  const knownAircraftTypes = useMemo(() => {
    const custom = logs.map((l) => l.aircraftType).filter(Boolean);
    return Array.from(new Set([...SHEET_AIRCRAFT_TYPE_OPTIONS, ...custom])).sort();
  }, [logs]);

  function addEmptyRow(kind: FlightSheetKind = 'DEPARTURE'): void {
    const timestamp = new Date().toISOString();
    const newRow: FlightSheetRow = {
      id: crypto.randomUUID(),
      date: selectedDate,
      kind,
      callsign: '',
      registrasi: '',
      altFl: '',
      aircraftType: '',
      route: '',
      airport: '',
      eobt: '',
      atd: '',
      eta: '',
      ata: '',
      status: '',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    addLog(newRow);

    insertFlightSheetRow(newRow).then((result) => {
      if (!result.success && isSupabaseConfigured) {
        showToast(`Tersimpan lokal, tapi gagal sync ke cloud: ${result.error}`, 'error');
      }
    });
  }

  function patchRow(id: string, patch: Partial<FlightSheetRowInput>): void {
    const updatedAt = new Date().toISOString();
    updateLog(id, { ...patch, updatedAt });

    const current = useFlightSheetStore.getState().logs.find((l) => l.id === id);
    if (current) {
      updateFlightSheetRow(current).then((result) => {
        if (!result.success && isSupabaseConfigured) {
          showToast(`Perubahan tersimpan lokal, tapi gagal sync ke cloud: ${result.error}`, 'error');
        }
      });
    }
  }

  function removeRow(id: string): void {
    deleteLog(id);

    deleteFlightSheetRow(id).then((result) => {
      if (!result.success && isSupabaseConfigured) {
        showToast(`Terhapus lokal, tapi gagal sync ke cloud: ${result.error}`, 'error');
      }
    });
  }

  return {
    logs, // seluruh data (semua tanggal) — dipakai untuk export rekap
    dailyLogs,
    knownCallsigns,
    knownAircraftTypes,
    selectedDate,
    setSelectedDate,
    addEmptyRow,
    patchRow,
    removeRow,
    isSyncing,
    isCloudEnabled: isSupabaseConfigured,
  };
}
