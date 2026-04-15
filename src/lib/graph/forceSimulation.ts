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
  getBranchLinkedFocusIds,
  ENTITY_TYPE_COLOR,
  ENTITY_TYPE_SHAPE,
  type EntityType,
  type GraphEdge,
  type GraphNode,
} from '@/lib/graph/graphTypes';

export interface ForceGraphNodeDatum extends GraphNode, SimulationNodeDatum {
  radius: number;
  color: string;
  glyph: string;
  shape: 'avatar' | 'marker' | 'block' | 'card' | 'diamond' | 'capsule' | 'hex';
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
  evidence: '$',
  vehicle: 'V',
  digital: 'D',
};

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbaFromHex(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getNodeRadius(node: GraphNode) {
  switch (node.type) {
    case 'organization':
      return 24;
    case 'event':
      return 22;
    case 'location':
      return 20;
    case 'vehicle':
      return 20;
    case 'digital':
      return 19;
    case 'evidence':
      return 22;
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
      shape: ENTITY_TYPE_SHAPE[node.type],
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
  nodes: ForceGraphNodeDatum[],
  edges: ForceGraphEdgeDatum[],
  options: DrawGraph2DOptions = {},
) {
  const transform = options.transform ?? DEFAULT_TRANSFORM;
  const focusSelectedNeighborhood = options.focusSelectedNeighborhood ?? true;
  const selectedNeighborhood = focusSelectedNeighborhood && options.selectedId
    ? getBranchLinkedFocusNodeIds(nodes, edges, options.selectedId)
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
  // Only focus-dim when the selected node actually exists in the graph (guards stale localStorage ids)
  const selectedNodeExists = options.selectedId
    ? nodes.some((n) => n.id === options.selectedId)
    : false;
  const selectedNeighborhood = focusSelectedNeighborhood && selectedNodeExists && options.selectedId
    ? getBranchLinkedFocusNodeIds(nodes, edges, options.selectedId)
    : new Set<string>();
  const activeEntityTypes = options.activeEntityTypes
    ? new Set(options.activeEntityTypes)
    : null;
  const emphasisIds = new Set<string>([
    ...(options.highlightedIds ?? []),
    ...(options.searchMatchIds ?? []),
    ...(selectedNodeExists && options.selectedId ? [options.selectedId, ...selectedNeighborhood] : []),
  ]);
  const visibleEdgeLabels = new Set(options.showEdgeLabels === false ? [] : getVisibleEdgeLabels(nodes, edges, options));
  const selectedEdgeIds = new Set<string>();

  if (selectedNodeExists && options.selectedId) {
    for (const edge of edges) {
      if (edge.source.id === options.selectedId || edge.target.id === options.selectedId) {
        selectedEdgeIds.add(edge.id);
      }
    }
  }

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  if (typeof ctx.createRadialGradient === 'function') {
    const glow = ctx.createRadialGradient(width * 0.35, height * 0.18, 10, width * 0.35, height * 0.18, width * 0.75);
    glow.addColorStop(0, 'rgba(124,58,237,0.08)');
    glow.addColorStop(0.4, 'rgba(255,255,255,0.03)');
    glow.addColorStop(1, 'rgba(248,250,252,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.save();
  ctx.strokeStyle = 'rgba(148,163,184,0.12)';
  ctx.lineWidth = 1;
  for (let x = 24; x < width; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 24; y < height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

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
      && selectedNodeExists
      && !(isSelectedEdge || isEmphasized);
    const isDimmed = isFilteredOut || isFocusDimmed;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.strokeStyle = isSelectedEdge
      ? rgbaFromHex(source.color, 0.9)
      : isEmphasized
        ? rgbaFromHex(target.color, 0.54)
        : 'rgba(148,163,184,0.45)';
    ctx.lineWidth = isSelectedEdge ? 2.4 : isEmphasized ? 1.7 : 1.1;
    ctx.setLineDash(isSelectedEdge ? [8, 4] : []);
    ctx.globalAlpha = isDimmed ? 0.14 : 1;
    ctx.stroke();
    ctx.setLineDash([]);
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
      ctx.fillStyle = isSelectedEdge ? 'rgba(51,65,85,0.92)' : 'rgba(71,85,105,0.7)';
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
      && selectedNodeExists
      && !(isSelected || isInNeighborhood || isEmphasized);
    const isDimmed = isFilteredOut || isFocusDimmed;
    const ringRadius = node.radius + (isSelected ? 7 : isEmphasized ? 4 : 0);

    ctx.save();
    ctx.globalAlpha = isDimmed ? 0.22 : 1;

    if (isSelected || isEmphasized) {
      ctx.beginPath();
      ctx.fillStyle = rgbaFromHex(node.color, isSelected ? 0.18 : 0.12);
      ctx.arc(node.x, node.y, ringRadius + 9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = rgbaFromHex(node.color, isSelected ? 0.22 : 0.15);
    ctx.shadowColor = isSelected ? rgbaFromHex(node.color, 0.42) : 'rgba(148,163,184,0.18)';
    ctx.shadowBlur = isSelected ? 22 : 10;
    drawNodeShape(ctx, node, node.radius + (node.shape === 'marker' ? 2 : 0));
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.lineWidth = isSelected ? 3 : isInNeighborhood ? 2 : 1.5;
    ctx.strokeStyle = isSelected
      ? rgbaFromHex(node.color, 0.95)
      : isInNeighborhood
        ? rgbaFromHex(node.color, 0.72)
        : rgbaFromHex(node.color, 0.5);
    drawNodeShape(ctx, node, node.radius);
    ctx.stroke();

    ctx.fillStyle = 'rgba(51,65,85,0.95)';
    ctx.font = `${node.radius * 0.62}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const glyphY = node.shape === 'marker' ? node.y - node.radius * 0.15 : node.y + 0.5;
    ctx.fillText(node.glyph, node.x, glyphY);

    const showNodeLabel = (options.showNodeLabels ?? true)
      && (transform.k >= 0.82 || isSelected || isInNeighborhood || isEmphasized);
    if (showNodeLabel) {
      const chipX = node.x + node.radius + 10;
      const chipY = node.y - 14;
      const fontSize = isSelected ? 13 : 12;
      ctx.font = `${isSelected ? 600 : 500} ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
      const textWidth = ctx.measureText(node.label).width;
      const chipWidth = textWidth + 20;
      const chipHeight = 28;

      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.strokeStyle = rgbaFromHex(node.color, isSelected ? 0.88 : 0.65);
      ctx.lineWidth = 1.4;
      drawRoundedRect(ctx, chipX, chipY, chipWidth, chipHeight, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(51,65,85,0.96)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, chipX + 10, chipY + chipHeight / 2);
    }

    ctx.restore();
  }

  ctx.restore();
}
function getBranchLinkedFocusNodeIds(
  nodes: ForceGraphNodeDatum[],
  edges: ForceGraphEdgeDatum[],
  nodeId: string,
) {
  return getBranchLinkedFocusIds(
    nodes.map((node) => ({
      id: node.id,
      label: node.label,
      type: node.type,
      status: node.status,
      tier: node.tier,
      parent: node.parent,
      properties: node.properties,
    })),
    edges.map((edge) => ({
    id: edge.id,
    source: edge.source.id,
    target: edge.target.id,
    label: edge.label,
    strength: edge.strength,
  })),
    nodeId,
  );
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawNodeShape(
  ctx: CanvasRenderingContext2D,
  node: Pick<ForceGraphNodeDatum, 'x' | 'y' | 'radius' | 'shape'>,
  radius: number,
) {
  switch (node.shape) {
    case 'block': {
      drawRoundedRect(ctx, node.x - radius, node.y - radius * 0.8, radius * 2, radius * 1.6, radius * 0.28);
      return;
    }
    case 'card': {
      const x = node.x - radius * 0.88;
      const y = node.y - radius * 1.02;
      const width = radius * 1.76;
      const height = radius * 2.04;
      drawRoundedRect(ctx, x, y, width, height, radius * 0.22);
      ctx.moveTo(x + width * 0.72, y);
      ctx.lineTo(x + width, y + height * 0.28);
      ctx.lineTo(x + width * 0.72, y + height * 0.28);
      ctx.closePath();
      return;
    }
    case 'diamond': {
      ctx.beginPath();
      ctx.moveTo(node.x, node.y - radius);
      ctx.lineTo(node.x + radius, node.y);
      ctx.lineTo(node.x, node.y + radius);
      ctx.lineTo(node.x - radius, node.y);
      ctx.closePath();
      return;
    }
    case 'marker': {
      const topRadius = radius * 0.78;
      ctx.beginPath();
      ctx.arc(node.x, node.y - radius * 0.18, topRadius, Math.PI * 0.08, Math.PI * 0.92, true);
      ctx.quadraticCurveTo(node.x - radius * 0.68, node.y + radius * 0.18, node.x, node.y + radius * 1.08);
      ctx.quadraticCurveTo(node.x + radius * 0.68, node.y + radius * 0.18, node.x + topRadius, node.y - radius * 0.18);
      ctx.closePath();
      return;
    }
    case 'capsule': {
      drawRoundedRect(ctx, node.x - radius * 1.05, node.y - radius * 0.62, radius * 2.1, radius * 1.24, radius * 0.58);
      return;
    }
    case 'hex': {
      const width = radius * 0.92;
      const height = radius * 0.78;
      ctx.beginPath();
      ctx.moveTo(node.x - width * 0.55, node.y - height);
      ctx.lineTo(node.x + width * 0.55, node.y - height);
      ctx.lineTo(node.x + width, node.y);
      ctx.lineTo(node.x + width * 0.55, node.y + height);
      ctx.lineTo(node.x - width * 0.55, node.y + height);
      ctx.lineTo(node.x - width, node.y);
      ctx.closePath();
      return;
    }
    case 'avatar':
    default: {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    }
  }
}
