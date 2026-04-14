import { type ProjectedNode3D } from '@/lib/graph/projection3d';

/** Result of a 3D hit test */
export interface HitTest3DResult {
  /** The node that was hit, or null if no hit */
  node: ProjectedNode3D | null;
  /** True if the hit node is the currently selected node */
  isSelectedNode: boolean;
}

/**
 * Perform hit detection on 3D graph nodes.
 *
 * When selectedNodeId is provided, prioritizes hit detection on the selected node
 * using a minimum 20px screen-radius for drag disambiguation (per UI-SPEC.md).
 *
 * @param nodes - Array of projected 3D nodes
 * @param pointerX - Pointer X coordinate in screen space
 * @param pointerY - Pointer Y coordinate in screen space
 * @param padding - Base padding around node radius for hit detection (default: 8px)
 * @param selectedNodeId - Optional ID of the selected node to prioritize
 * @returns Hit test result with node and isSelectedNode flag
 */
export function hitTest3D(
  nodes: ProjectedNode3D[],
  pointerX: number,
  pointerY: number,
  padding = 8,
  selectedNodeId?: string,
): HitTest3DResult {
  // Minimum screen-radius for selected node hit detection (UI-SPEC.md: 20px)
  const MIN_SELECTED_NODE_RADIUS = 20;

  // If selectedNodeId is provided, check it first with prioritized hit radius
  if (selectedNodeId !== undefined) {
    const selectedNode = nodes.find((n) => n.id === selectedNodeId);
    if (selectedNode) {
      // Use maximum of node radius and minimum 20px for drag eligibility
      const selectedHitRadius = Math.max(selectedNode.radius, MIN_SELECTED_NODE_RADIUS) + padding;
      const distanceToSelected = Math.hypot(selectedNode.sx - pointerX, selectedNode.sy - pointerY);

      if (distanceToSelected <= selectedHitRadius) {
        return {
          node: selectedNode,
          isSelectedNode: true,
        };
      }
    }
  }

  // Fall back to normal hit testing for all nodes
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

  return {
    node: best,
    isSelectedNode: best !== null && best.id === selectedNodeId,
  };
}

