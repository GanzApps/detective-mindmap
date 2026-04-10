/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import AICommandBar from '@/components/layout/AICommandBar';

describe('AICommandBar', () => {
  it('renders the known-intent command surface placeholder', () => {
    render(<AICommandBar />);

    expect(screen.getByText('Investigation command center')).toBeInTheDocument();
    expect(screen.getByText(/known intents/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /find suspicious patterns/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Execute' })).toBeDisabled();
    expect(screen.getByText(/drag & drop entities from graph/i)).toBeInTheDocument();
  });
});
