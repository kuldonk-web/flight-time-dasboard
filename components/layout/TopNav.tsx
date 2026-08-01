'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Flight Time Log' },
  { href: '/aro-logbook', label: 'ARO Logbook' },
  { href: '/flightwatch-logbook', label: 'Flightwatch Logbook' },
  { href: '/ctaf-traffic', label: 'CTAF Traffic' },
  { href: '/notam-viewer', label: 'NOTAM Viewer' },
];

/**
 * Navigasi horizontal di bagian atas — menggantikan Sidebar kiri, supaya
 * lebar layar penuh dipakai untuk area pengisian data, bukan terpotong sidebar.
 */
export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="flex w-full items-center gap-1 overflow-x-auto border-b border-border bg-surface-raised px-4 py-2">
      <span className="mr-3 shrink-0 font-display text-sm font-semibold text-text-primary">Flight Logtime</span>
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-sm px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'bg-accent-cyan/15 font-medium text-accent-cyan'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
