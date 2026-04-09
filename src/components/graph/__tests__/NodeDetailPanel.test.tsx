/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import NodeDetailPanel from '@/components/graph/NodeDetailPanel';
import { mockCases } from '@/lib/data/mockCases';

describe('NodeDetailPanel', () => {
  it('renders the richer analysis content for the selected node', () => {
    render(
      <NodeDetailPanel
        graph={mockCases[0].graph}
        node={mockCases[0].graph.nodes.find((node) => node.id === 'node-002') ?? null}
        highlightedNodeIds={['node-007', 'node-011']}
        onDismiss={() => {}}
      />,
    );

    expect(screen.getByLabelText('Node detail panel')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Marco Delgado' })).toBeInTheDocument();
    expect(screen.getByText('Connection summary')).toBeInTheDocument();
    expect(screen.getByText('Entity properties')).toBeInTheDocument();
    expect(screen.getByText('alias')).toBeInTheDocument();
    expect(screen.getByText('El Jefe')).toBeInTheDocument();
  });

  it('invokes dismiss from the shared close control', () => {
    const onDismiss = jest.fn();

    render(
      <NodeDetailPanel
        graph={mockCases[0].graph}
        node={mockCases[0].graph.nodes.find((node) => node.id === 'node-002') ?? null}
        highlightedNodeIds={[]}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close node detail panel' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when there is no selected node', () => {
    const { container } = render(
      <NodeDetailPanel
        graph={mockCases[0].graph}
        node={null}
        highlightedNodeIds={[]}
        onDismiss={() => {}}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
