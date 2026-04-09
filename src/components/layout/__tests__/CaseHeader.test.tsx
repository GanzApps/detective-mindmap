/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import CaseHeader from '@/components/layout/CaseHeader';
import { mockCases } from '@/lib/data/mockCases';

describe('CaseHeader', () => {
  it('renders the main controls and count summary', () => {
    render(
      <CaseHeader
        caseData={mockCases[0]}
        entityCount={mockCases[0].graph.nodes.length}
        connectionCount={mockCases[0].graph.edges.length}
        highlightedCount={3}
        viewMode="2d"
        onSetViewMode={() => {}}
        onOpenEntityModal={() => {}}
        onOpenConnectionModal={() => {}}
        onClearHighlights={() => {}}
        onExport={() => {}}
      />,
    );

    expect(screen.getByText('Investigation Workspace')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Operation Nightfall' })).toBeInTheDocument();
    expect(screen.getByText('17 entities')).toBeInTheDocument();
    expect(screen.getByText('25 connections')).toBeInTheDocument();
    expect(screen.getByText('3 highlighted')).toBeInTheDocument();
    expect(screen.getByText('Export Report')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PNG snapshot' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PDF report' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PNG + PDF' })).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2D view' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3D view' })).toBeInTheDocument();
  });

  it('routes export and action controls through the provided callbacks', () => {
    const onSetViewMode = jest.fn();
    const onOpenEntityModal = jest.fn();
    const onOpenConnectionModal = jest.fn();
    const onClearHighlights = jest.fn();
    const onExport = jest.fn();

    render(
      <CaseHeader
        caseData={mockCases[0]}
        entityCount={mockCases[0].graph.nodes.length}
        connectionCount={mockCases[0].graph.edges.length}
        highlightedCount={0}
        viewMode="2d"
        onSetViewMode={onSetViewMode}
        onOpenEntityModal={onOpenEntityModal}
        onOpenConnectionModal={onOpenConnectionModal}
        onClearHighlights={onClearHighlights}
        onExport={onExport}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '3D view' }));
    fireEvent.click(screen.getByRole('button', { name: 'PNG snapshot' }));
    fireEvent.click(screen.getByText('Add entity'));
    fireEvent.click(screen.getByText('Add connection'));
    fireEvent.click(screen.getByText('Clear evidence highlight'));

    expect(onSetViewMode).toHaveBeenCalledWith('3d');
    expect(onExport).toHaveBeenCalledWith('png');
    expect(onOpenEntityModal).toHaveBeenCalledTimes(1);
    expect(onOpenConnectionModal).toHaveBeenCalledTimes(1);
    expect(onClearHighlights).toHaveBeenCalledTimes(1);
  });
});
