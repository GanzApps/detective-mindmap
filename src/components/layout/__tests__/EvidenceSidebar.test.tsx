/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import EvidenceSidebar from '@/components/layout/EvidenceSidebar';

describe('EvidenceSidebar', () => {
  it('renders Evidence and Filters tabs only', () => {
    render(
      <EvidenceSidebar
        filtersPanel={<div>Filters panel content</div>}
        entitiesPanel={<div>Entities panel content</div>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Evidence' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Entities' })).not.toBeInTheDocument();
  });

  it('Evidence tab shows entitiesPanel by default', () => {
    render(
      <EvidenceSidebar
        filtersPanel={<div>Filters panel content</div>}
        entitiesPanel={<div>Entities panel content</div>}
      />,
    );

    expect(screen.getByText('Entities panel content')).toBeInTheDocument();
    expect(screen.queryByText('Filters panel content')).not.toBeInTheDocument();
  });

  it('Filters tab shows filtersPanel', () => {
    render(
      <EvidenceSidebar
        filtersPanel={<div>Filters panel content</div>}
        entitiesPanel={<div>Entities panel content</div>}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));

    expect(screen.getByText('Filters panel content')).toBeInTheDocument();
    expect(screen.queryByText('Entities panel content')).not.toBeInTheDocument();
  });

  it('shows fallback when no entitiesPanel provided', () => {
    render(<EvidenceSidebar />);

    expect(screen.getByText('No entities panel provided.')).toBeInTheDocument();
  });

  it('shows fallback when no filtersPanel provided', () => {
    render(<EvidenceSidebar />);

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));

    expect(screen.getByText('Filters are not available yet.')).toBeInTheDocument();
  });

  it('renders searchPanel above tabs when provided', () => {
    render(
      <EvidenceSidebar
        searchPanel={<div>Search panel content</div>}
      />,
    );

    expect(screen.getByText('Search panel content')).toBeInTheDocument();
  });
});
