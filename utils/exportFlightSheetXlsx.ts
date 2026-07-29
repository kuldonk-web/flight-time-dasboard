import * as XLSX from 'xlsx';
import type { FlightSheetRow } from '@/types/flight';

const KIND_LABEL: Record<FlightSheetRow['kind'], string> = {
  DEPARTURE: 'Departure',
  ARRIVAL: 'Arrival',
  LOKAL: 'Lokal',
};

function toRow(row: FlightSheetRow, no: number) {
  return {
    No: no,
    Tanggal: row.date,
    Jenis: KIND_LABEL[row.kind],
    Callsign: row.callsign,
    Registrasi: row.registrasi,
    'ALT/FL': row.altFl,
    Type: row.aircraftType,
    Route: row.route,
    Bandara: row.airport,
    'EOBT (UTC)': row.eobt || '-',
    'ATD (UTC)': row.atd || '-',
    'ETA (UTC)': row.eta || '-',
    'ATA (UTC)': row.ata || '-',
    Keterangan: row.status || '-',
  };
}

/**
 * Export seluruh baris (semua tanggal, semua jenis) ke satu file .xlsx.
 * Diurutkan tanggal lalu jam dibuat, supaya kronologis seperti logbook asli.
 */
export function exportFlightSheetToXlsx(rows: FlightSheetRow[]): void {
  const sorted = [...rows].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.createdAt < b.createdAt ? -1 : 1;
  });

  const sheet = XLSX.utils.json_to_sheet(sorted.map((r, i) => toRow(r, i + 1)));
  sheet['!cols'] = [
    { wch: 5 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
  ];

  const departureCount = rows.filter((r) => r.kind === 'DEPARTURE').length;
  const arrivalCount = rows.filter((r) => r.kind === 'ARRIVAL').length;
  const lokalCount = rows.filter((r) => r.kind === 'LOKAL').length;

  const summarySheet = XLSX.utils.json_to_sheet([
    { Metrik: 'Total Baris', Nilai: rows.length },
    { Metrik: 'Departure', Nilai: departureCount },
    { Metrik: 'Arrival', Nilai: arrivalCount },
    { Metrik: 'Lokal', Nilai: lokalCount },
  ]);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 10 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Flight Log');
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `flight-log-rekap-${dateStr}.xlsx`);
}
