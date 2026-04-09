import { renderToStaticMarkup } from 'react-dom/server';
import ForceGraph2D from '@/components/graph/ForceGraph2D';
import { mockCases } from '@/lib/data/mockCases';

describe('ForceGraph2D', () => {
  it('renders the control surface and search shell', () => {
    const html = renderToStaticMarkup(
      <ForceGraph2D
        graph={mockCases[0].graph}
        selectedNodeId="node-002"
        highlightedNodeIds={['node-002', 'node-007']}
        searchQuery="marco"
        isActive
        onSearchQueryChange={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(html).toContain('ForceGraph2D');
    expect(html).toContain('Search nodes');
    expect(html).toContain('Zoom to Fit');
    expect(html).toContain('Drag nodes to reposition');
    expect(html).toContain('Centered on Marco Delgado');
    expect(html).not.toContain('Selected node');
  });
});
