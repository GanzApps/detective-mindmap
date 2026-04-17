import {
  getBranchLinkedFocusIds,
  getConnectedIds,
  ENTITY_TYPE_COLOR,
  type EntityType,
  type GraphData,
} from '@/lib/graph/graphTypes';
import {
  buildMindMap3DLayout,
  projectNodes3D,
  type CameraState3D,
  type ProjectedNode3D,
  type SharedNodePosition,
  type Viewport3D,
} from '@/lib/graph/projection3d';

interface DrawOptions {
  selectedNodeId?: string | null;
  hoverNodeId?: string | null;
  highlightedNodeIds?: string[];
  activeEntityTypes?: EntityType[];
  showLabels?: boolean;
  focusSelectedNeighborhood?: boolean;
  sharedPositions?: Record<string, SharedNodePosition>;
  theme?: 'dark' | 'light';
}

interface FramePreparation {
  layoutNodes: ReturnType<typeof buildMindMap3DLayout>;
  projectedNodes: ProjectedNode3D[];
  projectedNodeMap: Record<string, ProjectedNode3D>;
  sortedNodes: ProjectedNode3D[];
  connectedNodeIds: Set<string> | null;
  highlightedNodeIds: Set<string>;
  activeEntityTypes: Set<EntityType> | null;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbaFromHex(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function getConnectedNodeIds(
  graph: GraphData,
  selectedNodeId: string | null | undefined,
  highlightedNodeIds: Set<string>,
): Set<string> | null {
  if (!selectedNodeId) {
    return null;
  }

  // Start with family-linked focus (selected + parent/child/sibling)
  const familyFocus = getBranchLinkedFocusIds(graph.nodes, graph.edges, selectedNodeId);
  // If node not found in graph (e.g. stale localStorage id), disable focus-dimming entirely
  if (familyFocus.size === 0) {
    return null;
  }
  // Also include all directly-connected nodes (edge neighbors)
  const directConnections = getConnectedIds(graph.edges, selectedNodeId);
  // Preserve highlighted nodes from AI results so they aren't dimmed by selection
  const result = new Set<string>([...familyFocus, ...directConnections, ...highlightedNodeIds]);
  return result;
}

export function prepareFrame3D(
  graph: GraphData,
  camera: CameraState3D,
  viewport: Viewport3D,
  options: DrawOptions = {},
): FramePreparation {
  const layoutNodes = buildMindMap3DLayout(graph, options.sharedPositions);
  const projectedNodes = projectNodes3D(layoutNodes, camera, viewport);
  const projectedNodeMap = Object.fromEntries(
    projectedNodes.map((node) => [node.id, node]),
  );
  const sortedNodes = [...projectedNodes].sort((left, right) => left.depth - right.depth);

  const highlightedNodeIds = new Set(options.highlightedNodeIds ?? []);

  return {
    layoutNodes,
    projectedNodes,
    projectedNodeMap,
    sortedNodes,
    connectedNodeIds: options.focusSelectedNeighborhood === false
      ? null
      : getConnectedNodeIds(graph, options.selectedNodeId, highlightedNodeIds),
    highlightedNodeIds,
    activeEntityTypes: options.activeEntityTypes
      ? new Set(options.activeEntityTypes)
      : null,
  };
}

export function drawFrame3D(
  ctx: CanvasRenderingContext2D,
  graph: GraphData,
  camera: CameraState3D,
  viewport: Viewport3D,
  options: DrawOptions = {},
) {
  const prepared = prepareFrame3D(graph, camera, viewport, options);
  const showLabels = options.showLabels ?? true;
  const isDark = (options.theme ?? 'dark') === 'dark';

  ctx.clearRect(0, 0, viewport.width, viewport.height);
  ctx.fillStyle = isDark ? '#08101f' : '#f8fafc';
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  const backgroundGlow = ctx.createRadialGradient(
    viewport.width * 0.58,
    viewport.height * 0.24,
    0,
    viewport.width * 0.58,
    viewport.height * 0.24,
    viewport.width * 0.82,
  );
  if (isDark) {
    backgroundGlow.addColorStop(0, 'rgba(124,58,237,0.08)');
    backgroundGlow.addColorStop(0.48, 'rgba(15,23,42,0.05)');
    backgroundGlow.addColorStop(1, 'rgba(8,16,31,0)');
  } else {
    backgroundGlow.addColorStop(0, 'rgba(124,58,237,0.06)');
    backgroundGlow.addColorStop(0.48, 'rgba(241,245,249,0.04)');
    backgroundGlow.addColorStop(1, 'rgba(248,250,252,0)');
  }
  ctx.fillStyle = backgroundGlow;
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  for (const edge of graph.edges) {
    const source = prepared.projectedNodeMap[edge.source];
    const target = prepared.projectedNodeMap[edge.target];

    if (!source || !target) {
      continue;
    }

    const isConnected = prepared.connectedNodeIds
      ? prepared.connectedNodeIds.has(edge.source) && prepared.connectedNodeIds.has(edge.target)
      : false;
    const isFilteredOut = prepared.activeEntityTypes !== null
      && (
        !prepared.activeEntityTypes.has(source.node.type)
        || !prepared.activeEntityTypes.has(target.node.type)
      );
    const isFocusDimmed = prepared.connectedNodeIds !== null && !isConnected;
    const isDimmed = isFilteredOut || isFocusDimmed;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(source.sx, source.sy);
    ctx.lineTo(target.sx, target.sy);

    if (isDimmed) {
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 0.7;
    } else if (isConnected) {
      const sourceColor = ENTITY_TYPE_COLOR[source.node.type];
      const targetColor = ENTITY_TYPE_COLOR[target.node.type];
      const gradient = ctx.createLinearGradient(source.sx, source.sy, target.sx, target.sy);
      gradient.addColorStop(0, rgbaFromHex(sourceColor, 0.88));
      gradient.addColorStop(1, rgbaFromHex(targetColor, 0.88));
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.6;
    } else {
      const depth = Math.max(0, Math.min(1, (source.depth + target.depth) / 1200 + 0.5));
      ctx.strokeStyle = rgbaFromHex(ENTITY_TYPE_COLOR[source.node.type], 0.2 + depth * 0.18);
      ctx.lineWidth = 1;
    }

    ctx.stroke();
    ctx.restore();
  }

  for (const node of prepared.sortedNodes) {
    const isSelected = options.selectedNodeId === node.id;
    const isConnected = prepared.connectedNodeIds?.has(node.id) ?? false;
    const isFilteredOut = prepared.activeEntityTypes !== null
      && !prepared.activeEntityTypes.has(node.node.type);
    const isFocusDimmed = prepared.connectedNodeIds !== null && !isConnected;
    const isDimmed = isFilteredOut || isFocusDimmed;
    const isHovered = options.hoverNodeId === node.id;
    const isHighlighted = prepared.highlightedNodeIds.has(node.id);

    if (isDimmed) {
      ctx.save();
      drawProjectedShape(ctx, node);
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
      ctx.fill();
      ctx.restore();
      continue;
    }

    const semanticColor = ENTITY_TYPE_COLOR[node.node.type];
    const glowRadius = isSelected
      ? node.radius * 4.8
      : isConnected
        ? node.radius * 3.3
        : isHighlighted
          ? node.radius * 3.6
          : isHovered
            ? node.radius * 3.8
            : 0;

    if (glowRadius > 0) {
      ctx.save();
      const gradient = ctx.createRadialGradient(
        node.sx,
        node.sy,
        node.radius * 0.25,
        node.sx,
        node.sy,
        glowRadius,
      );
      const glowAlpha = isSelected ? 0.6 : isConnected ? 0.32 : 0.22;
      gradient.addColorStop(0, rgbaFromHex(semanticColor, glowAlpha));
      gradient.addColorStop(1, rgbaFromHex(semanticColor, 0));
      ctx.beginPath();
      ctx.arc(node.sx, node.sy, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    drawProjectedShape(ctx, node);
    ctx.fillStyle = semanticColor;
    // When selection is active, non-focus nodes are already dimmed via isDimmed above.
    // In the no-selection state, use near-full opacity with only a subtle depth fade.
    const baseAlpha = prepared.connectedNodeIds !== null
      ? 1  // selection active: remaining nodes are focus nodes, full opacity
      : Math.max(0.82, 0.90 + node.depth / 800);  // no selection: subtle depth fade
    ctx.globalAlpha = isSelected || isConnected || isHighlighted ? 1 : baseAlpha;
    ctx.fill();
    ctx.strokeStyle = isDark
      ? rgbaFromHex('#ffffff', isSelected ? 0.9 : 0.32)
      : rgbaFromHex('#000000', isSelected ? 0.18 : 0.1);
    ctx.lineWidth = isSelected ? 1.8 : 0.8;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(node.sx, node.sy, Math.max(2.2, node.radius * 0.18), 0, Math.PI * 2);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.95)';
    ctx.strokeStyle = semanticColor;
    ctx.lineWidth = 0.8;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (isSelected || isConnected || isHighlighted) {
      ctx.save();
      drawProjectedShape(ctx, { ...node, radius: node.radius + (isSelected ? 1.5 : 0.5) });
      ctx.strokeStyle = rgbaFromHex(semanticColor, isSelected ? 0.9 : 0.68);
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();
      ctx.restore();
    }

    if (showLabels && node.scale > 0.42) {
      const fontSize = Math.max(9, Math.min(13, node.radius * 1.1));
      const alpha = isSelected || isConnected || isHighlighted
        ? 1
        : prepared.connectedNodeIds !== null
          ? 0.82  // focus-mode: non-focus nodes already filtered by isDimmed, these are focus
          : Math.max(0.55, 0.62 + node.depth / 800);  // no selection: subtle depth fade
      const lines = node.label.split('\n');

      ctx.save();
      ctx.font = `${node.tier <= 1 ? '500' : '400'} ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isDark
        ? `rgba(226,232,240,${alpha})`
        : `rgba(15,23,42,${alpha})`;

      lines.forEach((line, index) => {
        ctx.fillText(
          line,
          node.sx,
          node.sy + node.radius + 5 + index * (fontSize + 2),
        );
      });
      ctx.restore();
    }
  }

  return prepared;
}

function drawProjectedShape(
  ctx: CanvasRenderingContext2D,
  node: Pick<ProjectedNode3D, 'sx' | 'sy' | 'radius'> & { node: { type: EntityType } },
) {
  const radius = node.radius;
  const shape = node.node.type;

  switch (shape) {
    case 'organization': {
      drawRoundedRect(ctx, node.sx - radius, node.sy - radius * 0.82, radius * 2, radius * 1.64, radius * 0.3);
      return;
    }
    case 'evidence': {
      const x = node.sx - radius * 0.86;
      const y = node.sy - radius * 1.02;
      const width = radius * 1.72;
      const height = radius * 2.04;
      drawRoundedRect(ctx, x, y, width, height, radius * 0.22);
      ctx.moveTo(x + width * 0.7, y);
      ctx.lineTo(x + width, y + height * 0.3);
      ctx.lineTo(x + width * 0.7, y + height * 0.3);
      ctx.closePath();
      return;
    }
    case 'event': {
      ctx.beginPath();
      ctx.moveTo(node.sx, node.sy - radius);
      ctx.lineTo(node.sx + radius, node.sy);
      ctx.lineTo(node.sx, node.sy + radius);
      ctx.lineTo(node.sx - radius, node.sy);
      ctx.closePath();
      return;
    }
    case 'location': {
      const topRadius = radius * 0.76;
      ctx.beginPath();
      ctx.arc(node.sx, node.sy - radius * 0.16, topRadius, Math.PI * 0.08, Math.PI * 0.92, true);
      ctx.quadraticCurveTo(node.sx - radius * 0.68, node.sy + radius * 0.16, node.sx, node.sy + radius * 1.04);
      ctx.quadraticCurveTo(node.sx + radius * 0.68, node.sy + radius * 0.16, node.sx + topRadius, node.sy - radius * 0.16);
      ctx.closePath();
      return;
    }
    case 'vehicle': {
      drawRoundedRect(ctx, node.sx - radius * 1.08, node.sy - radius * 0.62, radius * 2.16, radius * 1.24, radius * 0.56);
      return;
    }
    case 'digital': {
      const width = radius * 0.94;
      const height = radius * 0.8;
      ctx.beginPath();
      ctx.moveTo(node.sx - width * 0.55, node.sy - height);
      ctx.lineTo(node.sx + width * 0.55, node.sy - height);
      ctx.lineTo(node.sx + width, node.sy);
      ctx.lineTo(node.sx + width * 0.55, node.sy + height);
      ctx.lineTo(node.sx - width * 0.55, node.sy + height);
      ctx.lineTo(node.sx - width, node.sy);
      ctx.closePath();
      return;
    }
    case 'person':
    default: {
      ctx.beginPath();
      ctx.arc(node.sx, node.sy, radius, 0, Math.PI * 2);
    }
  }
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
