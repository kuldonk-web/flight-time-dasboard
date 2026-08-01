/**
 * Status operasional penerbangan.
 * NORMAL  = penerbangan berjalan sesuai rencana
 * RTB     = Return To Base
 * RTA     = Return To Apron
 * DIVERT  = mendarat di bandara alternatif
 */
export type FlightStatus = 'NORMAL' | 'RTB' | 'RTA' | 'DIVERT';

/**
 * Kategori ketepatan waktu, dihitung on-the-fly (tidak disimpan di data).
 * PENDING = waktu aktual belum diisi, belum bisa dihitung.
 */
export type DelayCategory = 'ON_TIME' | 'DELAY' | 'EARLY' | 'PENDING';

export interface FlightLog {
  id: string;
  flightNumber: string;

  // Info pesawat & rute
  aircraftType: string; // e.g. "B738", "A320"
  flightLevel: string; // e.g. "FL350"
  departureAirport: string; // ICAO 4-letter, e.g. "WIII"
  destinationAirport: string; // ICAO 4-letter, e.g. "WARR"

  date: string; // "2026-07-28"

  // Waktu (semua disimpan sebagai ISO datetime string)
  estimatedBlockOff?: string; // ETD block-off (pushback), opsional
  estimatedDeparture: string; // ETD takeoff
  actualDeparture?: string; // ATD takeoff aktual
  estimatedArrival: string; // ETA landing
  actualArrival?: string; // ATA landing aktual

  // Status operasional khusus
  status: FlightStatus;
  statusRemarks?: string; // wajib diisi jika status !== 'NORMAL'

  notes?: string;

  createdAt: string;
  updatedAt: string;
}

/** Payload yang dipakai form, sebelum id/createdAt/updatedAt digenerate. */
export type FlightLogInput = Omit<FlightLog, 'id' | 'createdAt' | 'updatedAt'>;

export interface FlightLogFilterState {
  search: string; // cocok ke flightNumber, departureAirport, destinationAirport
  dateFrom?: string;
  dateTo?: string;
  status?: FlightStatus | 'ALL';
}

export interface FlightStats {
  totalLogs: number;
  onTimeDeparturePct: number;
  onTimeArrivalPct: number;
  avgDepartureDelayMinutes: number;
  avgArrivalDelayMinutes: number;
  rtbCount: number;
  rtaCount: number;
  divertCount: number;
}

/** Bentuk file backup JSON hasil export. */
export interface FlightLogExportPayload {
  version: string;
  exportedAt: string;
  logs: FlightLog[];
}
/** Status khusus kolom Keterangan: kosong = normal. */
export type SheetStatus = '' | 'RTB' | 'RTA' | 'DIVERT';

/** Jenis baris di tabel gabungan — dipilih user lewat dropdown setelah kolom No. */
export type FlightSheetKind = 'DEPARTURE' | 'ARRIVAL' | 'LOKAL';

/**
 * Satu baris di tabel gabungan Departure/Arrival/Lokal.
 * Semua field waktu (eobt/atd/eta/ata) disimpan sebagai string "HH:mm" dalam UTC —
 * bukan Date object, jadi tidak ada konversi timezone otomatis oleh browser.
 * User bertanggung jawab mengetik waktu dalam UTC/Zulu.
 */
export interface FlightSheetRow {
  id: string;
  date: string; // "2026-07-28" (tanggal UTC)
  kind: FlightSheetKind;
  callsign: string;
  registrasi: string;
  altFl: string;
  aircraftType: string; // bebas diisi manual, bukan cuma dari daftar
  route: string;
  airport: string; // ICAO 4 huruf: tujuan (Departure) / asal (Arrival) / lokasi (Lokal)
  eobt: string; // "HH:mm" UTC — dipakai kalau kind = DEPARTURE
  atd: string; // "HH:mm" UTC — dipakai kalau kind = DEPARTURE atau LOKAL
  eta: string; // "HH:mm" UTC — dipakai kalau kind = ARRIVAL
  ata: string; // "HH:mm" UTC — dipakai kalau kind = ARRIVAL atau LOKAL
  status: SheetStatus;
  createdAt: string;
  updatedAt: string;
}

export type FlightSheetRowInput = Omit<FlightSheetRow, 'id' | 'createdAt' | 'updatedAt'>;
/**
 * ============================================================
 * TAMBAHAN — copy-paste ke BAGIAN BAWAH file types/flight.ts yang sudah ada.
 * ============================================================
 */

/** Nilai kondisi fasilitas: V = normal/ok, - = tidak ada/rusak, '' = belum diisi. */
export type FacilityValue = '' | 'V' | '-';

export interface FacilityStatus {
  pabx: FacilityValue;
  amsc: FacilityValue;
  telp: FacilityValue;
  pc: FacilityValue;
  printer: FacilityValue;
  internet: FacilityValue;
  jam: FacilityValue;
  amhs: FacilityValue;
}

/** Rekap jumlah pergerakan penerbangan untuk satu shift. */
export interface FlightDataRow {
  fpl: number;
  dep: number;
  arr: number;
  chg: number;
  cnl: number;
  domScheduled: number;
  intScheduled: number;
  domNonScheduled: number;
  intNonScheduled: number;
  rta: number;
  rtb: number;
  div: number;
  post: number;
  local: number;
}

export interface ShiftInfo {
  officer: string;
  startTime: string; // "HH:mm" UTC
  endTime: string; // "HH:mm" UTC
  signature: string; // data URL PNG dari canvas, "" kalau belum tanda tangan
}

/** Satu entry = satu hari (1 record per tanggal), mengikuti format 1 halaman ARO Logbook. */
export interface AroLogEntry {
  id: string;
  date: string; // "2026-07-30"
  dutyChangeTime: string; // "HH:mm" UTC, jam pergantian dinas
  shiftPagi: ShiftInfo;
  shiftSiang: ShiftInfo;
  shiftMalam: ShiftInfo;
  flightData: {
    pagi: FlightDataRow;
    siang: FlightDataRow;
    malam: FlightDataRow;
  };
  facilities: {
    pagi: FacilityStatus;
    siang: FacilityStatus;
    malam: FacilityStatus;
  };
  operationalNotes: string;
  createdAt: string;
  updatedAt: string;
}
/** Satu baris pergerakan pesawat di Flightwatch Logbook. */
export interface FlightwatchMovement {
  id: string;
  date: string; // "2026-07-30"
  callsign: string;
  registrasi: string;
  aircraftType: string;
  depAirport: string;
  atd: string; // "HH:mm" UTC
  destAirport: string;
  ata: string; // "HH:mm" UTC
  operator: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export type FlightwatchMovementInput = Omit<FlightwatchMovement, 'id' | 'createdAt' | 'updatedAt'>;

/** Info Shift 1 / Shift 2 untuk satu tanggal (1 record per tanggal, seperti ARO Logbook). */
export interface FlightwatchShiftMeta {
  id: string;
  date: string;
  shift1: ShiftInfo;
  shift2: ShiftInfo;
  createdAt: string;
  updatedAt: string;
}
/** Info shift khusus CTAF: cuma 1 jam (bukan rentang start-end) sesuai contoh gambar. */
export interface CtafShiftInfo {
  officer: string;
  time: string; // "HH:mm" UTC
  signature: string; // data URL PNG
}

/** Satu record per tanggal: info Shift 1/Shift 2 + jam transfer of duty. */
export interface CtafShiftMeta {
  id: string;
  date: string;
  shift1: CtafShiftInfo;
  shift2: CtafShiftInfo;
  transferOfDutyTime: string; // "HH:mm" UTC
  createdAt: string;
  updatedAt: string;
}

/** Satu baris log monitoring CTAF traffic. */
export interface CtafLogEntry {
  id: string;
  date: string;
  unattendedUnit: string; // ICAO 4 huruf, unit yang dimonitor
  procedure: string; // misal "CTAF"
  timeStart: string; // "HH:mm" UTC
  timeEnd: string; // "HH:mm" UTC
  operationalLog: string; // catatan bebas
  createdAt: string;
  updatedAt: string;
}

export type CtafLogEntryInput = Omit<CtafLogEntry, 'id' | 'createdAt' | 'updatedAt'>;
/** Satu NOTAM di database. */
export interface NotamEntry {
  id: string;
  notamNumber: string; // misal "A3937/25"
  description: string;
  closingDate: string; // "2026-12-15"
  documentLink: string; // URL dokumen lampiran, boleh kosong
  createdAt: string;
  updatedAt: string;
}

export type NotamEntryInput = Omit<NotamEntry, 'id' | 'createdAt' | 'updatedAt'>;
