'use client';

import { useState } from 'react';
import CaseModal from '@/components/crud/CaseModal';
import { useCaseListData } from '@/hooks/useCaseData';
import { useCaseStore } from '@/store/caseStore';
import { useRouter } from 'next/navigation';

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
  const openTab = useCaseStore((state) => state.openTab);
  const router = useRouter();
  const [showCaseModal, setShowCaseModal] = useState(false);

  function handleEnterWorkspace(caseId: string, caseName: string) {
    openTab(caseId, caseName);
    router.replace(`/cases?tab=${caseId}`);
  }

  return (
    <main className="min-h-screen bg-shell-bg px-6 py-8 text-shell-text-primary">
      <div className="mx-auto max-w-6xl space-y-shell-xl">
        <section className="rounded-shell-xl border border-shell-border bg-shell-surface p-shell-xl shadow-shell-lg">
          <div className="flex flex-col gap-shell-lg lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-shell-text-muted">
                App Shell
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-shell-text-primary">
                Investigation Cases
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-shell-text-secondary">
                Enter the workspace through a live case board instead of an admin screen.
                Each case exposes current graph counts, last movement, and the route into
                the workspace shell.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-shell-pill border border-shell-border-strong bg-shell-bg px-4 py-2 text-sm text-shell-text-secondary">
                {cases.length} cases
              </div>
              <button
                type="button"
                onClick={() => setShowCaseModal(true)}
                className="rounded-shell-pill bg-shell-accent px-5 py-2 text-sm font-semibold text-shell-accent-fg transition hover:bg-shell-accent-hover"
              >
                Create case
              </button>
            </div>
          </div>
          <p className="mt-5 text-sm text-shell-text-muted">
            {error ?? (isLoading ? 'Loading cases...' : 'Repository-backed state is live.')}
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((caseData) => (
            <div
              key={caseData.id}
              onClick={() => handleEnterWorkspace(caseData.id, caseData.name)}
              className="group cursor-pointer rounded-shell-xl border border-shell-border bg-shell-surface p-shell-lg shadow-shell-md transition hover:-translate-y-1 hover:border-shell-accent/30 hover:bg-shell-surface-raised"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-shell-text-muted">
                    {caseData.status}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-shell-text-primary">
                    {caseData.name}
                  </h2>
                </div>
                <span className="rounded-shell-pill border border-shell-border-strong px-3 py-1 text-xs uppercase tracking-[0.18em] text-shell-text-secondary">
                  Open
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-shell-text-secondary">
                {caseData.description}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-shell-lg border border-shell-border bg-shell-bg px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">Entities</p>
                  <p className="mt-2 text-2xl font-semibold text-shell-text-primary">
                    {caseData.graph.nodes.length}
                  </p>
                </div>
                <div className="rounded-shell-lg border border-shell-border bg-shell-bg px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">Connections</p>
                  <p className="mt-2 text-2xl font-semibold text-shell-text-primary">
                    {caseData.graph.edges.length}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-shell-text-secondary">
                <span>Updated {formatDate(caseData.updatedAt)}</span>
                <span className="transition group-hover:text-shell-accent">Enter workspace</span>
              </div>
            </div>
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
