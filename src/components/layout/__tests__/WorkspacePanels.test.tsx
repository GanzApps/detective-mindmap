/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import EvidenceSidebar from '@/components/layout/EvidenceSidebar';
import TimelineBar from '@/components/layout/TimelineBar';
import { mockCases } from '@/lib/data/mockCases';

describe('Workspace panels', () => {
  it('opens the left rail on Raw Evidence by default', () => {
    render(
      <EvidenceSidebar
        evidence={mockCases[0].evidence}
        selectedEvidenceId={mockCases[0].evidence[0].files[0].id}
        onEvidenceSelect={() => {}}
        filtersPanel={<div>Filters content</div>}
      />,
    );

    expect(screen.getByText('iPhone_14_extraction.zip')).toBeInTheDocument();
    expect(screen.queryByText('Filters content')).not.toBeInTheDocument();
  });

  it('keeps the timeline collapsed until the handle is used', () => {
    render(
      <TimelineBar
        caseData={mockCases[0]}
        activeEvidenceLabel="iPhone_14_extraction.zip"
        selectedNodeLabel="Marco Delgado"
        highlightedCount={2}
      />,
    );

    const toggle = screen.getByRole('button', { name: /timeline/i });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Active evidence')).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Active evidence')).toBeInTheDocument();
  });
});
