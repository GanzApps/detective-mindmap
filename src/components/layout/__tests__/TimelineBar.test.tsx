/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import TimelineBar from '@/components/layout/TimelineBar';
import { mockCases } from '@/lib/data/mockCases';

describe('TimelineBar', () => {
  it('renders a collapsed dock that expands into chronology details', () => {
    render(
      <TimelineBar
        caseData={mockCases[0]}
        activeEvidenceLabel="Encrypted handset dump"
        selectedNodeLabel="Marco Delgado"
        highlightedCount={2}
      />,
    );

    const toggle = screen.getByRole('button', { name: /timeline/i });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText(/8 events/i)).toBeInTheDocument();
    expect(screen.queryByText('Encrypted handset dump')).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Encrypted handset dump')).toBeInTheDocument();
    expect(screen.getByText('Marco Delgado')).toBeInTheDocument();
    expect(screen.getByText(/2 highlighted/i)).toBeInTheDocument();
  });
});
