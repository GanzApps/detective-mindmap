import { buildMindMap3DLayout, projectNode3D, projectNodes3D } from '@/lib/graph/projection3d';
import { hitTest3D } from '@/lib/graph/hitTest3d';
import { buildGraphFromCase } from '@/lib/graph/graphTypes';
import { mockCases } from '@/lib/data/mockCases';

describe('buildMindMap3DLayout', () => {
  it('creates a deterministic layout for the case graph', () => {
    const graph = buildGraphFromCase(mockCases[0]);
    const layout = buildMindMap3DLayout(graph);

    expect(layout).toHaveLength(graph.nodes.length);
    expect(layout[0].id).toBeDefined();
    expect(layout.find((node) => node.id === 'node-001')?.tier).toBe(0);
  });
});

describe('projectNode3D', () => {
  it('projects a node into screen space with scale and depth', () => {
    const projected = projectNode3D(
      {
        id: 'node-a',
        x: 200,
        y: 40,
        z: 120,
        tier: 1,
        label: 'Alpha',
        node: mockCases[0].graph.nodes[0],
      },
      { rotX: 0.28, rotY: 0.55, zoom: 1 },
      { width: 1200, height: 800 },
    );

    expect(projected.sx).toBeGreaterThan(0);
    expect(projected.sy).toBeGreaterThan(0);
    expect(projected.scale).toBeGreaterThan(0);
    expect(projected.radius).toBeGreaterThan(0);
  });

  it('projects a full collection of nodes', () => {
    const graph = buildGraphFromCase(mockCases[0]);
    const layout = buildMindMap3DLayout(graph);
    const projected = projectNodes3D(layout, { rotX: 0.28, rotY: 0.55, zoom: 1 }, {
      width: 1200,
      height: 800,
    });

    expect(projected).toHaveLength(layout.length);
  });
});

describe('hitTest3D', () => {
  it('returns the closest projected node inside the padded radius', () => {
    const projected = [
      {
        id: 'node-a',
        sx: 100,
        sy: 100,
        radius: 12,
      },
      {
        id: 'node-b',
        sx: 150,
        sy: 100,
        radius: 12,
      },
    ] as const;

    expect(hitTest3D(projected as never, 108, 100)?.id).toBe('node-a');
    expect(hitTest3D(projected as never, 400, 100)).toBeNull();
  });
});
