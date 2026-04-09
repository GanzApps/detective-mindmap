/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import TimelineBar from '@/components/layout/TimelineBar';
import { mockCases } from '@/lib/data/mockCases';

describe('TimelineBar', () => {
  it('renders case-aware footer content and status details', () => {
    render(
      <TimelineBar
        caseData={mockCases[0]}
        activeEvidenceLabel="Encrypted handset dump"
        selectedNodeLabel="Marco Delgado"
        highlightedCount={2}
      />,
    );

    expect(screen.getByText('Timeline and status strip')).toBeInTheDocument();
    expect(screen.getByText(/Operation Nightfall timeline placeholder/i)).toBeInTheDocument();
    expect(screen.getByText('Encrypted handset dump')).toBeInTheDocument();
    expect(screen.getByText('Marco Delgado')).toBeInTheDocument();
    expect(screen.getByText(/2 highlighted/i)).toBeInTheDocument();
  });
});
