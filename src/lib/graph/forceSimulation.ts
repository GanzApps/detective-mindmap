import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
  type ZoomTransform,
} from 'd3';
import {
  ENTITY_TYPE_COLOR,
  type EntityType,
  type GraphEdge,
  type GraphNode,
} from '@/lib/graph/graphTypes';

export interface ForceGraphNodeDatum extends GraphNode, SimulationNodeDatum {
  radius: number;
  color: string;
  glyph: string;
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
}

export interface ForceGraphEdgeDatum extends SimulationLinkDatum<ForceGraphNodeDatum> {
  id: string;
  label: string;
  strength: number;
  source: ForceGraphNodeDatum;
  target: ForceGraphNodeDatum;
}

export interface ForceGraphBundle {
  simulation: Simulation<ForceGraphNodeDatum, ForceGraphEdgeDatum>;
  nodes: ForceGraphNodeDatum[];
  edges: ForceGraphEdgeDatum[];
}

export interface ForceGraphTransform {
  x: number;
  y: number;
  k: number;
}

export interface DrawGraph2DOptions {
  transform?: ForceGraphTransform;
  selectedId?: string | null;
  highlightedIds?: string[];
  activeEntityTypes?: EntityType[];
  searchMatchIds?: string[];
  showEdgeLabels?: boolean;
  showNodeLabels?: boolean;
  focusSelectedNeighborhood?: boolean;
}

export interface GraphBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

const DEFAULT_TRANSFORM: ForceGraphTransform = { x: 0, y: 0, k: 1 };
const EDGE_LABEL_LIMIT = 14;
const ENTITY_TYPE_GLYPH: Record<EntityType, string> = {
  person: 'P',
  organization: 'O',
  location: 'L',
  event: 'E',
  evidence: 'X',
  vehicle: 'V',
  digital: 'D',
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getNodeRadius(node: GraphNode) {
  switch (node.type) {
    case 'organization':
      return 28;
    case 'event':
      return 22;
    case 'location':
      return 21;
    case 'vehicle':
      return 18;
    case 'digital':
      return 17;
    case 'evidence':
      return 16;
    case 'person':
    default:
      return 20;
  }
}

function getTierPosition(node: GraphNode, index: number, tierCount: number): { x: number; y: number } {
  const radius = 70 + node.tier * 110;
  const angle = (index / Math.max(tierCount, 1)) * Math.PI * 2;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * 0.72 + (node.tier - 1) * 18,
  };
}

function normalizeSearch(query: string) {
  return query.trim().toLowerCase();
}

export function getSearchMatches(nodes: GraphNode[], query: string) {
  const normalizedQuery = normalizeSearch(query);

  if (!normalizedQuery) {
    return [];
  }

  return nodes.filter((node) => (
    node.label.toLowerCase().includes(normalizedQuery)
      || Object.values(node.properties).some((value) => value.toLowerCase().includes(normalizedQuery))
  ));
}

export function getBestSearchMatch(nodes: GraphNode[], query: string) {
  const normalizedQuery = normalizeSearch(query);

  if (!normalizedQuery) {
    return null;
  }

  const matches = getSearchMatches(nodes, normalizedQuery);

  if (matches.length === 0) {
    return null;
  }

  return [...matches].sort((left, right) => {
    const leftLabel = left.label.toLowerCase();
    const rightLabel = right.label.toLowerCase();
    const leftExact = leftLabel === normalizedQuery ? 0 : leftLabel.startsWith(normalizedQuery) ? 1 : 2;
    const rightExact = rightLabel === normalizedQuery ? 0 : rightLabel.startsWith(normalizedQuery) ? 1 : 2;

    if (leftExact !== rightExact) {
      return leftExact - rightExact;
    }

    return left.label.localeCompare(right.label);
  })[0];
}

export function createForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
): ForceGraphBundle {
  const tierCounts = new Map<number, number>();
  const tierIndexes = new Map<number, number>();

  for (const node of nodes) {
    tierCounts.set(node.tier, (tierCounts.get(node.tier) ?? 0) + 1);
  }

  const simulationNodes: ForceGraphNodeDatum[] = nodes.map((node) => {
    const tierIndex = tierIndexes.get(node.tier) ?? 0;
    tierIndexes.set(node.tier, tierIndex + 1);

    const position = getTierPosition(node, tierIndex, tierCounts.get(node.tier) ?? 1);

    return {
      ...node,
      radius: getNodeRadius(node),
      color: ENTITY_TYPE_COLOR[node.type],
      glyph: ENTITY_TYPE_GLYPH[node.type],
      x: position.x,
      y: position.y,
    };
  });

  const nodeById = new Map(simulationNodes.map((node) => [node.id, node]));
  const simulationEdges: ForceGraphEdgeDatum[] = edges
    .map((edge) => {
      const source = nodeById.get(edge.source);
      const target = nodeById.get(edge.target);

      if (!source || !target) {
        return null;
      }

      return {
        ...edge,
        source,
        target,
      };
    })
    .filter((edge): edge is ForceGraphEdgeDatum => edge !== null);

  const simulation = forceSimulation<ForceGraphNodeDatum>(simulationNodes)
    .force('link', forceLink<ForceGraphNodeDatum, ForceGraphEdgeDatum>(simulationEdges)
      .id((node) => node.id)
      .distance((edge) => 90 + (1 - edge.strength) * 55)
      .strength((edge) => clamp(edge.strength * 0.45, 0.18, 0.55)))
    .force('charge', forceManyBody<ForceGraphNodeDatum>().strength((node) => -(200 + node.radius * 7)))
    .force('collide', forceCollide<ForceGraphNodeDatum>().radius((node) => node.radius + 18).iterations(2))
    .force('center', forceCenter(0, 0))
    .force('x', forceX<ForceGraphNodeDatum>(0).strength(0.02))
    .force('y', forceY<ForceGraphNodeDatum>(0).strength(0.03))
    .alpha(0.9)
    .alphaDecay(0.045)
    .velocityDecay(0.28);

  return {
    simulation,
    nodes: simulationNodes,
    edges: simulationEdges,
  };
}

export function getGraphBounds(nodes: Array<Pick<ForceGraphNodeDatum, 'x' | 'y' | 'radius'>>) : GraphBounds {
  if (nodes.length === 0) {
    return {
      minX: -1,
      maxX: 1,
      minY: -1,
      maxY: 1,
      width: 2,
      height: 2,
    };
  }

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of nodes) {
    minX = Math.min(minX, node.x - node.radius);
    maxX = Math.max(maxX, node.x + node.radius);
    minY = Math.min(minY, node.y - node.radius);
    maxY = Math.max(maxY, node.y + node.radius);
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

export function getVisibleEdgeLabels(
  edges: ForceGraphEdgeDatum[],
  options: DrawGraph2DOptions = {},
) {
  const transform = options.transform ?? DEFAULT_TRANSFORM;
  const focusSelectedNeighborhood = options.focusSelectedNeighborhood ?? true;
  const selectedNeighborhood = focusSelectedNeighborhood && options.selectedId
    ? getConnectedNodeIds(edges, options.selectedId)
    : new Set<string>();
  const activeEntityTypes = options.activeEntityTypes
    ? new Set(options.activeEntityTypes)
    : null;
  const emphasisIds = new Set<string>([
    ...(options.highlightedIds ?? []),
    ...(options.searchMatchIds ?? []),
    ...(options.selectedId ? [options.selectedId] : []),
  ]);

  const ranked = edges.map((edge) => {
    const source = edge.source;
    const target = edge.target;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.hypot(dx, dy);
    const isFilteredOut = activeEntityTypes !== null
      && (!activeEntityTypes.has(source.type) || !activeEntityTypes.has(target.type));
    const isSelectedEdge = options.selectedId
      ? edge.source.id === options.selectedId
        || edge.target.id === options.selectedId
        || (focusSelectedNeighborhood
          && selectedNeighborhood.has(edge.source.id)
          && selectedNeighborhood.has(edge.target.id))
      : false;
    const isEmphasized = emphasisIds.has(edge.source.id) || emphasisIds.has(edge.target.id);
    const score = (isSelectedEdge ? 100 : 0) + (isEmphasized ? 50 : 0) + edge.strength * 10 + length / 50;

    return {
      edge,
      length,
      isFilteredOut,
      isSelectedEdge,
      isEmphasized,
      score,
    };
  });

  return ranked
    .filter((entry) => {
      if (entry.isFilteredOut) {
        return false;
      }

      if (entry.isSelectedEdge || entry.isEmphasized) {
        return true;
      }

      return transform.k >= 0.95 && entry.length >= 110;
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, EDGE_LABEL_LIMIT)
    .map((entry) => entry.edge.id);
}

export function hitTest2D(
  nodes: Array<Pick<ForceGraphNodeDatum, 'id' | 'x' | 'y' | 'radius'>>,
  mx: number,
  my: number,
  transform: ForceGraphTransform = DEFAULT_TRANSFORM,
) {
  const worldX = (mx - transform.x) / transform.k;
  const worldY = (my - transform.y) / transform.k;

  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    const node = nodes[index];
    const dx = worldX - node.x;
    const dy = worldY - node.y;

    if (Math.hypot(dx, dy) <= node.radius + 5 / transform.k) {
      return node;
    }
  }

  return null;
}

export function drawGraph2D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: ForceGraphNodeDatum[],
  edges: ForceGraphEdgeDatum[],
  options: DrawGraph2DOptions = {},
) {
  const transform = options.transform ?? DEFAULT_TRANSFORM;
  const focusSelectedNeighborhood = options.focusSelectedNeighborhood ?? true;
  const selectedNeighborhood = focusSelectedNeighborhood && options.selectedId
    ? getConnectedNodeIds(edges, options.selectedId)
    : new Set<string>();
  const activeEntityTypes = options.activeEntityTypes
    ? new Set(options.activeEntityTypes)
    : null;
  const emphasisIds = new Set<string>([
    ...(options.highlightedIds ?? []),
    ...(options.searchMatchIds ?? []),
    ...(options.selectedId ? [options.selectedId, ...selectedNeighborhood] : []),
  ]);
  const visibleEdgeLabels = new Set(options.showEdgeLabels === false ? [] : getVisibleEdgeLabels(edges, options));
  const selectedEdgeIds = new Set<string>();

  if (options.selectedId) {
    for (const edge of edges) {
      if (edge.source.id === options.selectedId || edge.target.id === options.selectedId) {
        selectedEdgeIds.add(edge.id);
      }
    }
  }

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#040712';
  ctx.fillRect(0, 0, width, height);

  if (typeof ctx.createRadialGradient === 'function') {
    const glow = ctx.createRadialGradient(width * 0.32, height * 0.16, 10, width * 0.32, height * 0.16, width * 0.72);
    glow.addColorStop(0, 'rgba(34,211,238,0.12)');
    glow.addColorStop(0.35, 'rgba(14,165,233,0.06)');
    glow.addColorStop(1, 'rgba(2,6,23,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.k, transform.k);

  for (const edge of edges) {
    const source = edge.source;
    const target = edge.target;
    const isFilteredOut = activeEntityTypes !== null
      && (!activeEntityTypes.has(source.type) || !activeEntityTypes.has(target.type));
    const isSelectedEdge = selectedEdgeIds.has(edge.id);
    const isEmphasized = emphasisIds.has(source.id) || emphasisIds.has(target.id);
    const isFocusDimmed = focusSelectedNeighborhood
      && options.selectedId !== undefined
      && options.selectedId !== null
      && !(isSelectedEdge || isEmphasized);
    const isDimmed = isFilteredOut || isFocusDimmed;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.strokeStyle = isSelectedEdge
      ? 'rgba(125,211,252,0.92)'
      : isEmphasized
        ? 'rgba(251,191,36,0.6)'
        : 'rgba(71,85,105,0.5)';
    ctx.lineWidth = isSelectedEdge ? 2.5 : isEmphasized ? 1.8 : 1.15;
    ctx.globalAlpha = isDimmed ? 0.18 : 1;
    ctx.stroke();
    ctx.restore();

    if (visibleEdgeLabels.has(edge.id)) {
      const midpointX = (source.x + target.x) / 2;
      const midpointY = (source.y + target.y) / 2;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const angle = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(midpointX, midpointY);
      ctx.rotate(angle);
      ctx.fillStyle = isSelectedEdge ? 'rgba(224,242,254,0.92)' : 'rgba(203,213,225,0.72)';
      ctx.font = `${isSelectedEdge ? 13 : 12}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.globalAlpha = isSelectedEdge ? 1 : 0.78;
      ctx.fillText(edge.label, 0, -8);
      ctx.restore();
    }
  }

  for (const node of nodes) {
    const isSelected = node.id === options.selectedId;
    const isInNeighborhood = selectedNeighborhood.has(node.id);
    const isEmphasized = emphasisIds.has(node.id);
    const isFilteredOut = activeEntityTypes !== null && !activeEntityTypes.has(node.type);
    const isFocusDimmed = focusSelectedNeighborhood
      && options.selectedId !== undefined
      && options.selectedId !== null
      && !(isSelected || isInNeighborhood || isEmphasized);
    const isDimmed = isFilteredOut || isFocusDimmed;
    const ringRadius = node.radius + (isSelected ? 7 : isEmphasized ? 4 : 0);

    ctx.save();
    ctx.globalAlpha = isDimmed ? 0.22 : 1;

    if (isSelected || isEmphasized) {
      ctx.beginPath();
      ctx.fillStyle = isSelected ? 'rgba(34,211,238,0.2)' : 'rgba(251,191,36,0.14)';
      ctx.arc(node.x, node.y, ringRadius + 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.fillStyle = node.color;
    ctx.shadowColor = isSelected ? 'rgba(34,211,238,0.55)' : 'rgba(15,23,42,0.38)';
    ctx.shadowBlur = isSelected ? 26 : 16;
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.lineWidth = isSelected ? 3 : isInNeighborhood ? 2 : 1.5;
    ctx.strokeStyle = isSelected ? 'rgba(224,242,254,0.98)' : isInNeighborhood ? 'rgba(125,211,252,0.72)' : 'rgba(255,255,255,0.14)';
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(248,250,252,0.96)';
    ctx.font = `${node.radius * 0.65}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.glyph, node.x, node.y + 0.5);

    const showNodeLabel = (options.showNodeLabels ?? true)
      && (transform.k >= 0.9 || isSelected || isInNeighborhood || isEmphasized);
    if (showNodeLabel) {
      ctx.fillStyle = isSelected ? 'rgba(255,255,255,0.98)' : 'rgba(226,232,240,0.86)';
      ctx.font = `${isSelected ? 14 : 12}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x + node.radius + 12, node.y);
    }

    ctx.restore();
  }

  ctx.restore();
}
function getConnectedNodeIds(edges: ForceGraphEdgeDatum[], nodeId: string) {
  const result = new Set<string>();

  for (const edge of edges) {
    if (edge.source.id === nodeId) {
      result.add(edge.target.id);
    }

    if (edge.target.id === nodeId) {
      result.add(edge.source.id);
    }
  }

  return result;
}
