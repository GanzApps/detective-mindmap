/** @jest-environment jsdom */

import { act, render, screen } from '@testing-library/react';
import CaseShellLayout from '@/components/layout/CaseShellLayout';
import { mockCases } from '@/lib/data/mockCases';
import { useCaseStore } from '@/store/caseStore';

// Mutable so individual tests can change which tab the URL reports.
// The closure in useSearchParams reads this at call-time.
let mockTabParam: string | null = null;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'tab' ? mockTabParam : null),
  }),
  usePathname: () => '/cases',
}));

jest.mock('@/components/layout/CaseTabBar', () => ({
  __esModule: true,
  default: () => <div data-testid="case-tab-bar" />,
}));

jest.mock('@/components/pages/CaseListPage', () => ({
  __esModule: true,
  default: () => <div data-testid="case-list-page" />,
}));

jest.mock('@/components/pages/CaseWorkspacePage', () => ({
  __esModule: true,
  default: ({ caseId }: { caseId: string }) => (
    <div data-testid="case-workspace-page" data-case-id={caseId} />
  ),
}));

const baseCase = mockCases[0];

function resetStore(overrides: Partial<Parameters<typeof useCaseStore.setState>[0]> = {}) {
  useCaseStore.setState({
    cases: [baseCase],
    openTabs: [],
    activeTabCaseId: null,
    perTabState: {},
    ...overrides,
  });
}

describe('CaseShellLayout', () => {
  beforeEach(() => {
    mockTabParam = null;
    resetStore();
  });

  it('shows CaseListPage when no tab is active', () => {
    render(<CaseShellLayout />);

    expect(screen.getByTestId('case-list-page')).toBeInTheDocument();
    expect(screen.queryByTestId('case-workspace-page')).not.toBeInTheDocument();
  });

  it('shows CaseWorkspacePage for the active tab', () => {
    resetStore({
      openTabs: [{ caseId: baseCase.id, title: baseCase.name }],
      activeTabCaseId: baseCase.id,
    });

    render(<CaseShellLayout />);

    expect(screen.getByTestId('case-workspace-page')).toBeInTheDocument();
    expect(screen.getByTestId('case-workspace-page').dataset.caseId).toBe(baseCase.id);
    expect(screen.queryByTestId('case-list-page')).not.toBeInTheDocument();
  });

  /**
   * Regression: circular URL sync.
   *
   * Old bug: the tabFromUrl effect depended on `openTabs`.  Closing a tab
   * changed `openTabs`, re-triggered the effect, which saw a stale URL param
   * (router.replace hadn't flushed yet) and immediately called `openTab`
   * — so the closed tab was re-opened on every close attempt.
   *
   * Fix: tabFromUrl effect only re-runs when `tabFromUrl` itself changes, not
   * when openTabs changes.  Store state is read via a latestRef so the closure
   * is always fresh without being a reactive dependency.
   */
  it('closing the active tab shows home without reopening via stale URL (regression)', () => {
    // URL still reports ?tab=<id> — simulates the window before router.replace flushes
    mockTabParam = baseCase.id;

    resetStore({
      openTabs: [{ caseId: baseCase.id, title: baseCase.name }],
      activeTabCaseId: baseCase.id,
    });

    render(<CaseShellLayout />);
    expect(screen.getByTestId('case-workspace-page')).toBeInTheDocument();

    // Close the tab while the URL still has ?tab=<id>
    act(() => {
      useCaseStore.getState().closeTab(baseCase.id);
    });

    // Fix: tab stays closed, home view is shown
    expect(screen.queryByTestId('case-workspace-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('case-list-page')).toBeInTheDocument();
    expect(useCaseStore.getState().openTabs).toHaveLength(0);
  });

  /**
   * Regression: goHome circular URL sync.
   *
   * Old bug: the tabFromUrl effect depended on `activeTabCaseId`.  Calling
   * goHome() set activeTabCaseId=null, which re-triggered the effect.  The
   * effect then read the stale URL param and called switchTab() — making the
   * tab active again immediately.
   */
  it('goHome switches to home view without the tab re-activating via stale URL (regression)', () => {
    mockTabParam = baseCase.id;

    resetStore({
      openTabs: [{ caseId: baseCase.id, title: baseCase.name }],
      activeTabCaseId: baseCase.id,
    });

    render(<CaseShellLayout />);
    expect(screen.getByTestId('case-workspace-page')).toBeInTheDocument();

    act(() => {
      useCaseStore.getState().goHome();
    });

    // Fix: home view shown, activeTabCaseId stays null
    expect(screen.queryByTestId('case-workspace-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('case-list-page')).toBeInTheDocument();
    expect(useCaseStore.getState().activeTabCaseId).toBeNull();
  });

  it('URL tab param on initial load opens a matching case as a tab', () => {
    // URL has ?tab=<id> but no tab is open yet
    mockTabParam = baseCase.id;

    render(<CaseShellLayout />);

    // The tabFromUrl effect fires on mount and opens the tab
    expect(useCaseStore.getState().openTabs).toHaveLength(1);
    expect(useCaseStore.getState().activeTabCaseId).toBe(baseCase.id);
  });

  it('Ctrl+W closes the active tab', () => {
    resetStore({
      openTabs: [{ caseId: baseCase.id, title: baseCase.name }],
      activeTabCaseId: baseCase.id,
    });

    render(<CaseShellLayout />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', ctrlKey: true }));
    });

    expect(useCaseStore.getState().openTabs).toHaveLength(0);
    expect(useCaseStore.getState().activeTabCaseId).toBeNull();
  });

  it('Ctrl+1 switches to the first open tab', () => {
    const secondCase = { ...baseCase, id: 'case-999', name: 'Second Case' };

    resetStore({
      cases: [baseCase, secondCase],
      openTabs: [
        { caseId: baseCase.id, title: baseCase.name },
        { caseId: secondCase.id, title: secondCase.name },
      ],
      activeTabCaseId: secondCase.id,
    });

    render(<CaseShellLayout />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', ctrlKey: true }));
    });

    expect(useCaseStore.getState().activeTabCaseId).toBe(baseCase.id);
  });
});
