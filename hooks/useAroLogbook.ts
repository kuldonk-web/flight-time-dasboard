import { useEffect, useMemo, useState } from 'react';
import type { AroLogEntry, FacilityStatus, FlightDataRow, ShiftInfo } from '@/types/flight';
import { useAroLogbookStore } from '@/store/aroLogbookStore';
import { useToast } from '@/components/ui/Toast';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { fetchAllAroLogEntries, insertAroLogEntry, updateAroLogEntry } from '@/utils/aroLogbookSupabaseSync';

function todayUtcDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const emptyFlightData: FlightDataRow = {
  fpl: 0,
  dep: 0,
  arr: 0,
  chg: 0,
  cnl: 0,
  domScheduled: 0,
  intScheduled: 0,
  domNonScheduled: 0,
  intNonScheduled: 0,
  rta: 0,
  rtb: 0,
  div: 0,
  post: 0,
  local: 0,
};

const emptyFacilities: FacilityStatus = {
  pabx: '',
  amsc: '',
  telp: '',
  pc: '',
  printer: '',
  internet: '',
  jam: '',
  amhs: '',
};

const emptyShift: ShiftInfo = { officer: '', startTime: '', endTime: '', signature: '' };

function createEmptyEntry(date: string): AroLogEntry {
  const ts = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    date,
    dutyChangeTime: '06:00',
    shiftPagi: { ...emptyShift },
    shiftSiang: { ...emptyShift },
    shiftMalam: { ...emptyShift },
    flightData: { pagi: { ...emptyFlightData }, siang: { ...emptyFlightData }, malam: { ...emptyFlightData } },
    facilities: { pagi: { ...emptyFacilities }, siang: { ...emptyFacilities }, malam: { ...emptyFacilities } },
    operationalNotes: '',
    createdAt: ts,
    updatedAt: ts,
  };
}

/**
 * Satu-satunya pintu masuk UI untuk baca/tulis ARO Logbook.
 * Beda dari Flight Sheet (banyak baris per hari) — di sini SATU record per tanggal.
 * Record baru baru benar-benar dibuat & disimpan begitu user mengedit field pertama
 * (create-on-first-edit), supaya tidak ada record kosong menumpuk di database.
 */
export function useAroLogbook() {
  const entries = useAroLogbookStore((s) => s.entries);
  const addEntry = useAroLogbookStore((s) => s.addEntry);
  const updateEntryLocal = useAroLogbookStore((s) => s.updateEntry);

  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(todayUtcDateStr());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    setIsSyncing(true);

    fetchAllAroLogEntries().then((result) => {
      if (cancelled) return;
      setIsSyncing(false);
      if (result.success) {
        useAroLogbookStore.setState({ entries: result.entries });
      } else {
        showToast(`Gagal memuat ARO Logbook dari cloud: ${result.error}. Menampilkan data lokal.`, 'error');
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const existing = useMemo(() => entries.find((e) => e.date === selectedDate), [entries, selectedDate]);
  const entry = existing ?? createEmptyEntry(selectedDate);

  const knownOfficers = useMemo(() => {
    const names = entries.flatMap((e) => [e.shiftPagi.officer, e.shiftSiang.officer, e.shiftMalam.officer]);
    return Array.from(new Set(names.filter(Boolean))).sort();
  }, [entries]);

  function patchEntry(patch: Partial<AroLogEntry>): void {
    const updatedAt = new Date().toISOString();
    const merged: AroLogEntry = { ...entry, ...patch, updatedAt };

    if (existing) {
      updateEntryLocal(existing.id, { ...patch, updatedAt });
      updateAroLogEntry(merged).then((result) => {
        if (!result.success && isSupabaseConfigured) {
          showToast(`Tersimpan lokal, tapi gagal sync ke cloud: ${result.error}`, 'error');
        }
      });
    } else {
      addEntry(merged);
      insertAroLogEntry(merged).then((result) => {
        if (!result.success && isSupabaseConfigured) {
          showToast(`Tersimpan lokal, tapi gagal sync ke cloud: ${result.error}`, 'error');
        }
      });
    }
  }

 return {
    entries, // seluruh data (semua tanggal) — dipakai untuk grafik tren realisasi
    entry,
    selectedDate,
    setSelectedDate,
    patchEntry,
    knownOfficers,
    isSyncing,
    isCloudEnabled: isSupabaseConfigured,
  };
}
