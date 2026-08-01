import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AroLogEntry, FlightDataRow } from '@/types/flight';
import { ARO_STATION_INFO, FACILITY_ROWS } from '@/lib/constants';

const FLIGHT_DATA_COLUMNS: { key: keyof FlightDataRow; label: string }[] = [
  { key: 'fpl', label: 'FPL' },
  { key: 'dep', label: 'DEP' },
  { key: 'arr', label: 'ARR' },
  { key: 'chg', label: 'CHG' },
  { key: 'cnl', label: 'CNL' },
  { key: 'domScheduled', label: 'DOM(J)' },
  { key: 'intScheduled', label: 'INT(J)' },
  { key: 'domNonScheduled', label: 'DOM(TJ)' },
  { key: 'intNonScheduled', label: 'INT(TJ)' },
  { key: 'rta', label: 'RTA' },
  { key: 'rtb', label: 'RTB' },
  { key: 'div', label: 'DIV' },
  { key: 'post', label: 'POST' },
  { key: 'local', label: 'LOCAL' },
];

function sumColumn(rows: FlightDataRow[], key: keyof FlightDataRow): number {
  return rows.reduce((total, row) => total + (row[key] || 0), 0);
}

/**
 * Export SATU hari ARO Logbook (entry yang sedang dilihat) ke PDF satu halaman,
 * meniru layout form kertas aslinya: kop stasiun, blok shift + tanda tangan,
 * tabel Data Penerbangan, tabel Kondisi Fasilitas, dan Catatan Operasional.
 */
export function exportAroLogEntryToPdf(entry: AroLogEntry): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(ARO_STATION_INFO.line1, 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(ARO_STATION_INFO.line2, 14, y);
  y += 4;
  doc.text(ARO_STATION_INFO.line3, 14, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const titleLines: string[] = doc.splitTextToSize(ARO_STATION_INFO.title, 180);
  doc.text(titleLines, 105, y, { align: 'center' });
  y += titleLines.length * 5 + 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date: ${entry.date}`, 14, y);
  y += 7;

  // Blok shift + tanda tangan
  const shiftDefs: { key: 'shiftPagi' | 'shiftSiang' | 'shiftMalam'; label: string }[] = [
    { key: 'shiftPagi', label: 'SHIFT PAGI' },
    { key: 'shiftSiang', label: 'SHIFT SIANG' },
    { key: 'shiftMalam', label: 'SHIFT MALAM' },
  ];

  for (const { key, label } of shiftDefs) {
    const shift = entry[key];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(label, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${shift.officer || '-'}`, 42, y);
    doc.text(`TIME: ${shift.startTime || '--:--'} - ${shift.endTime || '--:--'} UTC`, 95, y);
    if (shift.signature) {
      try {
        doc.addImage(shift.signature, 'PNG', 160, y - 6, 32, 12);
      } catch {
        // Data URL tidak valid / gagal decode — lewati saja gambarnya, tidak fatal.
      }
    }
    y += 11;
  }

  doc.text(`PERGANTIAN DINAS PUKUL: ${entry.dutyChangeTime || '-'} UTC`, 14, y);
  y += 8;

  // Tabel Data Penerbangan
  const flightRows = [entry.flightData.pagi, entry.flightData.siang, entry.flightData.malam];
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
    headStyles: { fillColor: [30, 41, 59], fontSize: 6.5 },
    head: [['SHIFT', ...FLIGHT_DATA_COLUMNS.map((c) => c.label)]],
    body: [
      ...(['pagi', 'siang', 'malam'] as const).map((k) => [
        k.toUpperCase(),
        ...FLIGHT_DATA_COLUMNS.map((c) => String(entry.flightData[k][c.key] || 0)),
      ]),
      ['JUMLAH', ...FLIGHT_DATA_COLUMNS.map((c) => String(sumColumn(flightRows, c.key)))],
    ],
  });

  const afterFlightY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // Tabel Kondisi Fasilitas
  autoTable(doc, {
    startY: afterFlightY + 8,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
    headStyles: { fillColor: [30, 41, 59], fontSize: 7 },
    head: [['PERALATAN', 'PAGI', 'SIANG', 'MALAM']],
    body: FACILITY_ROWS.map((row) => [
      row.label,
      entry.facilities.pagi[row.key] || '-',
      entry.facilities.siang[row.key] || '-',
      entry.facilities.malam[row.key] || '-',
    ]),
    tableWidth: 100,
  });

  const afterFacilityY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CATATAN OPERASIONAL:', 14, afterFacilityY + 8);
  doc.setFont('helvetica', 'normal');
  const notesLines: string[] = doc.splitTextToSize(entry.operationalNotes || '-', 180);
  doc.text(notesLines, 14, afterFacilityY + 13);

  doc.save(`aro-logbook-${entry.date}.pdf`);
}
