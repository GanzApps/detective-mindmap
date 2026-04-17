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

function mockRect(svg: Element) {
  svg.getBoundingClientRect = () => ({
    left: 0, top: 0, width: 200, height: 200,
    right: 200, bottom: 200, x: 0, y: 0, toJSON: () => {},
  });
}

describe('GraphMinimap', () => {
  it('renders the SVG canvas with aria-label', () => {
    render(<GraphMinimap state={baseState} />);
    expect(screen.getByLabelText('Workspace minimap')).toBeInTheDocument();
  });

  it('does not render any text content', () => {
    const { container } = render(<GraphMinimap state={baseState} />);
    expect(container.textContent).toBe('');
  });

  it('applies width prop as inline style on container', () => {
    const { container } = render(<GraphMinimap state={baseState} width={180} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('180px');
  });

  it('calls onPanTo with normalized coords on mousedown', () => {
    const onPanTo = jest.fn();
    const onPanMove = jest.fn();
    render(<GraphMinimap state={baseState} onPanTo={onPanTo} onPanMove={onPanMove} />);

    const svg = screen.getByLabelText('Workspace minimap');
    mockRect(svg);

    fireEvent.mouseDown(svg, { clientX: 100, clientY: 50 });
    expect(onPanTo).toHaveBeenCalledTimes(1);
    expect(onPanTo).toHaveBeenCalledWith(0.5, 0.25);
    // no pan move on initial click
    expect(onPanMove).not.toHaveBeenCalled();
  });

  it('calls onPanMove with delta on drag', () => {
    const onPanTo = jest.fn();
    const onPanMove = jest.fn();
    render(<GraphMinimap state={baseState} onPanTo={onPanTo} onPanMove={onPanMove} />);

    const svg = screen.getByLabelText('Workspace minimap');
    mockRect(svg);

    fireEvent.mouseDown(svg, { clientX: 40, clientY: 40 });   // snap to (0.2, 0.2)
    fireEvent.mouseMove(svg, { clientX: 80, clientY: 60, buttons: 1 });  // delta (+0.2, +0.1)
    fireEvent.mouseMove(svg, { clientX: 120, clientY: 80, buttons: 1 }); // delta (+0.2, +0.1)

    expect(onPanTo).toHaveBeenCalledTimes(1);
    expect(onPanMove).toHaveBeenCalledTimes(2);
    const [dnx1, dny1] = onPanMove.mock.calls[0];
    const [dnx2, dny2] = onPanMove.mock.calls[1];
    expect(dnx1).toBeCloseTo(0.2, 5);
    expect(dny1).toBeCloseTo(0.1, 5);
    expect(dnx2).toBeCloseTo(0.2, 5);
    expect(dny2).toBeCloseTo(0.1, 5);
  });

  it('does not call onPanMove when mouse button not held', () => {
    const onPanMove = jest.fn();
    render(<GraphMinimap state={baseState} onPanMove={onPanMove} />);

    const svg = screen.getByLabelText('Workspace minimap');
    mockRect(svg);

    fireEvent.mouseMove(svg, { clientX: 100, clientY: 100, buttons: 0 });
    expect(onPanMove).not.toHaveBeenCalled();
  });

  it('resets drag state on mouseLeave and does not fire move after re-enter', () => {
    const onPanTo = jest.fn();
    const onPanMove = jest.fn();
    render(<GraphMinimap state={baseState} onPanTo={onPanTo} onPanMove={onPanMove} />);

    const svg = screen.getByLabelText('Workspace minimap');
    mockRect(svg);

    fireEvent.mouseDown(svg, { clientX: 40, clientY: 40 });
    fireEvent.mouseLeave(svg);
    // Move after leave — isDragging is false, should not fire
    fireEvent.mouseMove(svg, { clientX: 80, clientY: 80, buttons: 1 });

    expect(onPanMove).not.toHaveBeenCalled();
  });
});
