'use client';

import { type EvidenceCategory, type EvidenceFile } from '@/lib/data/dataTypes';

export default function EvidenceSidebar({
  evidence,
  selectedEvidenceId,
  onEvidenceSelect,
}: {
  evidence: EvidenceCategory[];
  selectedEvidenceId: string | null;
  onEvidenceSelect: (file: EvidenceFile) => void;
}) {
  return (
    <aside className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/30">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
          Evidence Sidebar
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-50">Filed Evidence</h2>
      </div>
      <div className="space-y-4">
        {evidence.map((category) => (
          <section key={category.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
                {category.name}
              </h3>
              <span className="text-xs text-slate-500">{category.files.length} files</span>
            </div>
            <div className="space-y-2">
              {category.files.map((file) => {
                const isActive = selectedEvidenceId === file.id;

                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => onEvidenceSelect(file)}
                    className={`block w-full rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-50'
                        : 'border-slate-800 bg-slate-900/50 text-slate-200 hover:border-slate-600 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {file.type.replace('_', ' ')}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">{file.size}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
