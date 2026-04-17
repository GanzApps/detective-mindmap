/** @jest-environment jsdom */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import CaseWorkspaceShell from '@/components/layout/CaseWorkspaceShell';
import { type GraphWorkspaceExportHandle } from '@/components/graph/GraphWorkspace';
import { mockCases } from '@/lib/data/mockCases';
import { DEFAULT_LAYER_PREFERENCES, ENTITY_FILTER_OPTIONS, useCaseStore } from '@/store/caseStore';
import { type AIResultPayload } from '@/lib/ai/knownIntents';

jest.mock('@/components/graph/GraphWorkspace', () => ({
  __esModule: true,
  default: () => <div data-testid="graph-workspace" />,
}));

jest.mock('@/components/layout/AICommandBar', () => ({
  __esModule: true,
  default: () => <div data-testid="ai-command-bar" />,
}));

jest.mock('@/components/layout/TimelineBar', () => ({
  __esModule: true,
  default: () => <div data-testid="timeline-bar" />,
}));

const baseCase = mockCases[0];

const mockAIResult: AIResultPayload = {
  intentId: 'suspicious_patterns',
  title: 'Suspects Found',
  subtitle: '3 persons flagged',
  summary: 'Automated analysis complete.',
  findings: ['Finding 1'],
  metrics: [],
  highlightedNodeIds: ['node-001'],
  selectedNodeId: null,
  historyLabel: 'Find suspects',
};

function buildProps(overrides: {
  selectedNodeId?: string | null;
  aiResult?: AIResultPayload | null;
  onSelectNode?: jest.Mock;
  onDismissAIResult?: jest.Mock;
} = {}) {
  return {
    caseData: baseCase,
    highlightedEvidenceId: null,
    highlightedEntityIds: [],
    selectedNodeId: overrides.selectedNodeId ?? null,
    viewMode: '2d' as const,
    onSetViewMode: jest.fn(),
    onSelectEvidence: jest.fn(),
    onCreateEntity: jest.fn(),
    onCreateConnection: jest.fn(),
    onDeleteEntity: jest.fn(),
    onDeleteConnection: jest.fn(),
    onSelectNode: overrides.onSelectNode ?? jest.fn(),
    onClearHighlights: jest.fn(),
    onExport: jest.fn(),
    isExporting: false,
    graphWorkspaceRef: createRef<GraphWorkspaceExportHandle>(),
    aiResult: overrides.aiResult ?? null,
    aiQuickCommands: [],
    commandHistory: [],
    commandStatus: 'idle' as const,
    commandStatusMessage: '',
    onExecuteCommand: jest.fn(),
    onDismissAIResult: overrides.onDismissAIResult ?? jest.fn(),
  };
}

describe('Analysis panel auto-open', () => {
  beforeEach(() => {
    useCaseStore.setState({
      cases: [],
      activeCaseId: null,
      selectedNodeId: null,
      activeFilters: [...ENTITY_FILTER_OPTIONS],
      layerPreferences: DEFAULT_LAYER_PREFERENCES,
      highlightedEvidenceId: null,
      highlightedEntityIds: [],
      viewMode: '2d',
    });
  });

  it('panel is hidden (w-0) when selectedNodeId=null and aiResult=null', () => {
    render(<CaseWorkspaceShell {...buildProps()} />);

    const wrapper = screen.getByTestId('analysis-panel-wrapper');
    expect(wrapper.className).toContain('w-0');
    expect(wrapper.className).not.toContain('w-80');
  });

  it('panel opens (w-80) when selectedNodeId becomes non-null', () => {
    const { rerender } = render(<CaseWorkspaceShell {...buildProps()} />);

    rerender(<CaseWorkspaceShell {...buildProps({ selectedNodeId: 'node-001' })} />);

    const wrapper = screen.getByTestId('analysis-panel-wrapper');
    expect(wrapper.className).toContain('w-80');
    expect(wrapper.className).not.toContain('w-0');
  });

  it('panel opens (w-80) when aiResult becomes non-null', () => {
    const { rerender } = render(<CaseWorkspaceShell {...buildProps()} />);

    rerender(<CaseWorkspaceShell {...buildProps({ aiResult: mockAIResult })} />);

    const wrapper = screen.getByTestId('analysis-panel-wrapper');
    expect(wrapper.className).toContain('w-80');
    expect(wrapper.className).not.toContain('w-0');
  });

  it('panel closes (w-0) when both selectedNodeId and aiResult are cleared', () => {
    const { rerender } = render(
      <CaseWorkspaceShell {...buildProps({ selectedNodeId: 'node-001', aiResult: mockAIResult })} />,
    );

    rerender(<CaseWorkspaceShell {...buildProps({ selectedNodeId: null, aiResult: null })} />);

    const wrapper = screen.getByTestId('analysis-panel-wrapper');
    expect(wrapper.className).toContain('w-0');
    expect(wrapper.className).not.toContain('w-80');
  });

  it('panel X button calls onSelectNode(null) AND onDismissAIResult', () => {
    const onSelectNode = jest.fn();
    const onDismissAIResult = jest.fn();

    render(
      <CaseWorkspaceShell
        {...buildProps({ selectedNodeId: 'node-001', onSelectNode, onDismissAIResult })}
      />,
    );

    const xButton = screen.getByRole('button', { name: '' });
    // The X button is inside the analysis panel header — find it via panel
    const wrapper = screen.getByTestId('analysis-panel-wrapper');
    const closeButton = wrapper.querySelector('button');
    expect(closeButton).not.toBeNull();

    act(() => {
      fireEvent.click(closeButton!);
    });

    expect(onSelectNode).toHaveBeenCalledWith(null);
    expect(onDismissAIResult).toHaveBeenCalledTimes(1);
  });
});
