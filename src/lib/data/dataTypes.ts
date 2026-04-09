import { z } from 'zod';
import { GraphDataSchema } from '@/lib/graph/graphTypes';

export const EvidenceFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string(),
  type: z.enum(['device_data', 'surveillance', 'financial', 'witness', 'physical']),
  size: z.string(),
  addedAt: z.string(),
});

export type EvidenceFile = z.infer<typeof EvidenceFileSchema>;

export const EvidenceCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  files: z.array(EvidenceFileSchema),
});

export type EvidenceCategory = z.infer<typeof EvidenceCategorySchema>;

export const CaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['active', 'closed', 'archived']),
  createdAt: z.string(),
  updatedAt: z.string(),
  graph: GraphDataSchema,
  evidence: z.array(EvidenceCategorySchema),
});

export type Case = z.infer<typeof CaseSchema>;
