import { prepareFrame3D } from '@/lib/graph/renderer3d';
import { buildGraphFromCase } from '@/lib/graph/graphTypes';
import { mockCases } from '@/lib/data/mockCases';

describe('prepareFrame3D', () => {
  it('sorts projected nodes by depth for back-to-front drawing', () => {
    const graph = buildGraphFromCase(mockCases[0]);
    const prepared = prepareFrame3D(
      graph,
      { rotX: 0.28, rotY: 0.55, zoom: 1 },
      { width: 1200, height: 800 },
      { selectedNodeId: 'node-001' },
    );

    expect(prepared.projectedNodes).toHaveLength(graph.nodes.length);
    expect(prepared.sortedNodes[0].depth).toBeLessThanOrEqual(
      prepared.sortedNodes[prepared.sortedNodes.length - 1].depth,
    );
    expect(prepared.connectedNodeIds?.has('node-001')).toBe(true);
  });

  it('tracks highlighted node ids independently from selected neighborhoods', () => {
    const graph = buildGraphFromCase(mockCases[0]);
    const prepared = prepareFrame3D(
      graph,
      { rotX: 0.28, rotY: 0.55, zoom: 1 },
      { width: 1200, height: 800 },
      { highlightedNodeIds: ['node-002', 'node-007'] },
    );

    expect(prepared.highlightedNodeIds.has('node-002')).toBe(true);
    expect(prepared.highlightedNodeIds.has('node-007')).toBe(true);
  });
});
