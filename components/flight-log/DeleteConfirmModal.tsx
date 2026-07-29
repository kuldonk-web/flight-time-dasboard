import type { FlightLog } from '@/types/flight';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeleteConfirmModalProps {
  log: FlightLog | null;
  onConfirm: (log: FlightLog) => void;
  onClose: () => void;
}

export function DeleteConfirmModal({ log, onConfirm, onClose }: DeleteConfirmModalProps) {
  return (
    <Modal open={!!log} onClose={onClose} title="Hapus Log Penerbangan" size="sm">
      {log && (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-text-secondary">
            Hapus log <span className="font-data text-text-primary">{log.flightNumber}</span> tanggal{' '}
            <span className="font-data text-text-primary">{log.date}</span>? Karena data tersimpan
            lokal di browser ini, tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button variant="danger" onClick={() => onConfirm(log)}>
              Hapus Permanen
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
