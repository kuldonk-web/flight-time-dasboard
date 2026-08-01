import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CtafLogEntry } from '@/types/flight';

/** Export seluruh baris log CTAF (semua tanggal) ke satu file PDF landscape, urut kronologis. */
export function exportCtafToPdf(logs: CtafLogEntry[]): void {
  const sorted = [...logs].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.createdAt < b.createdAt ? -1 : 1;
  });

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const dateStr = new Date().toISOString().slice(0, 10);

  doc.setFontSize(16);
  doc.text('Rekap CTAF Traffic', 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Diekspor pada ${new Date().toISOString()} UTC`, 14, 21);

  autoTable(doc, {
    startY: 27,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [30, 41, 59] },
    head: [['No', 'Tanggal', 'Un-attended Unit', 'Procedure', 'Time', 'Operational Log']],
    body: sorted.map((l, idx) => [
      String(idx + 1),
      l.date,
      l.unattendedUnit || '-',
      l.procedure || '-',
      `${l.timeStart || '--:--'} - ${l.timeEnd || '--:--'}`,
      l.operationalLog || '-',
    ]),
  });

  doc.save(`ctaf-traffic-rekap-${dateStr}.pdf`);
}
