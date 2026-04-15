/** @jest-environment jsdom */

import { act } from '@testing-library/react';
import { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CaseWorkspaceShell from '@/components/layout/CaseWorkspaceShell';
import GraphWorkspace, { type GraphWorkspaceExportHandle, shouldDismissNodeDetail } from '@/components/graph/GraphWorkspace';
import { mockCases } from '@/lib/data/mockCases';
import {
  DEFAULT_LAYER_PREFERENCES,
  ENTITY_FILTER_OPTIONS,
  useCaseStore,
} from '@/store/caseStore';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const baseState = {
  cases: [],
  activeCaseId: null,
  selectedNodeId: null,
  activeFilters: [...ENTITY_FILTER_OPTIONS],
  layerPreferences: DEFAULT_LAYER_PREFERENCES,
  highlightedEvidenceId: null,
  highlightedEntityIds: [],
  viewMode: '2d' as const,
};

describe('app shell smoke', () => {
  beforeEach(() => {
    useCaseStore.setState(baseState);
    window.localStorage.clear();
  });

  it('supports the shared create to mutate flow through the store', () => {
    const createdCase = useCaseStore.getState().createCase({
      name: 'Operation Glassline',
      description: 'Shell test case',
      status: 'active',
    });

    const firstNode = useCaseStore.getState().addEntity(createdCase.id, {
      label: 'Nina Patel',
      type: 'person',
      status: 'suspect',
      parent: null,
      properties: {
        city: 'Phoenix',
      },
    });

    const secondNode = useCaseStore.getState().addEntity(createdCase.id, {
      label: 'South Phoenix',
      type: 'location',
      status: 'confirmed',
      parent: null,
      properties: {
        city: 'Phoenix',
      },
    });

    expect(firstNode).not.toBeNull();
    expect(secondNode).not.toBeNull();

    useCaseStore.getState().addConnection(createdCase.id, {
      source: firstNode!.id,
      target: secondNode!.id,
      label: 'operates in',
    });

    const mutatedCase = useCaseStore.getState().cases.find((item) => item.id === createdCase.id);

    expect(mutatedCase?.name).toBe('Operation Glassline');
    expect(mutatedCase?.graph.nodes).toHaveLength(2);
    expect(mutatedCase?.graph.edges).toHaveLength(1);
  });

  it('renders the shared graph workspace with both renderer shells and the persistent minimap', () => {
    const html = renderToStaticMarkup(
      <GraphWorkspace
        caseData={mockCases[0]}
        viewMode="2d"
        selectedNodeId="node-002"
        highlightedNodeIds={['node-002', 'node-007']}
        searchQuery="Marco"
        committedSearchNodeId="node-002"
        onSetViewMode={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(html).toContain('graph-renderer-2d');
    expect(html).toContain('graph-renderer-3d');
    expect(html).toContain('Minimap');
    expect(html).toContain('display:block');
    expect(html).toContain('display:none');
  });

  it('renders the workspace shell with evidence and shared graph integration', () => {
    const html = renderToStaticMarkup(
      <CaseWorkspaceShell
        caseData={mockCases[0]}
        highlightedEvidenceId={mockCases[0].evidence[0].files[0].id}
        highlightedEntityIds={['node-002', 'node-007']}
        selectedNodeId="node-002"
        viewMode="3d"
        onSetViewMode={() => {}}
        onSelectEvidence={() => {}}
        onCreateEntity={() => {}}
        onCreateConnection={() => {}}
        onDeleteEntity={() => {}}
        onDeleteConnection={() => {}}
        onSelectNode={() => {}}
        onClearHighlights={() => {}}
        onExport={() => {}}
        isExporting={false}
        graphWorkspaceRef={createRef<GraphWorkspaceExportHandle>()}
        aiResult={null}
        aiQuickCommands={[
          {
            id: 'cmd-1',
            prompt: '/find suspicious patterns',
            label: 'Suspicious patterns',
            kind: 'static',
          },
        ]}
        commandHistory={[]}
        commandStatus="idle"
        commandStatusMessage="Known intents are ready."
        onExecuteCommand={() => {}}
        onDismissAIResult={() => {}}
      />,
    );

    expect(html).toContain('Operation Nightfall');
    expect(html).toContain('Evidence');
    expect(html).toContain('Filters');
    expect(html).toContain('Search nodes');
    expect(html).toContain('Export');
    expect(html).toContain('Marco Delgado');
    expect(html).toContain('Command Center');
    expect(html).toContain('Timeline');
    expect(html).toContain('iPhone_14_extraction.zip');
  });

  it('treats Escape as the shared node-detail dismiss key', () => {
    expect(shouldDismissNodeDetail('Escape')).toBe(true);
    expect(shouldDismissNodeDetail('Enter')).toBe(false);
  });

  it('rehydrates persisted workspace state from localStorage', async () => {
    useCaseStore.setState(baseState);

    window.localStorage.setItem('case-workspace-store', JSON.stringify({
      state: {
        cases: [mockCases[0]],
        activeCaseId: mockCases[0].id,
        selectedNodeId: 'node-002',
        activeFilters: ['person', 'evidence'],
        layerPreferences: {
          showEdgeLabels: false,
          showNodeLabels: true,
          focusSelectedNeighborhood: false,
        },
        highlightedEvidenceId: mockCases[0].evidence[0].files[0].id,
        highlightedEntityIds: ['node-002'],
        viewMode: '3d',
      },
      version: 0,
    }));

    await act(async () => {
      await useCaseStore.persist.rehydrate();
    });

    expect(useCaseStore.getState().activeCaseId).toBe(mockCases[0].id);
    expect(useCaseStore.getState().selectedNodeId).toBe('node-002');
    expect(useCaseStore.getState().activeFilters).toEqual(['person', 'evidence']);
    expect(useCaseStore.getState().layerPreferences.showEdgeLabels).toBe(false);
    expect(useCaseStore.getState().viewMode).toBe('3d');
  });
});
