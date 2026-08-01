'use client';

import { Header } from '@/components/layout/Header';
import { FlightSheetTable } from '@/components/flight-log/FlightSheetTable';

export default function DashboardPage() {
  return (
    <main className="flex w-full flex-col">
      <Header />
      <FlightSheetTable />
    </main>
  );
}
