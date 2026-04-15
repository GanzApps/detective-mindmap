import { renderToStaticMarkup } from 'react-dom/server';
import ForceGraph2D from '@/components/graph/ForceGraph2D';
import { mockCases } from '@/lib/data/mockCases';

describe('ForceGraph2D', () => {
  it('renders the canvas surface with controls and interaction hints', () => {
    const html = renderToStaticMarkup(
      <ForceGraph2D
        graph={mockCases[0].graph}
        selectedNodeId="node-002"
        highlightedNodeIds={['node-002', 'node-007']}
        searchQuery="marco"
        committedSearchNodeId={null}
        nodePositions={{}}
        isActive
        onUpdateNodePosition={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(html).toContain('graph-renderer-2d');
    expect(html).toContain('Zoom to Fit');
    expect(html).toContain('Drag nodes to reposition');
    expect(html).toContain('Active node');
  });
});
