'use client';

import { useState } from 'react';
import { type Case } from '@/lib/data/dataTypes';
import ModalFrame from '@/components/crud/ModalFrame';

export default function CaseModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    description: string;
    status: Case['status'];
  }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Case['status']>('active');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      status,
    });

    setName('');
    setDescription('');
    setStatus('active');
    onClose();
  }

  return (
    <ModalFrame
      open={open}
      title="Create Case"
      description="Start a new investigation shell with a name, summary, and status."
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Case name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-400"
            placeholder="Operation Glassline"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-400"
            placeholder="What is this case about?"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as Case['status'])}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-400"
          >
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Create case
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}
