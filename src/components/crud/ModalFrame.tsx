'use client';

import { type ReactNode } from 'react';

export default function ModalFrame({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
            {description ? (
              <p className="mt-2 text-sm text-slate-400">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300 transition hover:border-slate-500 hover:text-slate-50"
          >
            Close
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
