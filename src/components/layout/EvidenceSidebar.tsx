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
    <aside className="rounded-shell-xl border border-shell-border bg-shell-surface p-shell-md shadow-shell-sm">
      <div className="mb-shell-md">
        <p className="text-xs font-medium uppercase tracking-widest text-shell-text-muted">
          Evidence Sidebar
        </p>
        <h2 className="mt-2 text-xl font-semibold text-shell-text-primary">Filed Evidence</h2>
      </div>
      <div className="space-y-shell-sm">
        {evidence.map((category) => (
          <section key={category.id} className="rounded-shell-lg border border-shell-border bg-shell-surface-raised p-shell-md">
            <div className="mb-shell-sm flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-shell-text-secondary">
                {category.name}
              </h3>
              <span className="text-xs text-shell-text-muted">{category.files.length} files</span>
            </div>
            <div className="space-y-shell-sm">
              {category.files.map((file) => {
                const isActive = selectedEvidenceId === file.id;

                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => onEvidenceSelect(file)}
                    className={`block w-full rounded-shell-lg border px-shell-md py-shell-sm text-left transition ${
                      isActive
                        ? 'border-shell-accent/40 bg-shell-accent-muted text-shell-text-primary'
                        : 'border-shell-border bg-shell-surface text-shell-text-secondary hover:border-shell-border-strong hover:bg-shell-surface-raised'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-shell-sm">
                      <div>
                        <p className="text-sm font-medium text-shell-text-primary">{file.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-widest text-shell-text-muted">
                          {file.type.replace('_', ' ')}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-shell-text-muted">{file.size}</span>
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
