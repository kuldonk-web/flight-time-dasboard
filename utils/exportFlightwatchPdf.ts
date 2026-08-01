import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FlightwatchMovement } from '@/types/flight';

/** Export seluruh baris pergerakan (semua tanggal) ke satu file PDF landscape, urut kronologis. */
export function exportFlightwatchToPdf(movements: FlightwatchMovement[]): void {
  const sorted = [...movements].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.createdAt < b.createdAt ? -1 : 1;
  });

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const dateStr = new Date().toISOString().slice(0, 10);

  doc.setFontSize(16);
  doc.text('Rekap Flightwatch Logbook', 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Diekspor pada ${new Date().toISOString()} UTC`, 14, 21);

  autoTable(doc, {
    startY: 27,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [30, 41, 59] },
    head: [['No', 'Tanggal', 'Callsign', 'Reg', 'Type', 'Dep AD', 'ATD', 'Dest AD', 'ATA', 'Operator', 'RMK']],
    body: sorted.map((m, idx) => [
      String(idx + 1),
      m.date,
      m.callsign || '-',
      m.registrasi || '-',
      m.aircraftType || '-',
      m.depAirport || '-',
      m.atd || '-',
      m.destAirport || '-',
      m.ata || '-',
      m.operator || '-',
      m.remarks || '-',
    ]),
  });

  doc.save(`flightwatch-logbook-rekap-${dateStr}.pdf`);
}
