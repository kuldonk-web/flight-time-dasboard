# Flight Time Log Dashboard

Dashboard pencatatan estimasi & waktu aktual takeoff/landing pesawat. Tanpa login,
semua data tersimpan di `localStorage` browser (single device).

## Menjalankan project

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Struktur singkat

- `types/` — definisi tipe data (`FlightLog`, dll)
- `lib/constants.ts` — konstanta & threshold
- `utils/` — pure functions (waktu, delay, filter, stats, validasi, export/import)
- `store/flightLogStore.ts` — Zustand store + persist ke localStorage
- `hooks/useFlightLogs.ts` — pintu masuk utama untuk komponen UI (business logic)
- `components/ui/` — primitives (Button, Input, Modal, Badge, Toast, dll)
- `components/flight-log/` — komponen fitur utama
- `components/layout/` — Header
- `app/` — App Router (`layout.tsx`, `page.tsx`, `globals.css`)

## Catatan

- Data hilang kalau localStorage di-clear atau pindah browser/device — gunakan
  fitur **Export JSON** secara berkala sebagai backup manual, dan **Import JSON**
  untuk memulihkan atau memindahkan data ke device lain.
- Tidak ada backend/database — semua murni client-side.
