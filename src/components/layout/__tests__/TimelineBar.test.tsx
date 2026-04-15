/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import TimelineBar from '@/components/layout/TimelineBar';
import { mockCases } from '@/lib/data/mockCases';

describe('TimelineBar', () => {
  it('renders expanded by default showing event cards and context chips', () => {
    render(
      <TimelineBar
        caseData={mockCases[0]}
        activeEvidenceLabel="Encrypted handset dump"
        selectedNodeLabel="Marco Delgado"
        highlightedCount={2}
      />,
    );

    const toggle = screen.getByRole('button', { name: /toggle timeline/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText(/8 events/i)).toBeInTheDocument();

    // Context chips visible when expanded
    expect(screen.getByText('Encrypted handset dump')).toBeInTheDocument();
    expect(screen.getByText('Marco Delgado')).toBeInTheDocument();
    expect(screen.getByText(/2 highlighted/i)).toBeInTheDocument();
  });

  it('collapses and hides event strip when toggled', () => {
    render(
      <TimelineBar
        caseData={mockCases[0]}
        activeEvidenceLabel="Encrypted handset dump"
        selectedNodeLabel="Marco Delgado"
        highlightedCount={2}
      />,
    );

    const toggle = screen.getByRole('button', { name: /toggle timeline/i });

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Encrypted handset dump')).not.toBeInTheDocument();
    expect(screen.queryByText('Marco Delgado')).not.toBeInTheDocument();
  });

  it('shows description tooltip when (?) button is hovered', () => {
    render(
      <TimelineBar
        caseData={mockCases[0]}
        activeEvidenceLabel="None"
        selectedNodeLabel="None"
        highlightedCount={0}
      />,
    );

    const helpBtn = screen.getByRole('button', { name: /timeline help/i });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(helpBtn);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Chronology stays docked');

    fireEvent.mouseLeave(helpBtn);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
