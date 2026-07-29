'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import type { FlightLog } from '@/types/flight';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { exportLogsToJson, importLogsFromJson, mergeUniqueByIds } from '@/utils/export';

interface ImportExportControlsProps {
  logs: FlightLog[];
  onReplaceAll: (logs: FlightLog[]) => void;
  onMerge: (logs: FlightLog[]) => void;
}

export function ImportExportControls({ logs, onReplaceAll, onMerge }: ImportExportControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Log hasil parsing file yang masih menunggu keputusan strategi user.
  const [pendingImport, setPendingImport] = useState<{
    logs: FlightLog[];
    invalidCount: number;
  } | null>(null);

  function handleExportClick() {
    if (logs.length === 0) {
      showToast('Belum ada log untuk di-export.', 'info');
      return;
    }
    exportLogsToJson(logs);
    showToast(`${logs.length} log berhasil di-export.`, 'success');
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset value supaya file yang sama bisa dipilih ulang di kesempatan berikutnya.
    e.target.value = '';
    if (!file) return;

    const result = await importLogsFromJson(file);

    if (!result.success) {
      showToast(result.error ?? 'Import gagal.', 'error');
      return;
    }

    // Kalau belum ada data lokal sama sekali, tidak perlu tanya strategi — langsung terapkan.
    if (logs.length === 0) {
      onReplaceAll(result.logs);
      reportImportResult(result.validCount, result.invalidCount);
      return;
    }

    setPendingImport({ logs: result.logs, invalidCount: result.invalidCount });
  }

  function reportImportResult(validCount: number, invalidCount: number) {
    if (invalidCount > 0) {
      showToast(`${validCount} log diimpor, ${invalidCount} entry dilewati karena tidak valid.`, 'info');
    } else {
      showToast(`${validCount} log berhasil diimpor.`, 'success');
    }
  }

  function handleReplaceAll() {
    if (!pendingImport) return;
    onReplaceAll(pendingImport.logs);
    reportImportResult(pendingImport.logs.length, pendingImport.invalidCount);
    setPendingImport(null);
  }

  function handleMerge() {
    if (!pendingImport) return;
    const newOnes = mergeUniqueByIds(logs, pendingImport.logs);
    onMerge(newOnes);
    const skippedDuplicates = pendingImport.logs.length - newOnes.length;
    showToast(
      `${newOnes.length} log baru ditambahkan${skippedDuplicates > 0 ? `, ${skippedDuplicates} duplikat dilewati` : ''}.`,
      'success'
    );
    setPendingImport(null);
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={handleExportClick}>
          Export JSON
        </Button>
        <Button variant="secondary" size="sm" onClick={handleImportClick}>
          Import JSON
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <Modal
        open={!!pendingImport}
        onClose={() => setPendingImport(null)}
        title="Pilih Strategi Import"
        size="sm"
      >
        {pendingImport && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-text-secondary">
              File berisi <span className="font-data text-text-primary">{pendingImport.logs.length}</span>{' '}
              log valid, sementara Anda sudah punya{' '}
              <span className="font-data text-text-primary">{logs.length}</span> log tersimpan. Pilih cara
              menggabungkannya:
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" onClick={handleMerge} className="justify-start">
                Merge — tambahkan yang baru, lewati duplikat
              </Button>
              <Button variant="danger" onClick={handleReplaceAll} className="justify-start">
                Replace All — timpa semua data lokal
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
