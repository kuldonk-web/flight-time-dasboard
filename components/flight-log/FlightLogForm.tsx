'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { FlightLog, FlightLogInput, FlightStatus } from '@/types/flight';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { AIRCRAFT_TYPE_SUGGESTIONS, FLIGHT_STATUS_OPTIONS } from '@/lib/constants';
import { combineDateAndTime, extractTimePart } from '@/utils/time';
import {
  normalizeFlightLevel,
  validateFlightLogInput,
  type FlightLogValidationErrors,
} from '@/utils/validation';

interface FlightLogFormProps {
  /** Kalau diisi, form dalam mode edit. */
  initialValue?: FlightLog;
  onSubmit: (input: FlightLogInput) => void;
  onCancel: () => void;
}

interface FormState {
  flightNumber: string;
  aircraftType: string;
  flightLevel: string;
  departureAirport: string;
  destinationAirport: string;
  date: string;
  estimatedBlockOffTime: string;
  estimatedDepartureTime: string;
  actualDepartureTime: string;
  estimatedArrivalTime: string;
  actualArrivalTime: string;
  status: FlightStatus;
  statusRemarks: string;
  notes: string;
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Bangun form state dari FlightLog yang ada (mode edit) atau state kosong (mode tambah). */
function buildFormState(log?: FlightLog): FormState {
  if (!log) {
    return {
      flightNumber: '',
      aircraftType: '',
      flightLevel: '',
      departureAirport: '',
      destinationAirport: '',
      date: todayDateString(),
      estimatedBlockOffTime: '',
      estimatedDepartureTime: '',
      actualDepartureTime: '',
      estimatedArrivalTime: '',
      actualArrivalTime: '',
      status: 'NORMAL',
      statusRemarks: '',
      notes: '',
    };
  }
  return {
    flightNumber: log.flightNumber,
    aircraftType: log.aircraftType,
    flightLevel: log.flightLevel,
    departureAirport: log.departureAirport,
    destinationAirport: log.destinationAirport,
    date: log.date,
    estimatedBlockOffTime: extractTimePart(log.estimatedBlockOff),
    estimatedDepartureTime: extractTimePart(log.estimatedDeparture),
    actualDepartureTime: extractTimePart(log.actualDeparture),
    estimatedArrivalTime: extractTimePart(log.estimatedArrival),
    actualArrivalTime: extractTimePart(log.actualArrival),
    status: log.status,
    statusRemarks: log.statusRemarks ?? '',
    notes: log.notes ?? '',
  };
}

export function FlightLogForm({ initialValue, onSubmit, onCancel }: FlightLogFormProps) {
  const [form, setForm] = useState<FormState>(() => buildFormState(initialValue));
  const [errors, setErrors] = useState<FlightLogValidationErrors>({});

  // Reset form kalau initialValue berganti (misal user klik Edit di baris lain
  // selagi modal yang sama masih dipakai).
  useEffect(() => {
    setForm(buildFormState(initialValue));
    setErrors({});
  }, [initialValue]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const input: FlightLogInput = {
      flightNumber: form.flightNumber.trim().toUpperCase(),
      aircraftType: form.aircraftType.trim().toUpperCase(),
      flightLevel: normalizeFlightLevel(form.flightLevel),
      departureAirport: form.departureAirport.trim().toUpperCase(),
      destinationAirport: form.destinationAirport.trim().toUpperCase(),
      date: form.date,
      estimatedBlockOff: form.estimatedBlockOffTime
        ? combineDateAndTime(form.date, form.estimatedBlockOffTime)
        : undefined,
      estimatedDeparture: form.estimatedDepartureTime
        ? combineDateAndTime(form.date, form.estimatedDepartureTime)
        : '',
      actualDeparture: form.actualDepartureTime
        ? combineDateAndTime(form.date, form.actualDepartureTime)
        : undefined,
      estimatedArrival: form.estimatedArrivalTime
        ? combineDateAndTime(form.date, form.estimatedArrivalTime)
        : '',
      actualArrival: form.actualArrivalTime
        ? combineDateAndTime(form.date, form.actualArrivalTime)
        : undefined,
      status: form.status,
      statusRemarks: form.statusRemarks.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    const validationErrors = validateFlightLogInput(input);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(input);
  }

  const showStatusRemarks = form.status !== 'NORMAL';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Flight Number"
          mono
          value={form.flightNumber}
          onChange={(e) => updateField('flightNumber', e.target.value.toUpperCase())}
          error={errors.flightNumber}
          placeholder="GA123"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="aircraftType" className="text-xs font-medium text-text-secondary">
            Aircraft Type
          </label>
          <input
            id="aircraftType"
            list="aircraft-type-suggestions"
            value={form.aircraftType}
            onChange={(e) => updateField('aircraftType', e.target.value.toUpperCase())}
            className="h-10 rounded-sm border border-border bg-surface px-3 font-data text-sm text-text-primary focus-visible:border-accent-cyan"
            placeholder="B738"
          />
          <datalist id="aircraft-type-suggestions">
            {AIRCRAFT_TYPE_SUGGESTIONS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          {errors.aircraftType && (
            <span className="text-xs text-status-alert">{errors.aircraftType}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Flight Level"
          mono
          value={form.flightLevel}
          onChange={(e) => updateField('flightLevel', e.target.value)}
          error={errors.flightLevel}
          placeholder="FL350"
        />
        <Input
          label="Departure Airport (ICAO)"
          mono
          maxLength={4}
          value={form.departureAirport}
          onChange={(e) => updateField('departureAirport', e.target.value.toUpperCase())}
          error={errors.departureAirport}
          placeholder="WIII"
        />
        <Input
          label="Destination Airport (ICAO)"
          mono
          maxLength={4}
          value={form.destinationAirport}
          onChange={(e) => updateField('destinationAirport', e.target.value.toUpperCase())}
          error={errors.destinationAirport}
          placeholder="WARR"
        />
      </div>

      <Input
        label="Tanggal"
        type="date"
        value={form.date}
        onChange={(e) => updateField('date', e.target.value)}
        error={errors.date}
      />

      <fieldset className="rounded-sm border border-border p-4">
        <legend className="px-1 text-xs font-medium text-text-secondary">Keberangkatan</legend>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Est. Block-off"
            type="time"
            mono
            value={form.estimatedBlockOffTime}
            onChange={(e) => updateField('estimatedBlockOffTime', e.target.value)}
            hint="Opsional, khusus jika ini pesawat keberangkatan"
          />
          <Input
            label="Est. Takeoff (ETD)"
            type="time"
            mono
            value={form.estimatedDepartureTime}
            onChange={(e) => updateField('estimatedDepartureTime', e.target.value)}
            error={errors.estimatedDeparture}
          />
          <Input
            label="Actual Takeoff (ATD)"
            type="time"
            mono
            value={form.actualDepartureTime}
            onChange={(e) => updateField('actualDepartureTime', e.target.value)}
            hint="Diisi setelah lepas landas"
          />
        </div>
      </fieldset>

      <fieldset className="rounded-sm border border-border p-4">
        <legend className="px-1 text-xs font-medium text-text-secondary">Kedatangan</legend>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Est. Landing (ETA)"
            type="time"
            mono
            value={form.estimatedArrivalTime}
            onChange={(e) => updateField('estimatedArrivalTime', e.target.value)}
            error={errors.estimatedArrival}
          />
          <Input
            label="Actual Landing (ATA)"
            type="time"
            mono
            value={form.actualArrivalTime}
            onChange={(e) => updateField('actualArrivalTime', e.target.value)}
            hint="Diisi setelah mendarat"
          />
        </div>
      </fieldset>

      <Select
        label="Status"
        value={form.status}
        onChange={(e) => updateField('status', e.target.value as FlightStatus)}
        options={FLIGHT_STATUS_OPTIONS}
      />

      {showStatusRemarks && (
        <Textarea
          label={`Keterangan ${form.status}`}
          value={form.statusRemarks}
          onChange={(e) => updateField('statusRemarks', e.target.value)}
          error={errors.statusRemarks}
          placeholder="Jelaskan alasan, bandara alternatif, atau detail lainnya"
        />
      )}

      <Textarea
        label="Catatan Tambahan"
        value={form.notes}
        onChange={(e) => updateField('notes', e.target.value)}
        placeholder="Opsional"
      />

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" variant="primary">
          {initialValue ? 'Simpan Perubahan' : 'Tambah Log'}
        </Button>
      </div>
    </form>
  );
}
