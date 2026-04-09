'use client';

import { useState } from 'react';
import { type GraphNode } from '@/lib/graph/graphTypes';
import ModalFrame from '@/components/crud/ModalFrame';

export default function ConnectionModal({
  open,
  nodes,
  onClose,
  onSubmit,
}: {
  open: boolean;
  nodes: GraphNode[];
  onClose: () => void;
  onSubmit: (input: {
    source: string;
    target: string;
    label: string;
  }) => void;
}) {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [label, setLabel] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!source || !target || !label.trim() || source === target) {
      return;
    }

    onSubmit({
      source,
      target,
      label: label.trim(),
    });

    setSource('');
    setTarget('');
    setLabel('');
    onClose();
  }

  return (
    <ModalFrame
      open={open}
      title="Add Connection"
      description="Create a relationship between two existing entities."
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Source</span>
          <select
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-400"
          >
            <option value="">Select source</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Target</span>
          <select
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-400"
          >
            <option value="">Select target</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Relationship label</span>
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-400"
            placeholder="reports to"
          />
        </label>
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Add connection
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}
