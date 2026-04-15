import { z } from 'zod';

export const EntityTypeSchema = z.enum([
  'person',
  'location',
  'event',
  'evidence',
  'organization',
  'vehicle',
  'digital',
]);

export type EntityType = z.infer<typeof EntityTypeSchema>;

export const EntityStatusSchema = z.enum([
  'suspect',
  'confirmed',
  'unknown',
]);

export type EntityStatus = z.infer<typeof EntityStatusSchema>;

export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: EntityTypeSchema,
  status: EntityStatusSchema,
  tier: z.number().int().min(0),
  parent: z.string().nullable(),
  properties: z.record(z.string(), z.string()),
});

export type GraphNode = z.infer<typeof GraphNodeSchema>;

export const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string(),
  strength: z.number().min(0).max(1).default(1.0),
});

export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export const GraphDataSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});

export type GraphData = z.infer<typeof GraphDataSchema>;

export const ENTITY_TYPE_COLOR: Record<EntityType, string> = {
  person: '#a78bfa',
  organization: '#6366f1',
  location: '#34d399',
  event: '#fb7185',
  evidence: '#fb923c',
  vehicle: '#06b6d4',
  digital: '#3b82f6',
};

export const ENTITY_TYPE_SHAPE: Record<EntityType, 'avatar' | 'marker' | 'block' | 'card' | 'diamond' | 'capsule' | 'hex'> = {
  person: 'avatar',
  location: 'marker',
  organization: 'block',
  evidence: 'card',
  event: 'diamond',
  vehicle: 'capsule',
  digital: 'hex',
};

export const ENTITY_TYPE_ICON: Record<EntityType, string> = {
  person: 'M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z',
  organization: 'M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4h6v4',
  location: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z',
  event: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  evidence: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1v5h5M9 13h6M9 17h4',
  vehicle: 'M5 17H3v-5l2-5h14l2 5v5h-2m-12 0a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z',
  digital: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
};

export function getConnectedIds(edges: GraphEdge[], nodeId: string): Set<string> {
  const result = new Set<string>();

  for (const edge of edges) {
    if (edge.source === nodeId) {
      result.add(edge.target);
    }

    if (edge.target === nodeId) {
      result.add(edge.source);
    }
  }

  return result;
}

export function getConnectedNetworkIds(edges: GraphEdge[], nodeId: string): Set<string> {
  const visited = new Set<string>([nodeId]);
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    for (const edge of edges) {
      let neighbor: string | null = null;

      if (edge.source === current) {
        neighbor = edge.target;
      } else if (edge.target === current) {
        neighbor = edge.source;
      }

      if (!neighbor || visited.has(neighbor)) {
        continue;
      }

      visited.add(neighbor);
      queue.push(neighbor);
    }
  }

  return visited;
}

export function getFamilyFocusIds(nodes: GraphNode[], nodeId: string): Set<string> {
  const selectedNode = nodes.find((node) => node.id === nodeId);
  if (!selectedNode) {
    return new Set<string>();
  }

  const result = new Set<string>([selectedNode.id]);

  for (const node of nodes) {
    if (node.parent === selectedNode.id) {
      result.add(node.id);
    }
  }

  for (const node of nodes) {
    if (node.id !== selectedNode.id && node.parent === selectedNode.parent) {
      result.add(node.id);
    }
  }

  return result;
}

export function getBranchLinkedFocusIds(
  nodes: GraphNode[],
  edges: GraphEdge[],
  nodeId: string,
): Set<string> {
  const selectedNode = nodes.find((node) => node.id === nodeId);
  if (!selectedNode) {
    return new Set<string>();
  }

  const directConnections = getConnectedIds(edges, nodeId);
  const result = new Set<string>([nodeId]);

  for (const node of nodes) {
    if (!directConnections.has(node.id)) {
      continue;
    }

    const isParent = selectedNode.parent === node.id;
    const isChild = node.parent === selectedNode.id;
    const isSibling = node.parent === selectedNode.parent && node.id !== selectedNode.id;

    if (isParent || isChild || isSibling) {
      result.add(node.id);
    }
  }

  return result;
}

export function buildGraphFromCase(c: { graph: GraphData }): GraphData {
  return c.graph;
}
