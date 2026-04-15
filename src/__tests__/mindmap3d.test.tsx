import { renderToStaticMarkup } from 'react-dom/server';
import MindMap3D from '@/components/graph/MindMap3D';
import { mockCases } from '@/lib/data/mockCases';

describe('MindMap3D', () => {
  it('renders the control surface and panel shell', () => {
    const html = renderToStaticMarkup(
      <MindMap3D
        graph={mockCases[0].graph}
        selectedNodeId="node-002"
        highlightedNodeIds={['node-002', 'node-007']}
        searchQuery=""
        committedSearchNodeId={null}
        nodePositions={{}}
        isActive
        onUpdateNodePosition={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(html).toContain('graph-renderer-3d');
    expect(html).toContain('Reset');
    expect(html).toContain('Pause');
    expect(html).toContain('Left drag to rotate');
    expect(html).not.toContain('Explore topic');
  });
});
