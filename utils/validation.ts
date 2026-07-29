import type { FlightLogInput } from '@/types/flight';
import { FLIGHT_LEVEL_REGEX, ICAO_CODE_REGEX } from '@/lib/constants';

export function isValidIcaoCode(code: string): boolean {
  return ICAO_CODE_REGEX.test(code.trim().toUpperCase());
}

export function isValidFlightLevel(fl: string): boolean {
  return FLIGHT_LEVEL_REGEX.test(fl.trim());
}

/** Normalisasi input flight level jadi format seragam "FL350". */
export function normalizeFlightLevel(fl: string): string {
  const trimmed = fl.trim().toUpperCase();
  if (!trimmed) return '';
  return trimmed.startsWith('FL') ? trimmed : `FL${trimmed}`;
}

export type FlightLogValidationErrors = Partial<Record<keyof FlightLogInput, string>>;

/**
 * Validasi lengkap sebelum submit form. Return object errors kosong ({})
 * kalau semua valid, supaya gampang dicek dengan Object.keys(errors).length === 0.
 */
export function validateFlightLogInput(input: FlightLogInput): FlightLogValidationErrors {
  const errors: FlightLogValidationErrors = {};

  if (!input.flightNumber.trim()) {
    errors.flightNumber = 'Nomor penerbangan wajib diisi';
  }

  if (!input.aircraftType.trim()) {
    errors.aircraftType = 'Tipe pesawat wajib diisi';
  }

  if (!input.flightLevel.trim()) {
    errors.flightLevel = 'Flight level wajib diisi';
  } else if (!isValidFlightLevel(input.flightLevel)) {
    errors.flightLevel = 'Format flight level tidak valid, contoh: FL350';
  }

  if (!input.departureAirport.trim()) {
    errors.departureAirport = 'Departure airport wajib diisi';
  } else if (!isValidIcaoCode(input.departureAirport)) {
    errors.departureAirport = 'Harus 4 huruf ICAO, contoh: WIII';
  }

  if (!input.destinationAirport.trim()) {
    errors.destinationAirport = 'Destination airport wajib diisi';
  } else if (!isValidIcaoCode(input.destinationAirport)) {
    errors.destinationAirport = 'Harus 4 huruf ICAO, contoh: WARR';
  }

  if (!input.date) {
    errors.date = 'Tanggal wajib diisi';
  }

  if (!input.estimatedDeparture) {
    errors.estimatedDeparture = 'Estimasi takeoff wajib diisi';
  }

  if (!input.estimatedArrival) {
    errors.estimatedArrival = 'Estimasi landing wajib diisi';
  }

  if (input.status !== 'NORMAL' && !input.statusRemarks?.trim()) {
    errors.statusRemarks = `Keterangan wajib diisi untuk status ${input.status}`;
  }

  return errors;
}
