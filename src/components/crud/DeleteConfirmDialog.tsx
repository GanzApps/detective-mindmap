'use client';

import ModalFrame from '@/components/crud/ModalFrame';

export default function DeleteConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalFrame
      open={open}
      title={title}
      description={description}
      onClose={onClose}
    >
      <div className="space-y-5">
        <p className="text-sm text-slate-400">
          This action mutates the shared case state immediately.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 px-5 py-2 text-sm text-slate-200 transition hover:border-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}
