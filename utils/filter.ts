import type { FlightLog, FlightLogFilterState } from '@/types/flight';

export const DEFAULT_FILTERS: FlightLogFilterState = {
  search: '',
  status: 'ALL',
};

export function filterLogs(logs: FlightLog[], filters: FlightLogFilterState): FlightLog[] {
  const search = filters.search.trim().toLowerCase();

  return logs.filter((log) => {
    if (search) {
      const haystack = `${log.flightNumber} ${log.departureAirport} ${log.destinationAirport}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    if (filters.status && filters.status !== 'ALL' && log.status !== filters.status) {
      return false;
    }

    if (filters.dateFrom && log.date < filters.dateFrom) return false;
    if (filters.dateTo && log.date > filters.dateTo) return false;

    return true;
  });
}

/** Urutkan terbaru dulu berdasarkan tanggal + estimasi keberangkatan. */
export function sortLogsByDateDesc(logs: FlightLog[]): FlightLog[] {
  return [...logs].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.estimatedDeparture < b.estimatedDeparture ? 1 : -1;
  });
}
