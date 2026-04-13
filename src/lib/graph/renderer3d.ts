import {
  ENTITY_TYPE_COLOR,
  ENTITY_TYPE_SHAPE,
  type EntityType,
  type GraphData,
} from '@/lib/graph/graphTypes';
import {
  buildMindMap3DLayout,
  projectNodes3D,
  type CameraState3D,
  type ProjectedNode3D,
  type Viewport3D,
} from '@/lib/graph/projection3d';

interface DrawOptions {
  selectedNodeId?: string | null;
  hoverNodeId?: string | null;
  highlightedNodeIds?: string[];
  activeEntityTypes?: EntityType[];
  showLabels?: boolean;
  focusSelectedNeighborhood?: boolean;
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

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const clamped = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + clamped, y);
  ctx.arcTo(x + width, y, x + width, y + height, clamped);
  ctx.arcTo(x + width, y + height, x, y + height, clamped);
  ctx.arcTo(x, y + height, x, y, clamped);
  ctx.arcTo(x, y, x + width, y, clamped);
  ctx.closePath();
}

function drawProjectedNodeShape(
  ctx: CanvasRenderingContext2D,
  shape: typeof ENTITY_TYPE_SHAPE[keyof typeof ENTITY_TYPE_SHAPE],
  x: number,
  y: number,
  radius: number,
) {
  switch (shape) {
    case 'marker':
      ctx.beginPath();
      ctx.moveTo(x, y + radius * 1.18);
      ctx.bezierCurveTo(
        x + radius * 1.02,
        y + radius * 0.62,
        x + radius * 1.02,
        y - radius * 0.64,
        x,
        y - radius * 0.98,
      );
      ctx.bezierCurveTo(
        x - radius * 1.02,
        y - radius * 0.64,
        x - radius * 1.02,
        y + radius * 0.62,
        x,
        y + radius * 1.18,
      );
      ctx.closePath();
      break;
    case 'block':
      drawRoundedRect(ctx, x - radius, y - radius, radius * 2, radius * 2, radius * 0.3);
      break;
    case 'card':
      drawRoundedRect(ctx, x - radius * 1.08, y - radius * 0.84, radius * 2.16, radius * 1.68, radius * 0.26);
      break;
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(x, y - radius);
      ctx.lineTo(x + radius, y);
      ctx.lineTo(x, y + radius);
      ctx.lineTo(x - radius, y);
      ctx.closePath();
      break;
    case 'capsule':
      drawRoundedRect(ctx, x - radius * 1.15, y - radius * 0.68, radius * 2.3, radius * 1.36, radius * 0.64);
      break;
    case 'hex':
      ctx.beginPath();
      ctx.moveTo(x - radius * 0.95, y);
      ctx.lineTo(x - radius * 0.48, y - radius * 0.84);
      ctx.lineTo(x + radius * 0.48, y - radius * 0.84);
      ctx.lineTo(x + radius * 0.95, y);
      ctx.lineTo(x + radius * 0.48, y + radius * 0.84);
      ctx.lineTo(x - radius * 0.48, y + radius * 0.84);
      ctx.closePath();
      break;
    case 'avatar':
    default:
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.closePath();
      break;
  }
}

function getConnectedNodeIds(graph: GraphData, selectedNodeId: string | null | undefined) {
  if (!selectedNodeId) {
    return null;
  }

  const result = new Set<string>([selectedNodeId]);

  for (const edge of graph.edges) {
    if (edge.source === selectedNodeId) {
      result.add(edge.target);
    }

    if (edge.target === selectedNodeId) {
      result.add(edge.source);
    }
  }

  return result;
}

export function prepareFrame3D(
  graph: GraphData,
  camera: CameraState3D,
  viewport: Viewport3D,
  options: DrawOptions = {},
): FramePreparation {
  const layoutNodes = buildMindMap3DLayout(graph);
  const projectedNodes = projectNodes3D(layoutNodes, camera, viewport);
  const projectedNodeMap = Object.fromEntries(
    projectedNodes.map((node) => [node.id, node]),
  );
  const sortedNodes = [...projectedNodes].sort((left, right) => left.depth - right.depth);

  return {
    layoutNodes,
    projectedNodes,
    projectedNodeMap,
    sortedNodes,
    connectedNodeIds: options.focusSelectedNeighborhood === false
      ? null
      : getConnectedNodeIds(graph, options.selectedNodeId),
    highlightedNodeIds: new Set(options.highlightedNodeIds ?? []),
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

  ctx.clearRect(0, 0, viewport.width, viewport.height);

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
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.5;
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
      ctx.strokeStyle = rgbaFromHex(ENTITY_TYPE_COLOR[source.node.type], 0.07 + depth * 0.15);
      ctx.lineWidth = 0.7;
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
      drawProjectedNodeShape(ctx, ENTITY_TYPE_SHAPE[node.node.type], node.sx, node.sy, node.radius);
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
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
    drawProjectedNodeShape(ctx, ENTITY_TYPE_SHAPE[node.node.type], node.sx, node.sy, node.radius);
    ctx.fillStyle = rgbaFromHex(semanticColor, isSelected || isConnected || isHighlighted ? 0.18 : 0.12);
    ctx.globalAlpha = isSelected || isConnected || isHighlighted
      ? 1
      : Math.max(0.35, 0.45 + node.depth / 700);
    ctx.fill();
    ctx.strokeStyle = semanticColor;
    ctx.lineWidth = isSelected ? 2.4 : isConnected || isHighlighted ? 1.6 : 1.15;
    ctx.stroke();
    ctx.restore();

    if (isSelected || isConnected || isHighlighted) {
      ctx.save();
      drawProjectedNodeShape(
        ctx,
        ENTITY_TYPE_SHAPE[node.node.type],
        node.sx,
        node.sy,
        node.radius + (isSelected ? 2 : 1),
      );
      ctx.strokeStyle = rgbaFromHex(semanticColor, isSelected ? 0.9 : 0.68);
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();
      ctx.restore();
    }

    if (showLabels && node.scale > 0.42) {
      const fontSize = Math.max(9, Math.min(13, node.radius * 1.1));
      const alpha = isSelected || isConnected || isHighlighted
        ? 1
        : Math.max(0.3, 0.35 + node.depth / 800);
      const lines = node.label.split('\n');
      const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
      const chipWidth = Math.max(node.radius * 2.1, longestLine * fontSize * 0.56 + 18);
      const chipHeight = lines.length * (fontSize + 2) + 10;
      const chipX = node.sx + node.radius + 8;
      const chipY = node.sy - chipHeight / 2;

      ctx.save();
      ctx.font = `${node.tier <= 1 ? '500' : '400'} ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
      drawRoundedRect(ctx, chipX, chipY, chipWidth, chipHeight, 10);
      ctx.fillStyle = rgbaFromHex('#ffffff', 0.84 * alpha);
      ctx.fill();
      ctx.strokeStyle = rgbaFromHex(semanticColor, 0.88 * alpha);
      ctx.lineWidth = isSelected ? 1.4 : 1;
      ctx.stroke();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(15,23,42,${alpha})`;

      lines.forEach((line, index) => {
        ctx.fillText(
          line,
          chipX + 10,
          chipY + 8 + index * (fontSize + 2) + fontSize / 2,
        );
      });
      ctx.restore();
    }
  }

  return prepared;
}
