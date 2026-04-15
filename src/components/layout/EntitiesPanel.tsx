'use client';

import { ENTITY_TYPE_COLOR, ENTITY_TYPE_ICON, type EntityType, type GraphNode } from '@/lib/graph/graphTypes';
import { useState } from 'react';

const ENTITY_LABELS: Record<EntityType, string> = {
  person: 'People',
  organization: 'Organizations',
  location: 'Locations',
  event: 'Events',
  evidence: 'Transactions',
  vehicle: 'Vehicles',
  digital: 'Digital',
};

const ENTITY_TYPE_ORDER: EntityType[] = [
  'person',
  'organization',
  'location',
  'event',
  'evidence',
  'vehicle',
  'digital',
];

const STATUS_BADGE: Record<GraphNode['status'], string> = {
  confirmed: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400',
  suspect: 'border-amber-400/40 bg-amber-400/10 text-amber-400',
  unknown: 'border-shell-border bg-shell-surface text-shell-text-muted',
};


type TreeNode = GraphNode & { children: TreeNode[] };

function buildTree(nodes: GraphNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>(
    nodes.map((n) => [n.id, { ...n, children: [] }]),
  );
  const roots: TreeNode[] = [];

  for (const n of map.values()) {
    if (n.parent && map.has(n.parent)) {
      map.get(n.parent)!.children.push(n);
    } else {
      roots.push(n);
    }
  }

  return roots;
}

function computeChildrenCountMap(nodes: GraphNode[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const n of nodes) {
    if (n.parent) {
      map.set(n.parent, (map.get(n.parent) ?? 0) + 1);
    }
  }
  return map;
}

function EntityIcon({ type, size = 14 }: { type: EntityType; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={ENTITY_TYPE_COLOR[type]}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d={ENTITY_TYPE_ICON[type]} />
    </svg>
  );
}

function EntityRow({
  node,
  isSelected,
  isHighlighted,
  childCount,
  onSelect,
  onDelete,
}: {
  node: GraphNode;
  isSelected: boolean;
  isHighlighted: boolean;
  childCount: number;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs transition ${
        isSelected
          ? 'border-shell-accent/40 bg-shell-accent-muted'
          : isHighlighted
            ? 'border-amber-400/30 bg-amber-400/10'
            : 'border-shell-border bg-shell-bg'
      }`}
    >
      <EntityIcon type={node.type} />
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 truncate text-left font-medium text-shell-text-primary"
      >
        {node.label}
      </button>
      {childCount > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="flex items-center gap-0.5 rounded-full border border-shell-border bg-shell-surface-raised px-1.5 py-0.5 text-[10px] text-shell-text-muted transition hover:border-shell-accent/30 hover:text-shell-text-primary"
        >
          {childCount}
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      <span
        className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_BADGE[node.status]}`}
      >
        {node.status}
      </span>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 text-shell-destructive opacity-60 hover:opacity-100"
        aria-label={`Delete ${node.label}`}
      >
        ×
      </button>
    </div>
  );
}

function TreeNodeRow({
  node,
  depth,
  selectedNodeId,
  highlightedEntityIds,
  childrenCountMap,
  expandedHierarchyNodes,
  onSelectNode,
  onDeleteEntity,
  onToggleHierarchyNode,
}: {
  node: TreeNode;
  depth: number;
  selectedNodeId: string | null;
  highlightedEntityIds: string[];
  childrenCountMap: Map<string, number>;
  expandedHierarchyNodes: Set<string>;
  onSelectNode: (id: string | null) => void;
  onDeleteEntity: (id: string) => void;
  onToggleHierarchyNode: (id: string) => void;
}) {
  const childCount = childrenCountMap.get(node.id) ?? 0;
  const isExpanded = expandedHierarchyNodes.has(node.id);

  return (
    <>
      <div style={{ paddingLeft: depth * 12 }} className="flex items-center gap-1">
        {childCount > 0 ? (
          <button
            type="button"
            onClick={() => onToggleHierarchyNode(node.id)}
            className="shrink-0 text-shell-text-muted hover:text-shell-text-primary"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`h-3 w-3 transition ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <EntityRow
            node={node}
            isSelected={selectedNodeId === node.id}
            isHighlighted={highlightedEntityIds.includes(node.id)}
            childCount={childCount}
            onSelect={() => onSelectNode(selectedNodeId === node.id ? null : node.id)}
            onDelete={() => onDeleteEntity(node.id)}
          />
        </div>
      </div>
      {isExpanded && node.children.map((child) => (
        <TreeNodeRow
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedNodeId={selectedNodeId}
          highlightedEntityIds={highlightedEntityIds}
          childrenCountMap={childrenCountMap}
          expandedHierarchyNodes={expandedHierarchyNodes}
          onSelectNode={onSelectNode}
          onDeleteEntity={onDeleteEntity}
          onToggleHierarchyNode={onToggleHierarchyNode}
        />
      ))}
    </>
  );
}

export default function EntitiesPanel({
  nodes,
  selectedNodeId,
  highlightedEntityIds,
  onSelectNode,
  onDeleteEntity,
}: {
  nodes: GraphNode[];
  selectedNodeId: string | null;
  highlightedEntityIds: string[];
  onSelectNode: (id: string | null) => void;
  onDeleteEntity: (id: string) => void;
}) {
  const [viewMode, setViewMode] = useState<'type' | 'hierarchy'>('type');
  const [expandedTypes, setExpandedTypes] = useState<Set<EntityType>>(new Set());
  const [expandedHierarchyNodes, setExpandedHierarchyNodes] = useState<Set<string>>(new Set());

  function toggleType(type: EntityType) {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function toggleHierarchyNode(id: string) {
    setExpandedHierarchyNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const treeRoots = viewMode === 'hierarchy' ? buildTree(nodes) : [];
  const childrenCountMap = computeChildrenCountMap(nodes);

  return (
    <div className="space-y-shell-sm">
      {/* View mode toggle */}
      <div className="flex rounded-shell-lg border border-shell-border bg-shell-surface-raised p-0.5">
        <button
          type="button"
          onClick={() => setViewMode('type')}
          className={`flex-1 rounded-shell-lg px-2 py-1 text-xs font-medium transition ${
            viewMode === 'type'
              ? 'bg-shell-accent text-white shadow-shell-sm'
              : 'text-shell-text-secondary hover:bg-shell-surface'
          }`}
        >
          By Type
        </button>
        <button
          type="button"
          onClick={() => setViewMode('hierarchy')}
          className={`flex-1 rounded-shell-lg px-2 py-1 text-xs font-medium transition ${
            viewMode === 'hierarchy'
              ? 'bg-shell-accent text-white shadow-shell-sm'
              : 'text-shell-text-secondary hover:bg-shell-surface'
          }`}
        >
          Hierarchy
        </button>
      </div>

      {viewMode === 'type' ? (
        <div className="space-y-1">
          {ENTITY_TYPE_ORDER.map((type) => {
            const typeNodes = nodes.filter((n) => n.type === type);
            if (typeNodes.length === 0) return null;
            const isExpanded = expandedTypes.has(type);

            return (
              <section key={type}>
                <button
                  type="button"
                  onClick={() => toggleType(type)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition hover:bg-shell-surface-raised"
                >
                  <EntityIcon type={type} size={16} />
                  <span className="flex-1 text-left font-semibold text-shell-text-primary">
                    {ENTITY_LABELS[type]}
                  </span>
                  <span className="rounded-full border border-shell-border bg-shell-surface px-1.5 py-0.5 text-[10px] text-shell-text-muted">
                    {typeNodes.length}
                  </span>
                  <svg
                    className={`h-3 w-3 shrink-0 transition ${isExpanded ? 'rotate-180' : ''} text-shell-text-muted`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="mt-0.5 space-y-0.5 px-1">
                    {typeNodes.map((node) => (
                      <EntityRow
                        key={node.id}
                        node={node}
                        isSelected={selectedNodeId === node.id}
                        isHighlighted={highlightedEntityIds.includes(node.id)}
                        childCount={childrenCountMap.get(node.id) ?? 0}
                        onSelect={() => onSelectNode(selectedNodeId === node.id ? null : node.id)}
                        onDelete={() => onDeleteEntity(node.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
          {nodes.length === 0 && (
            <p className="px-2 py-3 text-xs text-shell-text-muted">No entities in this case.</p>
          )}
        </div>
      ) : (
        <div className="space-y-0.5">
          {treeRoots.map((root) => (
            <TreeNodeRow
              key={root.id}
              node={root}
              depth={0}
              selectedNodeId={selectedNodeId}
              highlightedEntityIds={highlightedEntityIds}
              childrenCountMap={childrenCountMap}
              expandedHierarchyNodes={expandedHierarchyNodes}
              onSelectNode={onSelectNode}
              onDeleteEntity={onDeleteEntity}
              onToggleHierarchyNode={toggleHierarchyNode}
            />
          ))}
          {nodes.length === 0 && (
            <p className="px-2 py-3 text-xs text-shell-text-muted">No entities in this case.</p>
          )}
        </div>
      )}
    </div>
  );
}
