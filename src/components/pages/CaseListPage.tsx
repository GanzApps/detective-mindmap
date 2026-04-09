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
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_38%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-8 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">
                App Shell
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-50">
                Investigation Cases
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Enter the workspace through a live case board instead of an admin screen.
                Each case exposes current graph counts, last movement, and the route into
                the workspace shell.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-200">
                {cases.length} cases
              </div>
              <button
                type="button"
                onClick={() => setShowCaseModal(true)}
                className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Create case
              </button>
            </div>
          </div>
          <p className="mt-5 text-sm text-slate-400">
            {error ?? (isLoading ? 'Loading cases...' : 'Repository-backed state is live.')}
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((caseData) => (
            <Link
              key={caseData.id}
              href={`/cases/${caseData.id}`}
              className="group rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">
                    {caseData.status}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
                    {caseData.name}
                  </h2>
                </div>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                  Open
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                {caseData.description}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Entities</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-50">
                    {caseData.graph.nodes.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Connections</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-50">
                    {caseData.graph.edges.length}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
                <span>Updated {formatDate(caseData.updatedAt)}</span>
                <span className="transition group-hover:text-cyan-200">Enter workspace</span>
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
