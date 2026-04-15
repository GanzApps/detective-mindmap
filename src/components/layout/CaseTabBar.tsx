'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  selectCases,
  selectOpenTabs,
  selectActiveTabCaseId,
  useCaseStore,
  type CreateCaseInput,
} from '@/store/caseStore';
import CaseModal from '@/components/crud/CaseModal';

export default function CaseTabBar() {
  const router = useRouter();
  const cases = useCaseStore(selectCases);
  const openTabs = useCaseStore(selectOpenTabs);
  const activeTabCaseId = useCaseStore(selectActiveTabCaseId);
  const openTab = useCaseStore((state) => state.openTab);
  const closeTab = useCaseStore((state) => state.closeTab);
  const switchTab = useCaseStore((state) => state.switchTab);
  const goHome = useCaseStore((state) => state.goHome);

  const [showCaseModal, setShowCaseModal] = useState(false);

  // Listen for Ctrl+T new-case trigger from CaseShellLayout
  useEffect(() => {
    const handler = () => setShowCaseModal(true);
    window.addEventListener('gsd:new-case', handler);
    return () => window.removeEventListener('gsd:new-case', handler);
  }, []);

  const homeActive = activeTabCaseId === null;

  function handleNewCase(input: CreateCaseInput) {
    const createCase = useCaseStore.getState().createCase;
    const newCase = createCase(input);
    openTab(newCase.id, newCase.name);
  }

  return (
    <>
      <div className="flex h-10 shrink-0 items-center border-b border-shell-border bg-shell-surface px-2">
        {/* Home tab */}
        <button
          type="button"
          onClick={() => {
            router.replace('/cases', { scroll: false });
            goHome();
          }}
          className={`flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium transition ${
            homeActive
              ? 'bg-shell-accent-muted text-shell-text-primary'
              : 'text-shell-text-muted hover:text-shell-text-secondary'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
          </svg>
          Home
        </button>

        {/* Case tabs */}
        {openTabs.map((tab) => {
          const isActive = tab.caseId === activeTabCaseId;
          return (
            <div
              key={tab.caseId}
              className={`group flex h-8 items-center gap-2 border-l border-shell-border pl-3 pr-1 text-xs font-medium transition ${
                isActive
                  ? 'bg-shell-accent-muted text-shell-text-primary'
                  : 'text-shell-text-muted hover:text-shell-text-secondary'
              }`}
            >
              <button
                type="button"
                onClick={() => switchTab(tab.caseId)}
                className="flex-1 truncate text-left"
              >
                {tab.title}
              </button>
              <button
                type="button"
                onClick={() => closeTab(tab.caseId)}
                className="flex h-5 w-5 items-center justify-center rounded opacity-0 transition hover:bg-shell-destructive/20 hover:text-shell-destructive group-hover:opacity-100"
                title="Close tab"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}

        {/* + New button */}
        <button
          type="button"
          onClick={() => setShowCaseModal(true)}
          className="ml-2 flex h-8 items-center gap-1 rounded-md px-3 text-xs font-medium text-shell-text-muted transition hover:bg-shell-surface-raised hover:text-shell-text-secondary"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>
      </div>

      <CaseModal
        open={showCaseModal}
        onClose={() => setShowCaseModal(false)}
        onSubmit={handleNewCase}
      />
    </>
  );
}
