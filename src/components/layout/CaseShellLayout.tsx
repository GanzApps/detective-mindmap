'use client';

import { useMemo, useEffect } from 'react';
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

  // Auto-navigate to /cases when last tab is closed
  useEffect(() => {
    if (openTabs.length === 0) {
      router.replace('/cases');
    }
  }, [openTabs.length, router]);

  // Sync URL param on mount and when active tab changes
  const tabFromUrl = searchParams.get('tab');

  // Open a tab if the URL has a tab param and it's not already open
  useMemo(() => {
    if (tabFromUrl && !openTabs.some((t) => t.caseId === tabFromUrl)) {
      const caseData = cases.find((c) => c.id === tabFromUrl);
      if (caseData) {
        openTab(caseData.id, caseData.name);
      }
    }
  }, [tabFromUrl, openTabs, cases, openTab]);

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
