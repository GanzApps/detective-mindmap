/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import TimelineBar from '@/components/layout/TimelineBar';
import { mockCases } from '@/lib/data/mockCases';

describe('TimelineBar', () => {
  it('renders expanded by default with event cards and timeline track dots', () => {
    render(<TimelineBar caseData={mockCases[0]} />);

    const toggle = screen.getByRole('button', { name: /toggle timeline/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText(/\d+ events/i)).toBeInTheDocument();

    // Event cards visible when expanded
    const articles = document.querySelectorAll('article');
    expect(articles.length).toBeGreaterThan(0);
  });

  it('collapses and hides the strip when the toggle is clicked', () => {
    render(<TimelineBar caseData={mockCases[0]} />);

    const toggle = screen.getByRole('button', { name: /toggle timeline/i });

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelectorAll('article').length).toBe(0);
  });

  it('shows description tooltip on (?) hover and hides on mouse-leave', () => {
    render(<TimelineBar caseData={mockCases[0]} />);

    const helpBtn = screen.getByRole('button', { name: /timeline help/i });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(helpBtn);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Chronology stays docked');

    fireEvent.mouseLeave(helpBtn);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders a connecting line element between each pair of adjacent events', () => {
    render(<TimelineBar caseData={mockCases[0]} />);

    const articles = document.querySelectorAll('article');
    // n events → n-1 connector lines (hr-like divs between cards)
    const connectors = document.querySelectorAll('[class*="from-shell-accent"]');
    expect(connectors.length).toBe(articles.length - 1);
  });

  it('does not render Evidence / Node / Network context chips', () => {
    render(<TimelineBar caseData={mockCases[0]} />);

    expect(screen.queryByText(/^Evidence$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Node$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Network$/i)).not.toBeInTheDocument();
  });
});
