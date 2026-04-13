import {
  createForceSimulation,
  drawGraph2D,
  getBestSearchMatch,
  getGraphBounds,
  getSearchMatches,
  getVisibleEdgeLabels,
  hitTest2D,
  type ForceGraphEdgeDatum,
  type ForceGraphNodeDatum,
} from '@/lib/graph/forceSimulation';
import { buildGraphFromCase } from '@/lib/graph/graphTypes';
import { mockCases } from '@/lib/data/mockCases';

function createMockContext() {
  const drawnText: string[] = [];
  const gradient = { addColorStop: () => {} };

  return {
    drawnText,
    clearRect: () => {},
    fillRect: () => {},
    createRadialGradient: () => gradient,
    createLinearGradient: () => gradient,
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arcTo: () => {},
    quadraticCurveTo: () => {},
    stroke: () => {},
    fill: () => {},
    arc: () => {},
    rotate: () => {},
    setLineDash: () => {},
    measureText: (value: string) => ({ width: value.length * 7 }),
    fillText: (value: string) => {
      drawnText.push(value);
    },
    set fillStyle(_value: string | object) {},
    set strokeStyle(_value: string) {},
    set lineWidth(_value: number) {},
    set globalAlpha(_value: number) {},
    set shadowColor(_value: string) {},
    set shadowBlur(_value: number) {},
    set font(_value: string) {},
    set textAlign(_value: CanvasTextAlign) {},
    set textBaseline(_value: CanvasTextBaseline) {},
  } as unknown as CanvasRenderingContext2D & { drawnText: string[] };
}

describe('createForceSimulation', () => {
  it('creates simulation nodes and edges from the case graph', () => {
    const graph = buildGraphFromCase(mockCases[0]);
    const bundle = createForceSimulation(graph.nodes, graph.edges);

    expect(bundle.nodes).toHaveLength(graph.nodes.length);
    expect(bundle.edges).toHaveLength(graph.edges.length);
    expect(bundle.nodes[0].radius).toBeGreaterThan(0);
    expect(bundle.nodes[0].glyph).toBeTruthy();

    bundle.simulation.stop();
  });
});

describe('search helpers', () => {
  it('finds matching nodes and the best search result', () => {
    const graph = buildGraphFromCase(mockCases[0]);
    const matches = getSearchMatches(graph.nodes, 'marco');
    const bestMatch = getBestSearchMatch(graph.nodes, 'marco');

    expect(matches.map((node) => node.id)).toContain('node-002');
    expect(bestMatch?.id).toBe('node-002');
  });
});

describe('graph bounds and hit testing', () => {
  it('computes bounds and returns the topmost hit node', () => {
    const nodes = [
      { id: 'node-a', x: -20, y: 10, radius: 18 },
      { id: 'node-b', x: 120, y: 60, radius: 20 },
    ] as Array<Pick<ForceGraphNodeDatum, 'id' | 'x' | 'y' | 'radius'>>;

    const bounds = getGraphBounds(nodes);

    expect(bounds.width).toBeGreaterThan(0);
    expect(bounds.height).toBeGreaterThan(0);
    expect(hitTest2D(nodes, 124, 64, { x: 0, y: 0, k: 1 })?.id).toBe('node-b');
    expect(hitTest2D(nodes, 500, 500, { x: 0, y: 0, k: 1 })).toBeNull();
  });
});

describe('edge label selection', () => {
  it('keeps label rendering selective by default while preserving emphasized edges', () => {
    const graph = buildGraphFromCase(mockCases[0]);
    const bundle = createForceSimulation(graph.nodes, graph.edges);
    const ids = getVisibleEdgeLabels(bundle.edges, {
      transform: { x: 0, y: 0, k: 1 },
      selectedId: 'node-002',
    });

    expect(ids.length).toBeLessThan(bundle.edges.length);
    expect(ids).toContain('edge-006');

    bundle.simulation.stop();
  });
});

describe('drawGraph2D', () => {
  it('draws node labels and emphasized relationship labels without throwing', () => {
    const graph = buildGraphFromCase(mockCases[0]);
    const bundle = createForceSimulation(graph.nodes, graph.edges);

    // Freeze positions so the draw output is deterministic in the test.
    bundle.simulation.stop();
    bundle.nodes.forEach((node, index) => {
      node.x = index * 32;
      node.y = (index % 4) * 40;
    });

    const nodeById = new Map(bundle.nodes.map((node) => [node.id, node]));
    const frozenEdges = graph.edges.map((edge) => ({
      ...edge,
      source: nodeById.get(edge.source)!,
      target: nodeById.get(edge.target)!,
    })) as ForceGraphEdgeDatum[];
    const context = createMockContext();

    drawGraph2D(context, 1200, 720, bundle.nodes, frozenEdges, {
      selectedId: 'node-002',
      transform: { x: 300, y: 180, k: 1.1 },
    });

    expect(context.drawnText).toContain('Marco Delgado');
    expect(context.drawnText).toContain('owns device');
  });
});
