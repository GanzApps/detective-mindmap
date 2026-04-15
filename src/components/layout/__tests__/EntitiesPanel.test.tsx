/** @jest-environment jsdom */

import { render, screen, fireEvent } from '@testing-library/react';
import EntitiesPanel from '../EntitiesPanel';
import { type GraphNode } from '@/lib/graph/graphTypes';

function makeNode(overrides: Partial<GraphNode> & { id: string; label: string; type: GraphNode['type'] }): GraphNode {
  return {
    status: 'unknown',
    tier: 0,
    parent: null,
    properties: {},
    ...overrides,
  };
}

const alice = makeNode({ id: 'n1', label: 'Alice', type: 'person' });
const bob = makeNode({ id: 'n2', label: 'Bob', type: 'person', status: 'suspect' });
const hq = makeNode({ id: 'n3', label: 'HQ', type: 'organization', status: 'confirmed' });
const child = makeNode({ id: 'n4', label: 'Child Org', type: 'organization', parent: 'n3', tier: 1 });
const orphan = makeNode({ id: 'n5', label: 'Orphan', type: 'location', parent: 'nonexistent', tier: 1 });

const defaultProps = {
  nodes: [alice, bob, hq],
  selectedNodeId: null,
  highlightedEntityIds: [],
  onSelectNode: jest.fn(),
  onDeleteEntity: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// --- By Type view ---

test('By Type: renders sections only for types with nodes', () => {
  render(<EntitiesPanel {...defaultProps} />);
  expect(screen.getByText('People')).toBeInTheDocument();
  expect(screen.getByText('Organizations')).toBeInTheDocument();
  expect(screen.queryByText('Locations')).not.toBeInTheDocument();
  expect(screen.queryByText('Events')).not.toBeInTheDocument();
});

test('By Type: section header shows count badge', () => {
  render(<EntitiesPanel {...defaultProps} />);
  // People section has 2 nodes
  const badges = screen.getAllByText('2');
  expect(badges.length).toBeGreaterThan(0);
});

test('By Type: sections collapsed by default — entity labels not visible', () => {
  render(<EntitiesPanel {...defaultProps} />);
  expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  expect(screen.queryByText('Bob')).not.toBeInTheDocument();
});

test('By Type: click section header expands it', () => {
  render(<EntitiesPanel {...defaultProps} />);
  fireEvent.click(screen.getByText('People'));
  expect(screen.getByText('Alice')).toBeInTheDocument();
  expect(screen.getByText('Bob')).toBeInTheDocument();
});

test('By Type: click expanded section header collapses it', () => {
  render(<EntitiesPanel {...defaultProps} />);
  fireEvent.click(screen.getByText('People'));
  expect(screen.getByText('Alice')).toBeInTheDocument();
  fireEvent.click(screen.getByText('People'));
  expect(screen.queryByText('Alice')).not.toBeInTheDocument();
});

test('renders empty state when no nodes', () => {
  render(<EntitiesPanel {...defaultProps} nodes={[]} />);
  expect(screen.getByText('No entities in this case.')).toBeInTheDocument();
});

// --- Entity row interactions ---

test('row: click calls onSelectNode with node id', () => {
  render(<EntitiesPanel {...defaultProps} />);
  fireEvent.click(screen.getByText('People'));
  fireEvent.click(screen.getByText('Alice'));
  expect(defaultProps.onSelectNode).toHaveBeenCalledWith('n1');
});

test('row: click selected node calls onSelectNode(null)', () => {
  render(<EntitiesPanel {...defaultProps} selectedNodeId="n1" />);
  fireEvent.click(screen.getByText('People'));
  fireEvent.click(screen.getByText('Alice'));
  expect(defaultProps.onSelectNode).toHaveBeenCalledWith(null);
});

test('row: delete button calls onDeleteEntity with node id', () => {
  render(<EntitiesPanel {...defaultProps} />);
  fireEvent.click(screen.getByText('People'));
  const deleteButtons = screen.getAllByLabelText('Delete Alice');
  fireEvent.click(deleteButtons[0]);
  expect(defaultProps.onDeleteEntity).toHaveBeenCalledWith('n1');
});

test('row: selected node has accent class', () => {
  render(<EntitiesPanel {...defaultProps} selectedNodeId="n1" />);
  fireEvent.click(screen.getByText('People'));
  const aliceRow = screen.getByText('Alice').closest('div');
  expect(aliceRow?.className).toMatch(/bg-shell-accent-muted/);
});

test('row: highlighted node has amber class', () => {
  render(<EntitiesPanel {...defaultProps} highlightedEntityIds={['n2']} />);
  fireEvent.click(screen.getByText('People'));
  const bobRow = screen.getByText('Bob').closest('div');
  expect(bobRow?.className).toMatch(/bg-amber-400\/10/);
});

// --- Hierarchy view ---

test('Hierarchy: switch to hierarchy mode — root nodes visible, collapsed by default', () => {
  render(<EntitiesPanel {...defaultProps} />);
  fireEvent.click(screen.getByText('Hierarchy'));
  // All root nodes visible (no parents in default set)
  expect(screen.getByText('Alice')).toBeInTheDocument();
  expect(screen.getByText('Bob')).toBeInTheDocument();
  expect(screen.getByText('HQ')).toBeInTheDocument();
});

test('Hierarchy: child hidden by default, shown after expand', () => {
  render(<EntitiesPanel {...defaultProps} nodes={[hq, child]} />);
  fireEvent.click(screen.getByText('Hierarchy'));
  // Child hidden by default
  expect(screen.queryByText('Child Org')).not.toBeInTheDocument();
  // Expand HQ via chevron button
  fireEvent.click(screen.getByLabelText('Expand'));
  expect(screen.getByText('Child Org')).toBeInTheDocument();
});

test('Hierarchy: child indented under parent (paddingLeft > 0)', () => {
  render(<EntitiesPanel {...defaultProps} nodes={[hq, child]} />);
  fireEvent.click(screen.getByText('Hierarchy'));
  fireEvent.click(screen.getByLabelText('Expand'));
  const childWrapper = screen.getByText('Child Org').closest('[style]');
  expect(childWrapper?.getAttribute('style')).toMatch(/padding-left:\s*12px/);
});

test('Hierarchy: orphaned node (parent not in list) renders as root', () => {
  render(<EntitiesPanel {...defaultProps} nodes={[orphan]} />);
  fireEvent.click(screen.getByText('Hierarchy'));
  const orphanWrapper = screen.getByText('Orphan').closest('[style]');
  expect(orphanWrapper?.getAttribute('style')).toMatch(/padding-left:\s*0px/);
});

test('Hierarchy: empty state when no nodes', () => {
  render(<EntitiesPanel {...defaultProps} nodes={[]} />);
  fireEvent.click(screen.getByText('Hierarchy'));
  expect(screen.getByText('No entities in this case.')).toBeInTheDocument();
});

// --- View toggle ---

test('toggle between By Type and Hierarchy re-renders without error', () => {
  render(<EntitiesPanel {...defaultProps} />);
  fireEvent.click(screen.getByText('Hierarchy'));
  expect(screen.getByText('Alice')).toBeInTheDocument();
  fireEvent.click(screen.getByText('By Type'));
  expect(screen.getByText('People')).toBeInTheDocument();
  expect(screen.queryByText('Alice')).not.toBeInTheDocument(); // collapsed again
});

// --- Children count badge ---

test('badge: hidden when node has no children', () => {
  // HQ alone has no children — badge should not appear
  render(<EntitiesPanel {...defaultProps} nodes={[hq]} />);
  fireEvent.click(screen.getByText('Organizations'));
  // No badge count — "1" or any number badge button must not be present
  // The count badge button contains only a digit; the section count is also "1" but it's a span, not a button
  const badgeButtons = Array.from(document.querySelectorAll('button')).filter((btn) => {
    return btn.classList.contains('rounded-full') && /^\d/.test(btn.textContent?.trim() ?? '');
  });
  expect(badgeButtons.length).toBe(0);
});

test('badge: shows correct count for parent node', () => {
  render(<EntitiesPanel {...defaultProps} nodes={[hq, child]} />);
  fireEvent.click(screen.getByText('Organizations'));
  // HQ has 1 child (child)
  expect(screen.getByText('1')).toBeInTheDocument();
});

test('badge: click calls onSelectNode with parent id', () => {
  const onSelectNode = jest.fn();
  render(
    <EntitiesPanel
      {...defaultProps}
      nodes={[hq, child]}
      onSelectNode={onSelectNode}
    />,
  );
  fireEvent.click(screen.getByText('Organizations'));
  // Find the badge button (contains count "1")
  const badgeBtn = screen.getByText('1').closest('button');
  expect(badgeBtn).not.toBeNull();
  fireEvent.click(badgeBtn!);
  expect(onSelectNode).toHaveBeenCalledWith('n3');
});
