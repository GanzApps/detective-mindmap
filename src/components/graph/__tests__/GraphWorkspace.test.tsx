/** @jest-environment jsdom */

import { createRef, forwardRef, useImperativeHandle } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import GraphWorkspace, { type GraphWorkspaceExportHandle } from '@/components/graph/GraphWorkspace';
import { mockCases } from '@/lib/data/mockCases';
import { DEFAULT_LAYER_PREFERENCES, ENTITY_FILTER_OPTIONS, useCaseStore } from '@/store/caseStore';

jest.mock('@/components/graph/ForceGraph2D', () => ({
  __esModule: true,
  default: forwardRef(({
    selectedNodeId,
    highlightedNodeIds,
    activeEntityTypes,
    showEdgeLabels,
    showNodeLabels,
    focusSelectedNeighborhood,
  }: {
    selectedNodeId: string | null;
    highlightedNodeIds: string[];
    activeEntityTypes: string[];
    showEdgeLabels: boolean;
    showNodeLabels: boolean;
    focusSelectedNeighborhood: boolean;
  }, ref) => {
    useImperativeHandle(ref, () => ({
      getCanvas: () => ({ width: 800, height: 600, dataset: { renderer: '2d' } }),
      redrawForExport: () => {},
      captureDataUrl: () => 'data:image/png;base64,2d',
      panTo: () => {},
      panMove: () => {},
    }));

    return (
      <div data-testid="force-graph-2d">
        2D renderer shell {selectedNodeId ?? 'none'} / {highlightedNodeIds.length} / {activeEntityTypes.length} / {String(showEdgeLabels)} / {String(showNodeLabels)} / {String(focusSelectedNeighborhood)}
      </div>
    );
  }),
}));

jest.mock('@/components/graph/MindMap3D', () => ({
  __esModule: true,
  default: forwardRef(({
    selectedNodeId,
    highlightedNodeIds,
    activeEntityTypes,
    showNodeLabels,
    focusSelectedNeighborhood,
  }: {
    selectedNodeId: string | null;
    highlightedNodeIds: string[];
    activeEntityTypes: string[];
    showNodeLabels: boolean;
    focusSelectedNeighborhood: boolean;
  }, ref) => {
    useImperativeHandle(ref, () => ({
      getCanvas: () => ({ width: 1024, height: 768, dataset: { renderer: '3d' } }),
      redrawForExport: () => {},
      captureDataUrl: () => 'data:image/png;base64,3d',
      panTo: () => {},
      panMove: () => {},
    }));

    return (
      <div data-testid="mindmap-3d">
        3D renderer shell {selectedNodeId ?? 'none'} / {highlightedNodeIds.length} / {activeEntityTypes.length} / {String(showNodeLabels)} / {String(focusSelectedNeighborhood)}
      </div>
    );
  }),
}));

describe('GraphWorkspace', () => {
  beforeEach(() => {
    useCaseStore.setState({
      activeFilters: [...ENTITY_FILTER_OPTIONS],
      layerPreferences: DEFAULT_LAYER_PREFERENCES,
    });
  });

  it('keeps both renderer shells mounted and shows the persistent minimap shell', () => {
    render(
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

    expect(screen.getByTestId('force-graph-2d')).toBeInTheDocument();
    expect(screen.getByTestId('mindmap-3d')).toBeInTheDocument();
    expect(screen.getByLabelText('Workspace minimap')).toBeInTheDocument();
  });

  it('dismisses the shared panel on Escape', () => {
    const onSelectNode = jest.fn();

    render(
      <GraphWorkspace
        caseData={mockCases[0]}
        viewMode="3d"
        selectedNodeId="node-002"
        highlightedNodeIds={['node-002']}
        searchQuery=""
        committedSearchNodeId={null}
        onSetViewMode={() => {}}
        onSelectNode={onSelectNode}
      />,
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onSelectNode).toHaveBeenCalledWith(null);
  });

  it('exposes the active renderer export target through the shared ref', () => {
    const workspaceRef = createRef<GraphWorkspaceExportHandle>();

    render(
      <GraphWorkspace
        ref={workspaceRef}
        caseData={mockCases[0]}
        viewMode="3d"
        selectedNodeId="node-002"
        highlightedNodeIds={['node-002']}
        searchQuery=""
        committedSearchNodeId={null}
        onSetViewMode={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(workspaceRef.current?.captureActiveViewDataUrl()).toBe('data:image/png;base64,3d');
    expect(workspaceRef.current?.getActiveCanvas()).toEqual(
      expect.objectContaining({ width: 1024, height: 768 }),
    );
    expect(workspaceRef.current?.getActiveCaptureElement()).toBeInstanceOf(HTMLDivElement);
  });
});
