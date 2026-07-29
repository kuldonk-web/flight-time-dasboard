import type { FlightStatus } from '@/types/flight';

/** Selisih menit maksimum yang masih dianggap "on-time". */
export const DELAY_THRESHOLD_MINUTES = 5;
export const EARLY_THRESHOLD_MINUTES = 5;

export const FLIGHT_STATUS_OPTIONS: { value: FlightStatus; label: string }[] = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'RTB', label: 'RTB (Return To Base)' },
  { value: 'RTA', label: 'RTA (Return To Apron)' },
  { value: 'DIVERT', label: 'Divert' },
];

/** Saran aircraft type untuk autocomplete, bukan daftar tertutup. */
export const AIRCRAFT_TYPE_SUGGESTIONS = [
  'B738',
  'B737',
  'B777',
  'A320',
  'A330',
  'ATR72',
  'CN235',
  'C130',
];

/** Format ICAO: tepat 4 huruf kapital, e.g. "WIII". */
export const ICAO_CODE_REGEX = /^[A-Z]{4}$/;

/** Terima "FL350", "FL35", atau angka polos "350" (akan dinormalisasi). */
export const FLIGHT_LEVEL_REGEX = /^(FL)?\d{2,3}$/i;

export const LOCAL_STORAGE_KEY = 'flight-log-storage';

export const EXPORT_SCHEMA_VERSION = '1.0';

export const DATE_DISPLAY_FORMAT = 'dd MMM yyyy';
export const TIME_DISPLAY_FORMAT = 'HH:mm';
/**
 * Pilihan ALT/FL: 500 s.d. 17500 ft (kelipatan 500), lalu FL180 s.d. FL410 (kelipatan 10).
 * Sesuaikan lagi kalau transition altitude/level di wilayah operasi kamu berbeda.
 */
export const ALT_FL_OPTIONS: string[] = (() => {
  const opts: string[] = [];
  for (let ft = 500; ft <= 17500; ft += 500) opts.push(String(ft));
  for (let fl = 180; fl <= 410; fl += 10) opts.push(`FL${fl}`);
  return opts;
})();

/** Daftar tipe pesawat untuk dropdown Departure/Arrival (list tertutup, sesuai permintaan). */
export const SHEET_AIRCRAFT_TYPE_OPTIONS = ['B738', 'B777', 'A320', 'A330', 'C208', 'C130', 'AT72'];

/** Status RTB/RTA/Divert untuk dropdown kolom keterangan Departure & Arrival. */
export const SHEET_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: '-' },
  { value: 'RTB', label: 'RTB' },
  { value: 'RTA', label: 'RTA' },
  { value: 'DIVERT', label: 'Divert' },
];
/** Opsi dropdown kolom "Jenis" (setelah kolom No): Departure / Arrival / Lokal. */
export const FLIGHT_SHEET_KIND_OPTIONS = [
  { value: 'DEPARTURE', label: 'Departure' },
  { value: 'ARRIVAL', label: 'Arrival' },
  { value: 'LOKAL', label: 'Lokal' },
] as const;
