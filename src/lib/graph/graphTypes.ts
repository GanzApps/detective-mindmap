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

export function buildGraphFromCase(c: { graph: GraphData }): GraphData {
  return c.graph;
}
