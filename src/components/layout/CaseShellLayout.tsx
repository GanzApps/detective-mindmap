'use client';

import { useMemo } from 'react';
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
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Tab bar — always visible */}
      <CaseTabBar />

      {/* Content area */}
      {hasOpenTabs && activeTabCaseId ? (
        <div className="flex-1 overflow-hidden">
          <CaseWorkspacePage caseId={activeTabCaseId} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <CaseListPage />
        </div>
      )}
    </div>
  );
}
