'use client';

import { useState } from 'react';
import type { FlightLog } from '@/types/flight';
import { useFlightLogs } from '@/hooks/useFlightLogs';
import { useToast } from '@/components/ui/Toast';
import { Header } from '@/components/layout/Header';
import { StatsSummary } from '@/components/flight-log/StatsSummary';
import { FlightLogFilters } from '@/components/flight-log/FlightLogFilters';
import { ImportExportControls } from '@/components/flight-log/ImportExportControls';
import { FlightLogTable } from '@/components/flight-log/FlightLogTable';
import { FlightLogForm } from '@/components/flight-log/FlightLogForm';
import { DeleteConfirmModal } from '@/components/flight-log/DeleteConfirmModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const {
    logs,
    filteredLogs,
    stats,
    filters,
    setFilters,
    resetFilters,
    createLog,
    editLog,
    removeLog,
    replaceAllLogs,
    mergeLogs,
  } = useFlightLogs();
  const { showToast } = useToast();

  // null = form dalam mode "Tambah", FlightLog = form dalam mode "Edit"
  const [formTarget, setFormTarget] = useState<FlightLog | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FlightLog | null>(null);

  function openAddForm() {
    setFormTarget(null);
    setIsFormOpen(true);
  }

  function openEditForm(log: FlightLog) {
    setFormTarget(log);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
  }

  function handleFormSubmit(input: Parameters<typeof createLog>[0]) {
    if (formTarget) {
      editLog(formTarget.id, input);
      showToast(`Log ${input.flightNumber} berhasil diperbarui.`, 'success');
    } else {
      createLog(input);
      showToast(`Log ${input.flightNumber} berhasil ditambahkan.`, 'success');
    }
    setIsFormOpen(false);
  }

  function handleDeleteConfirm(log: FlightLog) {
    removeLog(log.id);
    showToast(`Log ${log.flightNumber} dihapus.`, 'info');
    setDeleteTarget(null);
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
      <Header />

      <StatsSummary stats={stats} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          <FlightLogFilters filters={filters} onChange={setFilters} onReset={resetFilters} />
        </div>
        <div className="flex items-end gap-2">
          <ImportExportControls logs={logs} onReplaceAll={replaceAllLogs} onMerge={mergeLogs} />
          <Button onClick={openAddForm}>+ Tambah Log</Button>
        </div>
      </div>

      <FlightLogTable logs={filteredLogs} onEdit={openEditForm} onDeleteRequest={setDeleteTarget} />

      <Modal
        open={isFormOpen}
        onClose={closeForm}
        title={formTarget ? `Edit Log — ${formTarget.flightNumber}` : 'Tambah Log Penerbangan'}
        size="lg"
      >
        <FlightLogForm initialValue={formTarget ?? undefined} onSubmit={handleFormSubmit} onCancel={closeForm} />
      </Modal>

      <DeleteConfirmModal
        log={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </main>
  );
}
