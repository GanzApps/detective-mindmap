'use client';

import { useState } from 'react';
import {
  EntityStatusSchema,
  EntityTypeSchema,
  type GraphNode,
} from '@/lib/graph/graphTypes';
import ModalFrame from '@/components/crud/ModalFrame';

const entityTypes = EntityTypeSchema.options;
const entityStatuses = EntityStatusSchema.options;

export default function EntityModal({
  open,
  nodes,
  onClose,
  onSubmit,
}: {
  open: boolean;
  nodes: GraphNode[];
  onClose: () => void;
  onSubmit: (input: {
    label: string;
    type: (typeof entityTypes)[number];
    status: (typeof entityStatuses)[number];
    parent: string | null;
    properties: Record<string, string>;
  }) => void;
}) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<(typeof entityTypes)[number]>('person');
  const [status, setStatus] = useState<(typeof entityStatuses)[number]>('unknown');
  const [parent, setParent] = useState<string>('');
  const [propertiesText, setPropertiesText] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!label.trim()) {
      return;
    }

    const properties = propertiesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .reduce<Record<string, string>>((accumulator, line) => {
        const [key, ...value] = line.split(':');
        if (!key || value.length === 0) {
          return accumulator;
        }

        accumulator[key.trim()] = value.join(':').trim();
        return accumulator;
      }, {});

    onSubmit({
      label: label.trim(),
      type,
      status,
      parent: parent || null,
      properties,
    });

    setLabel('');
    setType('person');
    setStatus('unknown');
    setParent('');
    setPropertiesText('');
    onClose();
  }

  return (
    <ModalFrame
      open={open}
      title="Add Entity"
      description="Create a new node in the case graph. Properties accept one key:value pair per line."
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Label</span>
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-400"
            placeholder="Nina Patel"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Entity type</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as (typeof entityTypes)[number])}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-400"
            >
              {entityTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as (typeof entityStatuses)[number])}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-400"
            >
              {entityStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Parent node</span>
          <select
            value={parent}
            onChange={(event) => setParent(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-400"
          >
            <option value="">No parent</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Properties</span>
          <textarea
            value={propertiesText}
            onChange={(event) => setPropertiesText(event.target.value)}
            className="min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-400"
            placeholder={'alias: The Courier\ncity: Phoenix'}
          />
        </label>
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Add entity
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}
