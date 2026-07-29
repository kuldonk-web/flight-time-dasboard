'use client';

export function Header() {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text-primary">Flight Time Log</h1>
        <p className="text-sm text-text-secondary">Pencatatan estimasi &amp; waktu aktual takeoff/landing</p>
      </div>
      <span className="font-data text-xs text-text-muted">{today}</span>
    </header>
  );
}
