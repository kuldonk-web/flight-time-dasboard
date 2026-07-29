import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FlightSheetRow } from '@/types/flight';

const KIND_LABEL: Record<FlightSheetRow['kind'], string> = {
  DEPARTURE: 'Departure',
  ARRIVAL: 'Arrival',
  LOKAL: 'Lokal',
};

/**
 * Export seluruh baris (semua tanggal, semua jenis) ke satu file .pdf landscape:
 * ringkasan jumlah per jenis di atas, lalu tabel detail kronologis.
 */
export function exportFlightSheetToPdf(rows: FlightSheetRow[]): void {
  const sorted = [...rows].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.createdAt < b.createdAt ? -1 : 1;
  });

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const dateStr = new Date().toISOString().slice(0, 10);

  doc.setFontSize(16);
  doc.text('Rekap Flight Log', 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Diekspor pada ${new Date().toISOString()} UTC`, 14, 21);

  const departureCount = rows.filter((r) => r.kind === 'DEPARTURE').length;
  const arrivalCount = rows.filter((r) => r.kind === 'ARRIVAL').length;
  const lokalCount = rows.filter((r) => r.kind === 'LOKAL').length;

  autoTable(doc, {
    startY: 27,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 41, 59] },
    head: [['Metrik', 'Nilai']],
    body: [
      ['Total Baris', String(rows.length)],
      ['Departure', String(departureCount)],
      ['Arrival', String(arrivalCount)],
      ['Lokal', String(lokalCount)],
    ],
    tableWidth: 80,
  });

  const afterSummaryY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  autoTable(doc, {
    startY: afterSummaryY + 10,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [30, 41, 59] },
    head: [
      [
        'No', 'Tanggal', 'Jenis', 'Callsign', 'Registrasi', 'ALT/FL', 'Type',
        'Route', 'Bandara', 'EOBT', 'ATD', 'ETA', 'ATA', 'Ket.',
      ],
    ],
    body: sorted.map((row, idx) => [
      String(idx + 1),
      row.date,
      KIND_LABEL[row.kind],
      row.callsign || '-',
      row.registrasi || '-',
      row.altFl || '-',
      row.aircraftType || '-',
      row.route || '-',
      row.airport || '-',
      row.eobt || '-',
      row.atd || '-',
      row.eta || '-',
      row.ata || '-',
      row.status || '-',
    ]),
  });

  doc.save(`flight-log-rekap-${dateStr}.pdf`);
}
