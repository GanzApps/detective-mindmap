import {
  GraphEdgeSchema,
  GraphNodeSchema,
  buildGraphFromCase,
  getConnectedIds,
  type GraphData,
  type GraphEdge,
} from '@/lib/graph/graphTypes';

const makeEdge = (
  overrides: Partial<GraphEdge> & { source: string; target: string },
): GraphEdge =>
  GraphEdgeSchema.parse({
    id: 'test-edge',
    label: 'connected to',
    strength: 1.0,
    ...overrides,
  });

const makeNode = (overrides: Record<string, unknown>) =>
  GraphNodeSchema.parse({
    id: 'n-test',
    label: 'Test Node',
    type: 'person',
    status: 'unknown',
    tier: 1,
    parent: null,
    properties: {},
    ...overrides,
  });

const emptyGraph: GraphData = { nodes: [], edges: [] };

describe('getConnectedIds', () => {
  it('returns IDs of all nodes connected as targets from the given source', () => {
    const edges: GraphEdge[] = [
      makeEdge({ id: 'e1', source: 'A', target: 'B' }),
      makeEdge({ id: 'e2', source: 'A', target: 'C' }),
    ];

    expect(getConnectedIds(edges, 'A')).toEqual(new Set(['B', 'C']));
  });

  it('returns the source ID when the given nodeId appears as a target', () => {
    const edges: GraphEdge[] = [makeEdge({ id: 'e1', source: 'A', target: 'B' })];

    expect(getConnectedIds(edges, 'B')).toEqual(new Set(['A']));
  });

  it('returns empty Set when nodeId has no matching edges', () => {
    const edges: GraphEdge[] = [makeEdge({ id: 'e1', source: 'A', target: 'B' })];

    expect(getConnectedIds(edges, 'X').size).toBe(0);
  });

  it('returns empty Set when edges array is empty', () => {
    expect(getConnectedIds([], 'A').size).toBe(0);
  });

  it('returns both source and target neighbors when a node connects in both directions', () => {
    const edges: GraphEdge[] = [
      makeEdge({ id: 'e1', source: 'A', target: 'B' }),
      makeEdge({ id: 'e2', source: 'C', target: 'A' }),
    ];

    expect(getConnectedIds(edges, 'A')).toEqual(new Set(['B', 'C']));
  });

  it('returns a Set instance', () => {
    expect(getConnectedIds([], 'A')).toBeInstanceOf(Set);
  });
});

describe('buildGraphFromCase', () => {
  it('returns an object with nodes and edges properties', () => {
    const result = buildGraphFromCase({ graph: emptyGraph });

    expect(result).toHaveProperty('nodes');
    expect(result).toHaveProperty('edges');
  });

  it('returns empty arrays when the case graph has no nodes or edges', () => {
    const result = buildGraphFromCase({ graph: emptyGraph });

    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('returns the same graph data object reference', () => {
    const graph: GraphData = {
      nodes: [makeNode({})],
      edges: [makeEdge({ source: 'n-test', target: 'n-other' })],
    };

    expect(buildGraphFromCase({ graph })).toBe(graph);
  });
});

describe('GraphNodeSchema', () => {
  it('parses a valid node without throwing', () => {
    expect(() =>
      makeNode({ type: 'person', status: 'suspect', tier: 0, parent: null }),
    ).not.toThrow();
  });

  it('throws for an invalid EntityType', () => {
    expect(() => makeNode({ type: 'alien' })).toThrow();
  });

  it('throws for an invalid EntityStatus', () => {
    expect(() => makeNode({ status: 'guilty' })).toThrow();
  });

  it('accepts null parent for a root node', () => {
    expect(() => makeNode({ parent: null })).not.toThrow();
  });

  it('accepts a string parent for a child node', () => {
    expect(() => makeNode({ parent: 'node-001' })).not.toThrow();
  });

  it('accepts all valid EntityType values', () => {
    const types = [
      'person',
      'location',
      'event',
      'evidence',
      'organization',
      'vehicle',
      'digital',
    ] as const;

    for (const type of types) {
      expect(() => makeNode({ type })).not.toThrow();
    }
  });
});

describe('GraphEdgeSchema', () => {
  it('defaults strength to 1.0 when not provided', () => {
    const edge = GraphEdgeSchema.parse({
      id: 'e1',
      source: 'A',
      target: 'B',
      label: 'test',
    });

    expect(edge.strength).toBe(1.0);
  });

  it('preserves explicit strength value', () => {
    const edge = GraphEdgeSchema.parse({
      id: 'e1',
      source: 'A',
      target: 'B',
      label: 'test',
      strength: 0.5,
    });

    expect(edge.strength).toBe(0.5);
  });

  it('throws when strength exceeds 1.0', () => {
    expect(() =>
      GraphEdgeSchema.parse({
        id: 'e1',
        source: 'A',
        target: 'B',
        label: 'test',
        strength: 2.0,
      }),
    ).toThrow();
  });

  it('throws when strength is negative', () => {
    expect(() =>
      GraphEdgeSchema.parse({
        id: 'e1',
        source: 'A',
        target: 'B',
        label: 'test',
        strength: -0.1,
      }),
    ).toThrow();
  });
});
