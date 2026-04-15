/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import EvidenceSidebar from '@/components/layout/EvidenceSidebar';
import TimelineBar from '@/components/layout/TimelineBar';
import { mockCases } from '@/lib/data/mockCases';


describe('Workspace panels', () => {
  it('opens on Evidence tab by default showing entitiesPanel', () => {
    render(
      <EvidenceSidebar
        entitiesPanel={<div>Entities content</div>}
        filtersPanel={<div>Filters content</div>}
      />,
    );

    expect(screen.getByText('Entities content')).toBeInTheDocument();
    expect(screen.queryByText('Filters content')).not.toBeInTheDocument();
  });

  it('shows the timeline strip expanded by default and collapses on toggle', () => {
    render(<TimelineBar caseData={mockCases[0]} />);

    const toggle = screen.getByRole('button', { name: /toggle timeline/i });

    // Expanded by default — event cards visible
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.querySelectorAll('article').length).toBeGreaterThan(0);

    fireEvent.click(toggle);

    // Collapsed — strip hidden
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelectorAll('article').length).toBe(0);
  });
});
