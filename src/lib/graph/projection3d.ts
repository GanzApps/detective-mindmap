import { type GraphData, type GraphNode } from '@/lib/graph/graphTypes';

export interface LayoutNode3D {
  id: string;
  x: number;
  y: number;
  z: number;
  tier: number;
  label: string;
  node: GraphNode;
}

export interface CameraState3D {
  rotX: number;
  rotY: number;
  zoom: number;
  offsetX?: number;
  offsetY?: number;
}

export interface Viewport3D {
  width: number;
  height: number;
}

export interface ProjectedNode3D extends LayoutNode3D {
  sx: number;
  sy: number;
  scale: number;
  depth: number;
  radius: number;
}

const TIER_RADIUS = [0, 220, 340, 460, 560];
const VERTICAL_SPREAD = 95;

function getTierRadius(tier: number) {
  return TIER_RADIUS[tier] ?? (560 + Math.max(0, tier - 4) * 120);
}

function getNodeRadius(tier: number, scale: number) {
  const base = [20, 12, 8, 5][tier] ?? 5;
  return base * scale;
}

function projectCartesian(
  x: number,
  y: number,
  z: number,
  camera: CameraState3D,
  viewport: Viewport3D,
) {
  const cx = Math.cos(camera.rotX);
  const sx = Math.sin(camera.rotX);
  const cy = Math.cos(camera.rotY);
  const sy = Math.sin(camera.rotY);
  const tx = (cy * x) + (sy * z);
  const ty = (sx * ((-sy * x) + (cy * z))) + (cx * y);
  const depth = (cx * ((-sy * x) + (cy * z))) - (sx * y);
  const fov = 520 * camera.zoom;
  const scale = fov / (fov + depth + 500);

  return {
    sx: viewport.width / 2 + (camera.offsetX ?? 0) + (tx * scale),
    sy: viewport.height / 2 + (camera.offsetY ?? 0) - (ty * scale),
    scale,
    depth,
  };
}

export function buildMindMap3DLayout(graph: GraphData): LayoutNode3D[] {
  const childrenByParent = new Map<string | null, GraphNode[]>();

  for (const node of graph.nodes) {
    const bucket = childrenByParent.get(node.parent) ?? [];
    bucket.push(node);
    childrenByParent.set(node.parent, bucket);
  }

  const roots = [...(childrenByParent.get(null) ?? [])].sort((left, right) => (
    left.label.localeCompare(right.label)
  ));

  if (roots.length === 0) {
    return [];
  }

  const layout: LayoutNode3D[] = [];

  function placeNodes(
    nodes: GraphNode[],
    startAngle: number,
    endAngle: number,
    parentY: number,
  ) {
    nodes.forEach((node, index) => {
      const sliceSize = (endAngle - startAngle) / nodes.length;
      const nodeStart = startAngle + (sliceSize * index);
      const nodeEnd = nodeStart + sliceSize;
      const angle = nodeStart + sliceSize / 2;
      const tierRadius = getTierRadius(node.tier);
      const yOffsetIndex = index - (nodes.length - 1) / 2;
      const y = node.tier === 0
        ? 0
        : parentY + (yOffsetIndex * VERTICAL_SPREAD * Math.max(0.35, 1 - node.tier * 0.12));

      layout.push({
        id: node.id,
        x: Math.cos(angle) * tierRadius,
        y,
        z: Math.sin(angle) * tierRadius,
        tier: node.tier,
        label: node.label,
        node,
      });

      const children = [...(childrenByParent.get(node.id) ?? [])].sort((left, right) => (
        left.label.localeCompare(right.label)
      ));

      if (children.length > 0) {
        placeNodes(children, nodeStart, nodeEnd, y);
      }
    });
  }

  placeNodes(roots, 0, Math.PI * 2, 0);

  return layout;
}

export function projectNode3D(
  node: LayoutNode3D,
  camera: CameraState3D,
  viewport: Viewport3D,
): ProjectedNode3D {
  const projection = projectCartesian(node.x, node.y, node.z, camera, viewport);

  return {
    ...node,
    ...projection,
    radius: getNodeRadius(node.tier, projection.scale),
  };
}

export function projectNodes3D(
  nodes: LayoutNode3D[],
  camera: CameraState3D,
  viewport: Viewport3D,
): ProjectedNode3D[] {
  return nodes.map((node) => projectNode3D(node, camera, viewport));
}
