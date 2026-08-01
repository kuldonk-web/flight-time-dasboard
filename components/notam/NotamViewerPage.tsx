'use client';

import { useState } from 'react';
import { useNotamViewer } from '@/hooks/useNotamViewer';
import { NotamRealizationChart } from '@/components/notam/NotamRealizationChart';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type { NotamEntry, NotamEntryInput } from '@/types/flight';

function todayUtcDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm: NotamEntryInput = { notamNumber: '', description: '', closingDate: '', documentLink: '' };

export function NotamViewerPage() {
  const { notams, activeCount, expiredCount, createNotam, editNotam, removeNotam, isSyncing, isCloudEnabled } =
    useNotamViewer();
  const { showToast } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<NotamEntryInput>(emptyForm);

  const [viewingId, setViewingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const viewingNotam = notams.find((n) => n.id === viewingId) ?? null;

  function handleOpenAdd() {
    setAddForm(emptyForm);
    setShowAddModal(true);
  }

  function handleSaveAdd() {
    if (!addForm.notamNumber.trim()) {
      showToast('No. NOTAM wajib diisi.', 'error');
      return;
    }
    createNotam(addForm);
    setShowAddModal(false);
    showToast('NOTAM baru berhasil ditambahkan.', 'success');
  }

  function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    removeNotam(pendingDeleteId);
    setPendingDeleteId(null);
    if (viewingId === pendingDeleteId) setViewingId(null);
    showToast('NOTAM berhasil dihapus.', 'success');
  }

  const today = todayUtcDateStr();

  return (
    <div className="flex w-full flex-col gap-5 px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-surface-raised p-4">
        <div className="flex-1">
          <h1 className="font-display text-lg font-semibold text-text-primary">Database NOTAM</h1>
          <p className="text-sm text-text-secondary">Daftar Notice to Airmen (NOTAM) aktif beserta dokumen lampiran.</p>
        </div>
        {isCloudEnabled && (
          <span className="text-xs text-text-muted">{isSyncing ? 'Menyinkronkan…' : 'Cloud aktif'}</span>
        )}
        <Button onClick={handleOpenAdd}>+ Tambah NOTAM Baru</Button>
      </div>

      {/* Tabel */}
      <div className="w-full rounded-sm border border-border">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[5%]" />
            <col className="w-[14%]" />
            <col className="w-[46%]" />
            <col className="w-[15%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead>
            <tr className="bg-surface-raised text-xs uppercase tracking-wide text-text-secondary">
              <th className="border border-border px-2 py-2">No</th>
              <th className="border border-border px-2 py-2">No NOTAM</th>
              <th className="border border-border px-2 py-2">Deskripsi</th>
              <th className="border border-border px-2 py-2">Tanggal Tutup</th>
              <th className="border border-border px-2 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {notams.map((n, idx) => {
              const isExpired = n.closingDate && n.closingDate < today;
              return (
                <tr key={n.id} className="text-text-primary odd:bg-surface even:bg-surface/60">
                  <td className="border border-border px-2 py-2 text-center font-data text-text-secondary">{idx + 1}</td>
                  <td className="border border-border px-2 py-2">
                    <button
                      onClick={() => setViewingId(n.id)}
                      className="font-data font-medium text-accent-cyan hover:underline"
                    >
                      {n.notamNumber || '(tanpa nomor)'}
                    </button>
                  </td>
                  <td className="border border-border px-2 py-2 text-text-secondary">
                    <span className="line-clamp-2">{n.description || '-'}</span>
                  </td>
                  <td className={`border border-border px-2 py-2 font-data ${isExpired ? 'text-status-alert' : 'text-text-primary'}`}>
                    {n.closingDate || '-'}
                    {isExpired && <span className="ml-1 text-[10px] uppercase">(Kadaluarsa)</span>}
                  </td>
                  <td className="border border-border px-2 py-2">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setViewingId(n.id)} aria-label="Lihat detail" className="text-accent-cyan hover:underline">
                        Lihat
                      </button>
                      <button onClick={() => setPendingDeleteId(n.id)} aria-label="Hapus NOTAM" className="text-status-alert hover:underline">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {notams.length === 0 && (
              <tr>
                <td colSpan={5} className="border border-border px-2 py-8 text-center text-sm text-text-muted">
                  Belum ada NOTAM. Klik &quot;+ Tambah NOTAM Baru&quot; untuk menambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grafik realisasi — di paling bawah halaman */}
      <NotamRealizationChart notams={notams} activeCount={activeCount} expiredCount={expiredCount} />

      {/* Modal: Tambah NOTAM */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah NOTAM Baru" size="md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">No. NOTAM</label>
            <input
              value={addForm.notamNumber}
              onChange={(e) => setAddForm({ ...addForm, notamNumber: e.target.value.toUpperCase() })}
              placeholder="A3937/25"
              className="h-9 rounded-sm border border-border bg-surface px-2 font-data text-sm text-text-primary outline-none focus:bg-surface-raised"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Deskripsi</label>
            <textarea
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              placeholder="ALL DEP/ARR ACFT ARE EXP DLA DUE TO VIP MOV"
              rows={4}
              className="resize-none rounded-sm border border-border bg-surface p-2 text-sm text-text-primary outline-none focus:bg-surface-raised"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Tanggal Tutup</label>
            <input
              type="date"
              value={addForm.closingDate}
              onChange={(e) => setAddForm({ ...addForm, closingDate: e.target.value })}
              className="h-9 rounded-sm border border-border bg-surface px-2 font-data text-sm text-text-primary outline-none focus:bg-surface-raised"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Link Dokumen (opsional)</label>
            <input
              value={addForm.documentLink}
              onChange={(e) => setAddForm({ ...addForm, documentLink: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="h-9 rounded-sm border border-border bg-surface px-2 text-sm text-text-primary outline-none focus:bg-surface-raised"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveAdd}>Tambah</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Lihat / Edit NOTAM (auto-save saat diubah) */}
      <Modal open={!!viewingNotam} onClose={() => setViewingId(null)} title="Detail NOTAM" size="md">
        {viewingNotam && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">No. NOTAM</label>
              <input
                value={viewingNotam.notamNumber}
                onChange={(e) => editNotam(viewingNotam.id, { notamNumber: e.target.value.toUpperCase() })}
                className="h-9 rounded-sm border border-border bg-surface px-2 font-data text-sm text-text-primary outline-none focus:bg-surface-raised"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">Deskripsi</label>
              <textarea
                value={viewingNotam.description}
                onChange={(e) => editNotam(viewingNotam.id, { description: e.target.value })}
                rows={4}
                className="resize-none rounded-sm border border-border bg-surface p-2 text-sm text-text-primary outline-none focus:bg-surface-raised"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">Tanggal Tutup</label>
              <input
                type="date"
                value={viewingNotam.closingDate}
                onChange={(e) => editNotam(viewingNotam.id, { closingDate: e.target.value })}
                className="h-9 rounded-sm border border-border bg-surface px-2 font-data text-sm text-text-primary outline-none focus:bg-surface-raised"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">Link Dokumen</label>
              <input
                value={viewingNotam.documentLink}
                onChange={(e) => editNotam(viewingNotam.id, { documentLink: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="h-9 rounded-sm border border-border bg-surface px-2 text-sm text-text-primary outline-none focus:bg-surface-raised"
              />
              {viewingNotam.documentLink && (
                <a
                  href={viewingNotam.documentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-xs text-accent-cyan hover:underline"
                >
                  Buka dokumen ↗
                </a>
              )}
            </div>
            <div className="flex justify-between gap-2 pt-2">
              <Button variant="danger" onClick={() => setPendingDeleteId(viewingNotam.id)}>
                Hapus
              </Button>
              <Button variant="secondary" onClick={() => setViewingId(null)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Konfirmasi hapus */}
      <Modal open={!!pendingDeleteId} onClose={() => setPendingDeleteId(null)} title="Hapus NOTAM?" size="sm">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-text-secondary">Yakin ingin menghapus NOTAM ini? Tindakan ini tidak bisa dibatalkan.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPendingDeleteId(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Ya, Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
