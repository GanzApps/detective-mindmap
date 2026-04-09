import { type ProjectedNode3D } from '@/lib/graph/projection3d';

export function hitTest3D(
  nodes: ProjectedNode3D[],
  pointerX: number,
  pointerY: number,
  padding = 8,
) {
  let best: ProjectedNode3D | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const node of nodes) {
    const distance = Math.hypot(node.sx - pointerX, node.sy - pointerY);
    const hitRadius = node.radius + padding;

    if (distance <= hitRadius && distance < bestDistance) {
      best = node;
      bestDistance = distance;
    }
  }

  return best;
}

