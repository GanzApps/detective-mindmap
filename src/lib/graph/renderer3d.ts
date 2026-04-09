import { type EntityType, type GraphData } from '@/lib/graph/graphTypes';
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

const TIER_COLORS = {
  0: { fill: '#a78bfa', glow: '167,139,250', line: '167,139,250' },
  1: { fill: '#38bdf8', glow: '56,189,248', line: '56,189,248' },
  2: { fill: '#f472b6', glow: '244,114,182', line: '244,114,182' },
  3: { fill: '#34d399', glow: '52,211,153', line: '52,211,153' },
  4: { fill: '#fbbf24', glow: '251,191,36', line: '251,191,36' },
} as const;

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

function getTierPalette(tier: number) {
  return TIER_COLORS[tier as keyof typeof TIER_COLORS] ?? TIER_COLORS[4];
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
      const gradient = ctx.createLinearGradient(source.sx, source.sy, target.sx, target.sy);
      gradient.addColorStop(0, `rgba(${getTierPalette(source.tier).line},0.9)`);
      gradient.addColorStop(1, `rgba(${getTierPalette(target.tier).line},0.9)`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.6;
    } else {
      const depth = Math.max(0, Math.min(1, (source.depth + target.depth) / 1200 + 0.5));
      ctx.strokeStyle = `rgba(${getTierPalette(source.tier).line},${0.07 + depth * 0.15})`;
      ctx.lineWidth = 0.7;
    }

    ctx.stroke();
    ctx.restore();
  }

  for (const node of prepared.sortedNodes) {
    const palette = getTierPalette(node.tier);
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
      ctx.beginPath();
      ctx.arc(node.sx, node.sy, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fill();
      ctx.restore();
      continue;
    }

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
      gradient.addColorStop(0, `rgba(${palette.glow},${glowAlpha})`);
      gradient.addColorStop(1, `rgba(${palette.glow},0)`);
      ctx.beginPath();
      ctx.arc(node.sx, node.sy, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(node.sx, node.sy, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = palette.fill;
    ctx.globalAlpha = isSelected || isConnected || isHighlighted
      ? 1
      : Math.max(0.35, 0.45 + node.depth / 700);
    ctx.fill();
    ctx.restore();

    if (isSelected || isConnected || isHighlighted) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(node.sx, node.sy, node.radius + (isSelected ? 1.5 : 0.5), 0, Math.PI * 2);
      ctx.strokeStyle = palette.fill;
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

      ctx.save();
      ctx.font = `${node.tier <= 1 ? '500' : '400'} ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = `rgba(210,225,255,${alpha})`;

      lines.forEach((line, index) => {
        ctx.fillText(line, node.sx, node.sy + node.radius + 4 + index * (fontSize + 2));
      });
      ctx.restore();
    }
  }

  return prepared;
}
