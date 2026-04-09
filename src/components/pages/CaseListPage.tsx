'use client';

import Link from 'next/link';
import { useState } from 'react';
import CaseModal from '@/components/crud/CaseModal';
import { useCaseListData } from '@/hooks/useCaseData';
import { useCaseStore } from '@/store/caseStore';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function CaseListPage() {
  const { cases, isLoading, error } = useCaseListData();
  const createCase = useCaseStore((state) => state.createCase);
  const [showCaseModal, setShowCaseModal] = useState(false);

  return (
    <main className="min-h-screen bg-shell-bg px-shell-lg py-shell-xl text-shell-text-primary">
      <div className="mx-auto max-w-6xl space-y-shell-lg">

        {/* Page header band */}
        <section className="rounded-shell-xl border border-shell-border bg-shell-surface px-shell-lg py-shell-lg shadow-shell-md">
          <div className="flex flex-col gap-shell-md lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-shell-text-muted">
                Investigation Cases
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-shell-text-primary">
                Cases
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-shell-text-secondary">
                Open a case to launch the investigation workspace and explore the
                entity graph, evidence trail, and connections.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-shell-sm">
              <span className="rounded-shell-pill border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm text-sm text-shell-text-secondary">
                {cases.length} {cases.length === 1 ? 'case' : 'cases'}
              </span>
              <button
                type="button"
                onClick={() => setShowCaseModal(true)}
                className="rounded-shell-pill bg-shell-accent px-shell-md py-shell-sm text-sm font-semibold text-shell-accent-fg transition hover:bg-[var(--shell-accent-hover)]"
              >
                New case
              </button>
            </div>
          </div>
          {(error || isLoading) && (
            <p className="mt-shell-sm text-sm text-shell-text-muted">
              {error ?? 'Loading cases\u2026'}
            </p>
          )}
        </section>

        {/* Case grid */}
        <section className="grid gap-shell-md md:grid-cols-2 xl:grid-cols-3">
          {cases.map((caseData) => (
            <Link
              key={caseData.id}
              href={`/cases/${caseData.id}`}
              className="group rounded-shell-xl border border-shell-border bg-shell-surface p-shell-lg shadow-shell-sm transition hover:-translate-y-0.5 hover:border-[var(--shell-accent)] hover:shadow-shell-md"
            >
              <div className="flex items-start justify-between gap-shell-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-shell-text-muted">
                    {caseData.status}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-shell-text-primary">
                    {caseData.name}
                  </h2>
                </div>
                <span className="rounded-shell-pill border border-shell-border px-shell-sm py-1 text-xs uppercase tracking-widest text-shell-text-secondary">
                  Open
                </span>
              </div>

              <p className="mt-shell-sm text-sm leading-relaxed text-shell-text-secondary">
                {caseData.description}
              </p>

              <div className="mt-shell-md grid gap-shell-sm sm:grid-cols-2">
                <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm">
                  <p className="text-xs uppercase tracking-widest text-shell-text-muted">Entities</p>
                  <p className="mt-1 text-2xl font-semibold text-shell-text-primary">
                    {caseData.graph.nodes.length}
                  </p>
                </div>
                <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm">
                  <p className="text-xs uppercase tracking-widest text-shell-text-muted">Connections</p>
                  <p className="mt-1 text-2xl font-semibold text-shell-text-primary">
                    {caseData.graph.edges.length}
                  </p>
                </div>
              </div>

              <div className="mt-shell-md flex items-center justify-between text-sm text-shell-text-muted">
                <span>Updated {formatDate(caseData.updatedAt)}</span>
                <span className="text-shell-accent transition group-hover:underline">
                  Open workspace
                </span>
              </div>
            </Link>
          ))}
        </section>

        <CaseModal
          open={showCaseModal}
          onClose={() => setShowCaseModal(false)}
          onSubmit={(input) => {
            createCase(input);
          }}
        />
      </div>
    </main>
  );
}
