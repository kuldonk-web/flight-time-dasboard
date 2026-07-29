'use client';

import type { FlightLogFilterState } from '@/types/flight';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FLIGHT_STATUS_OPTIONS } from '@/lib/constants';

interface FlightLogFiltersProps {
  filters: FlightLogFilterState;
  onChange: (filters: FlightLogFilterState) => void;
  onReset: () => void;
}

const STATUS_FILTER_OPTIONS = [{ value: 'ALL', label: 'Semua Status' }, ...FLIGHT_STATUS_OPTIONS];

export function FlightLogFilters({ filters, onChange, onReset }: FlightLogFiltersProps) {
  function updateFilter<K extends keyof FlightLogFilterState>(key: K, value: FlightLogFilterState[K]) {
    onChange({ ...filters, [key]: value });
  }

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    (filters.status && filters.status !== 'ALL');

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface p-4">
      <div className="min-w-[200px] flex-1">
        <Input
          label="Cari"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Nomor penerbangan atau bandara..."
        />
      </div>

      <Input
        label="Dari Tanggal"
        type="date"
        value={filters.dateFrom ?? ''}
        onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
      />

      <Input
        label="Sampai Tanggal"
        type="date"
        value={filters.dateTo ?? ''}
        onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
      />

      <div className="w-44">
        <Select
          label="Status"
          value={filters.status ?? 'ALL'}
          onChange={(e) => updateFilter('status', e.target.value as FlightLogFilterState['status'])}
          options={STATUS_FILTER_OPTIONS}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="md" onClick={onReset}>
          Reset Filter
        </Button>
      )}
    </div>
  );
}
