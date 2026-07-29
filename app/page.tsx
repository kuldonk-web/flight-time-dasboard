'use client';

import { Header } from '@/components/layout/Header';
import { FlightSheetTable } from '@/components/flight-log/FlightSheetTable';

export default function DashboardPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8">
      <Header />
      <FlightSheetTable />
    </main>
  );
}
