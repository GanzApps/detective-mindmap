import { type Case } from '@/lib/data/dataTypes';
import { getConnectedIds, type GraphNode } from '@/lib/graph/graphTypes';

export type KnownIntentId =
  | 'suspicious_patterns'
  | 'top_connected_entities'
  | 'highlight_financial_relationships'
  | 'trace_movement_path'
  | 'key_actors_assets'
  | 'trace_money_flow'
  | 'isolate_high_risk_entities'
  | 'show_connections';

export interface CommandHistoryEntry {
  id: string;
  label: string;
  status: 'complete' | 'failed';
  timestampLabel: string;
}

export interface AIResultMetric {
  label: string;
  value: string;
}

export interface AIResultPayload {
  intentId: KnownIntentId;
  title: string;
  subtitle: string;
  summary: string;
  findings: string[];
  metrics: AIResultMetric[];
  highlightedNodeIds: string[];
  selectedNodeId: string | null;
  historyLabel: string;
}

export interface KnownIntentExecutionContext {
  caseData: Case;
  selectedNodeId: string | null;
}

export interface QuickCommandSuggestion {
  id: string;
  prompt: string;
  label: string;
  kind: 'static' | 'context';
}

function toHistoryId() {
  return `cmd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function timeLabel() {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date());
}

function normalizeInput(input: string) {
  return input.trim().toLowerCase();
}

function degreeMap(caseData: Case) {
  const map = new Map<string, number>();

  for (const node of caseData.graph.nodes) {
    map.set(node.id, 0);
  }

  for (const edge of caseData.graph.edges) {
    map.set(edge.source, (map.get(edge.source) ?? 0) + 1);
    map.set(edge.target, (map.get(edge.target) ?? 0) + 1);
  }

  return map;
}

function getNodeById(caseData: Case, nodeId: string | null) {
  if (!nodeId) {
    return null;
  }

  return caseData.graph.nodes.find((node) => node.id === nodeId) ?? null;
}

function getNodeByLabel(caseData: Case, fragment: string | null) {
  if (!fragment) {
    return null;
  }

  const normalized = fragment.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return caseData.graph.nodes.find((node) => node.label.toLowerCase().includes(normalized)) ?? null;
}

function topNodes(caseData: Case, limit: number, predicate?: (node: GraphNode) => boolean) {
  const degrees = degreeMap(caseData);
  return caseData.graph.nodes
    .filter((node) => (predicate ? predicate(node) : true))
    .sort((left, right) => {
      const degreeDelta = (degrees.get(right.id) ?? 0) - (degrees.get(left.id) ?? 0);
      if (degreeDelta !== 0) {
        return degreeDelta;
      }
      return left.label.localeCompare(right.label);
    })
    .slice(0, limit);
}

function directNeighborhood(caseData: Case, nodeId: string) {
  return [nodeId, ...getConnectedIds(caseData.graph.edges, nodeId)];
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

function buildResult(
  intentId: KnownIntentId,
  title: string,
  subtitle: string,
  summary: string,
  findings: string[],
  metrics: AIResultMetric[],
  highlightedNodeIds: string[],
  selectedNodeId: string | null,
  historyLabel: string,
): AIResultPayload {
  return {
    intentId,
    title,
    subtitle,
    summary,
    findings,
    metrics,
    highlightedNodeIds: uniqueIds(highlightedNodeIds),
    selectedNodeId,
    historyLabel,
  };
}

function parseKnownIntent(input: string): { intentId: KnownIntentId; nodeQuery: string | null } | null {
  const normalized = normalizeInput(input);

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith('/show connections')) {
    const match = normalized.match(/\/show connections(?: for)?\s+(.+)$/);
    return {
      intentId: 'show_connections',
      nodeQuery: match?.[1] ?? null,
    };
  }

  if (normalized.includes('suspicious')) {
    return { intentId: 'suspicious_patterns', nodeQuery: null };
  }

  if (normalized.includes('top connected') || normalized.includes('most influential')) {
    return { intentId: 'top_connected_entities', nodeQuery: null };
  }

  if (normalized.includes('financial relationship')) {
    return { intentId: 'highlight_financial_relationships', nodeQuery: null };
  }

  if (normalized.includes('movement path')) {
    return { intentId: 'trace_movement_path', nodeQuery: null };
  }

  if (normalized.includes('key actors') || normalized.includes('assets')) {
    return { intentId: 'key_actors_assets', nodeQuery: null };
  }

  if (normalized.includes('money flow')) {
    return { intentId: 'trace_money_flow', nodeQuery: null };
  }

  if (normalized.includes('high-risk')) {
    return { intentId: 'isolate_high_risk_entities', nodeQuery: null };
  }

  if (normalized.includes('show connections')) {
    return { intentId: 'show_connections', nodeQuery: null };
  }

  return null;
}

export function getQuickCommandSuggestions(caseData: Case, selectedNodeId: string | null): QuickCommandSuggestion[] {
  const base: QuickCommandSuggestion[] = [
    {
      id: 'quick-suspicious',
      prompt: '/find suspicious patterns',
      label: 'Suspicious patterns',
      kind: 'static',
    },
    {
      id: 'quick-top',
      prompt: '/show top connected entities',
      label: 'Top connected entities',
      kind: 'static',
    },
    {
      id: 'quick-financial',
      prompt: '/highlight financial relationships',
      label: 'Financial relationships',
      kind: 'static',
    },
    {
      id: 'quick-money',
      prompt: '/trace money flow',
      label: 'Trace money flow',
      kind: 'static',
    },
  ];

  const selectedNode = getNodeById(caseData, selectedNodeId);
  if (!selectedNode) {
    return base;
  }

  return [
    ...base,
    {
      id: 'quick-connections',
      prompt: `/show connections for ${selectedNode.label}`,
      label: `Connections for ${selectedNode.label}`,
      kind: 'context',
    },
    {
      id: 'quick-assets',
      prompt: '/find key actors and assets',
      label: 'Key actors & assets',
      kind: 'context',
    },
  ];
}

export function executeKnownIntent(
  input: string,
  context: KnownIntentExecutionContext,
): { ok: true; result: AIResultPayload; history: CommandHistoryEntry } | { ok: false; message: string; history: CommandHistoryEntry } {
  const parsed = parseKnownIntent(input);

  if (!parsed) {
    return {
      ok: false,
      message: 'Known intents only for now. Try suspicious patterns, top connected entities, financial relationships, money flow, high-risk entities, or show connections.',
      history: {
        id: toHistoryId(),
        label: input.trim() || 'Empty command',
        status: 'failed',
        timestampLabel: timeLabel(),
      },
    };
  }

  const { caseData, selectedNodeId } = context;

  const historyBase = {
    id: toHistoryId(),
    timestampLabel: timeLabel(),
  };

  switch (parsed.intentId) {
    case 'show_connections': {
      const targetNode = getNodeByLabel(caseData, parsed.nodeQuery) ?? getNodeById(caseData, selectedNodeId);
      if (!targetNode) {
        return {
          ok: false,
          message: 'Select a node or mention an entity name to show its connections.',
          history: {
            ...historyBase,
            label: 'Show connections',
            status: 'failed',
          },
        };
      }

      const connectedIds = directNeighborhood(caseData, targetNode.id);
      const relatedNodes = connectedIds
        .filter((id) => id !== targetNode.id)
        .map((id) => getNodeById(caseData, id))
        .filter((node): node is GraphNode => node !== null);

      const result = buildResult(
        'show_connections',
        `Connections for ${targetNode.label}`,
        'Direct neighborhood focus',
        `${targetNode.label} is now the active focal point with its directly linked entities highlighted in the graph.`,
        relatedNodes.slice(0, 3).map((node) => `${node.label} remains visible as a direct linked connection.`),
        [
          { label: 'Direct links', value: String(relatedNodes.length) },
          { label: 'Entity type', value: targetNode.type },
        ],
        connectedIds,
        targetNode.id,
        `Show connections for ${targetNode.label}`,
      );

      return {
        ok: true,
        result,
        history: {
          ...historyBase,
          label: result.historyLabel,
          status: 'complete',
        },
      };
    }
    case 'top_connected_entities': {
      const top = topNodes(caseData, 5);
      const selected = top[0] ?? null;
      const result = buildResult(
        'top_connected_entities',
        'Top Connected Entities',
        'Highest relationship density',
        'This view ranks the most connected entities in the case graph so you can jump directly to the densest investigation hubs.',
        top.slice(0, 3).map((node, index) => `${index + 1}. ${node.label} is among the most connected entities in the current case graph.`),
        [
          { label: 'Entities ranked', value: String(top.length) },
          { label: 'Top focus', value: selected?.label ?? 'None' },
        ],
        top.map((node) => node.id),
        selected?.id ?? null,
        'Show top connected entities',
      );

      return {
        ok: true,
        result,
        history: { ...historyBase, label: result.historyLabel, status: 'complete' },
      };
    }
    case 'suspicious_patterns': {
      const suspicious = topNodes(caseData, 5, (node) => node.status !== 'unknown');
      const selected = suspicious[0] ?? null;
      const result = buildResult(
        'suspicious_patterns',
        'Suspicious Patterns',
        'Priority entities and behaviors',
        'This command highlights the most active suspect-linked nodes so you can inspect the strongest suspicious cluster first.',
        suspicious.slice(0, 3).map((node) => `${node.label} remains in focus because it is both active in the graph and already marked with investigative weight.`),
        [
          { label: 'Entities highlighted', value: String(suspicious.length) },
          { label: 'Lead entity', value: selected?.label ?? 'None' },
        ],
        suspicious.map((node) => node.id),
        selected?.id ?? null,
        'Find suspicious patterns',
      );

      return {
        ok: true,
        result,
        history: { ...historyBase, label: result.historyLabel, status: 'complete' },
      };
    }
    case 'highlight_financial_relationships':
    case 'trace_money_flow': {
      const financialNodes = topNodes(
        caseData,
        6,
        (node) => node.type === 'evidence' || node.type === 'organization' || node.type === 'person',
      );
      const selected = financialNodes.find((node) => node.type === 'evidence') ?? financialNodes[0] ?? null;
      const title = parsed.intentId === 'trace_money_flow' ? 'Money Flow' : 'Financial Relationships';
      const summary = parsed.intentId === 'trace_money_flow'
        ? 'This command follows the strongest finance-relevant entities so the cash and ownership trail is easier to inspect.'
        : 'This command brings the finance-relevant entities to the front so ownership, cash, and organization links are easier to trace.';

      const result = buildResult(
        parsed.intentId,
        title,
        'Financial focus mode',
        summary,
        financialNodes.slice(0, 3).map((node) => `${node.label} contributes to the visible financial chain.`),
        [
          { label: 'Entities highlighted', value: String(financialNodes.length) },
          { label: 'Primary focus', value: selected?.label ?? 'None' },
        ],
        financialNodes.map((node) => node.id),
        selected?.id ?? null,
        parsed.intentId === 'trace_money_flow' ? 'Trace money flow' : 'Highlight financial relationships',
      );

      return {
        ok: true,
        result,
        history: { ...historyBase, label: result.historyLabel, status: 'complete' },
      };
    }
    case 'trace_movement_path': {
      const movementNodes = topNodes(
        caseData,
        6,
        (node) => node.type === 'location' || node.type === 'vehicle' || node.type === 'event',
      );
      const selected = movementNodes[0] ?? null;
      const result = buildResult(
        'trace_movement_path',
        'Movement Path',
        'Location and transport chain',
        'This command highlights the location, vehicle, and event chain that best represents movement through the current case.',
        movementNodes.slice(0, 3).map((node) => `${node.label} remains visible as part of the movement-focused path.`),
        [
          { label: 'Movement nodes', value: String(movementNodes.length) },
          { label: 'Focus node', value: selected?.label ?? 'None' },
        ],
        movementNodes.map((node) => node.id),
        selected?.id ?? null,
        'Trace movement path',
      );

      return {
        ok: true,
        result,
        history: { ...historyBase, label: result.historyLabel, status: 'complete' },
      };
    }
    case 'key_actors_assets': {
      const actors = topNodes(caseData, 3, (node) => node.type === 'person');
      const assets = topNodes(caseData, 3, (node) => node.type === 'organization' || node.type === 'location' || node.type === 'vehicle');
      const highlighted = [...actors, ...assets];
      const selected = actors[0] ?? assets[0] ?? null;

      const result = buildResult(
        'key_actors_assets',
        'Key Actors & Assets',
        'Operational overview',
        'This command isolates the strongest people-plus-assets combination so the case opens on an understandable operational picture.',
        [
          ...actors.slice(0, 2).map((node) => `${node.label} stands out as a central actor.`),
          ...assets.slice(0, 2).map((node) => `${node.label} remains visible as a critical asset or location.`),
        ].slice(0, 4),
        [
          { label: 'Actors', value: String(actors.length) },
          { label: 'Assets', value: String(assets.length) },
        ],
        highlighted.map((node) => node.id),
        selected?.id ?? null,
        'Find key actors and assets',
      );

      return {
        ok: true,
        result,
        history: { ...historyBase, label: result.historyLabel, status: 'complete' },
      };
    }
    case 'isolate_high_risk_entities': {
      const highRisk = topNodes(caseData, 5, (node) => node.status === 'suspect');
      const selected = highRisk[0] ?? null;
      const result = buildResult(
        'isolate_high_risk_entities',
        'High-Risk Entities',
        'Suspect-heavy cluster',
        'This command narrows the graph to the highest-risk suspect entities so the investigator can act on the strongest leads first.',
        highRisk.slice(0, 3).map((node) => `${node.label} remains in view because it is tagged suspect and ranks highly in the current graph.`),
        [
          { label: 'Suspects highlighted', value: String(highRisk.length) },
          { label: 'Lead suspect', value: selected?.label ?? 'None' },
        ],
        highRisk.map((node) => node.id),
        selected?.id ?? null,
        'Isolate high-risk entities',
      );

      return {
        ok: true,
        result,
        history: { ...historyBase, label: result.historyLabel, status: 'complete' },
      };
    }
    default: {
      return {
        ok: false,
        message: 'That command is not available yet.',
        history: {
          ...historyBase,
          label: input.trim() || 'Unknown command',
          status: 'failed',
        },
      };
    }
  }
}
