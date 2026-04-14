'use client';

import { useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import CaseTabBar from '@/components/layout/CaseTabBar';
import CaseListPage from '@/components/pages/CaseListPage';
import CaseWorkspacePage from '@/components/pages/CaseWorkspacePage';
import {
  selectCases,
  selectOpenTabs,
  selectActiveTabCaseId,
  useCaseStore,
} from '@/store/caseStore';

export default function CaseShellLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cases = useCaseStore(selectCases);
  const openTabs = useCaseStore(selectOpenTabs);
  const activeTabCaseId = useCaseStore(selectActiveTabCaseId);
  const openTab = useCaseStore((state) => state.openTab);
  const closeTab = useCaseStore((state) => state.closeTab);
  const switchTab = useCaseStore((state) => state.switchTab);

  // Task 7: URL sync — update URL when active tab changes
  useEffect(() => {
    if (activeTabCaseId) {
      router.replace(`/cases?tab=${activeTabCaseId}`, { scroll: false });
    } else {
      router.replace('/cases', { scroll: false });
    }
  }, [activeTabCaseId, router]);

  // Auto-navigate to /cases when last tab is closed
  useEffect(() => {
    if (openTabs.length === 0 && activeTabCaseId === null) {
      router.replace('/cases', { scroll: false });
    }
  }, [openTabs.length, activeTabCaseId, router]);

  // Open a tab if the URL has a tab param and it's not already open
  const tabFromUrl = searchParams.get('tab');
  useMemo(() => {
    if (tabFromUrl && !openTabs.some((t) => t.caseId === tabFromUrl)) {
      const caseData = cases.find((c) => c.id === tabFromUrl);
      if (caseData) {
        openTab(caseData.id, caseData.name);
      }
    }
  }, [tabFromUrl, openTabs, cases, openTab]);

  // Task 8: Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if focus is in an input/textarea
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const isMod = e.ctrlKey || e.metaKey;

    if (isMod && e.key === 'w') {
      e.preventDefault();
      if (activeTabCaseId) closeTab(activeTabCaseId);
    }

    if (isMod && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const idx = parseInt(e.key, 10) - 1;
      if (idx < openTabs.length) {
        switchTab(openTabs[idx].caseId);
      }
    }
  }, [activeTabCaseId, openTabs, closeTab, switchTab]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Expose "trigger new case" for keyboard shortcut from CaseTabBar
  useEffect(() => {
    (window as any).__triggerNewCaseModal = () => {
      // Dispatch a custom event that CaseTabBar listens to
      window.dispatchEvent(new CustomEvent('gsd:new-case'));
    };
  }, []);

  const hasOpenTabs = openTabs.length > 0;

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Tab bar — always visible */}
      <CaseTabBar />

      {/* Content area — scrollable */}
      <div className="flex-1 overflow-auto">
        {hasOpenTabs && activeTabCaseId ? (
          <CaseWorkspacePage caseId={activeTabCaseId} />
        ) : (
          <CaseListPage />
        )}
      </div>
    </div>
  );
}
