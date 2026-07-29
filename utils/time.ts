/**
 * Semua helper waktu di sini sengaja pakai native Date API (tanpa date-fns/dayjs)
 * supaya dependency tetap minim untuk app kecil ini. Kalau kebutuhan format
 * bertambah kompleks, bisa diganti ke date-fns tanpa mengubah pemanggil di komponen.
 */

/** Format ISO datetime -> "HH:mm". Return "-" kalau input kosong/invalid. */
export function formatTime(iso?: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Format ISO datetime -> "28 Jul 2026". */
export function formatDate(iso?: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Format ISO datetime -> "28 Jul 2026, 14:35". */
export function formatDateTime(iso?: string): string {
  if (!iso) return '-';
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

/**
 * Selisih menit antara dua ISO datetime: actual - estimated.
 * Positif = lebih lambat dari estimasi, negatif = lebih cepat.
 * Return null kalau salah satu waktu belum ada / tidak valid.
 */
export function diffInMinutes(estimatedIso?: string, actualIso?: string): number | null {
  if (!estimatedIso || !actualIso) return null;
  const est = new Date(estimatedIso);
  const act = new Date(actualIso);
  if (isNaN(est.getTime()) || isNaN(act.getTime())) return null;
  return Math.round((act.getTime() - est.getTime()) / 60000);
}

/** Timestamp ISO saat ini, dipakai untuk createdAt/updatedAt. */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Gabungkan tanggal ("2026-07-28") dan jam input form ("14:35")
 * menjadi satu ISO datetime string. Dipakai saat submit form,
 * karena input time picker HTML hanya mengembalikan "HH:mm".
 */
export function combineDateAndTime(date: string, time: string): string {
  if (!date || !time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const d = new Date(`${date}T00:00:00`);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

/** Ambil bagian "HH:mm" dari ISO datetime, untuk mengisi ulang input time picker saat edit. */
export function extractTimePart(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
