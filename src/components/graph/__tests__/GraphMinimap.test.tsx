/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import GraphMinimap from '@/components/graph/GraphMinimap';
import { type GraphMinimapState } from '@/components/graph/graphMinimapTypes';

const baseState: GraphMinimapState = {
  label: '2D',
  points: [
    { id: 'n1', x: 0.2, y: 0.3, color: '#e74c3c', active: false },
    { id: 'n2', x: 0.7, y: 0.6, color: '#3498db', active: true },
  ],
  viewport: { x: 0.1, y: 0.1, width: 0.5, height: 0.5 },
};

describe('GraphMinimap', () => {
  it('renders the SVG canvas with aria-label', () => {
    render(<GraphMinimap state={baseState} />);
    expect(screen.getByLabelText('Workspace minimap')).toBeInTheDocument();
  });

  it('does not render the Minimap label text or 2D/3D badge', () => {
    const { container } = render(<GraphMinimap state={baseState} />);
    expect(container.textContent).toBe('');
  });

  it('applies width prop as inline style on container', () => {
    const { container } = render(<GraphMinimap state={baseState} width={180} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('180px');
  });

  it('calls onPanTo with normalized coords on SVG click', () => {
    const onPanTo = jest.fn();
    render(<GraphMinimap state={baseState} onPanTo={onPanTo} />);

    const svg = screen.getByLabelText('Workspace minimap');
    // Mock getBoundingClientRect so normalized coords are predictable
    svg.getBoundingClientRect = () => ({
      left: 0, top: 0, width: 200, height: 200,
      right: 200, bottom: 200, x: 0, y: 0, toJSON: () => {},
    });

    fireEvent.mouseDown(svg, { clientX: 100, clientY: 50 });
    expect(onPanTo).toHaveBeenCalledWith(0.5, 0.25);
  });

  it('calls onPanTo continuously while dragging', () => {
    const onPanTo = jest.fn();
    render(<GraphMinimap state={baseState} onPanTo={onPanTo} />);

    const svg = screen.getByLabelText('Workspace minimap');
    svg.getBoundingClientRect = () => ({
      left: 0, top: 0, width: 200, height: 200,
      right: 200, bottom: 200, x: 0, y: 0, toJSON: () => {},
    });

    fireEvent.mouseDown(svg, { clientX: 40, clientY: 40 });
    fireEvent.mouseMove(svg, { clientX: 120, clientY: 80, buttons: 1 });
    fireEvent.mouseMove(svg, { clientX: 160, clientY: 100, buttons: 1 });

    expect(onPanTo).toHaveBeenCalledTimes(3);
    expect(onPanTo).toHaveBeenNthCalledWith(1, 0.2, 0.2);
    expect(onPanTo).toHaveBeenNthCalledWith(2, 0.6, 0.4);
    expect(onPanTo).toHaveBeenNthCalledWith(3, 0.8, 0.5);
  });

  it('does not call onPanTo on mousemove when mouse button not held', () => {
    const onPanTo = jest.fn();
    render(<GraphMinimap state={baseState} onPanTo={onPanTo} />);

    const svg = screen.getByLabelText('Workspace minimap');
    svg.getBoundingClientRect = () => ({
      left: 0, top: 0, width: 200, height: 200,
      right: 200, bottom: 200, x: 0, y: 0, toJSON: () => {},
    });

    // move without mousedown
    fireEvent.mouseMove(svg, { clientX: 100, clientY: 100, buttons: 0 });
    expect(onPanTo).not.toHaveBeenCalled();
  });
});
