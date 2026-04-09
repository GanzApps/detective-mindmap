import { type Case, type EvidenceFile } from '@/lib/data/dataTypes';
import { type EntityType } from '@/lib/graph/graphTypes';

const TYPE_MAP: Record<EvidenceFile['type'], EntityType[]> = {
  device_data: ['digital', 'person'],
  surveillance: ['location', 'vehicle', 'event'],
  financial: ['organization', 'evidence', 'person'],
  witness: ['person', 'event'],
  physical: ['evidence', 'vehicle', 'location'],
};

function tokenize(name: string) {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

export function resolveEvidenceHighlightIds(caseData: Case, file: EvidenceFile) {
  const tokens = tokenize(file.name);
  const relatedTypes = new Set(TYPE_MAP[file.type]);

  return caseData.graph.nodes
    .filter((node) => {
      const haystacks = [
        node.label.toLowerCase(),
        ...Object.values(node.properties).map((value) => value.toLowerCase()),
      ];

      const tokenMatch = tokens.some((token) => (
        haystacks.some((haystack) => haystack.includes(token))
      ));

      return tokenMatch || relatedTypes.has(node.type);
    })
    .map((node) => node.id);
}
