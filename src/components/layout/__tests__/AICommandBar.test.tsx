/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import AICommandBar from '@/components/layout/AICommandBar';

describe('AICommandBar', () => {
  it('renders a non-functional but intentional command placeholder', () => {
    render(<AICommandBar />);

    expect(screen.getByText('Command center placeholder')).toBeInTheDocument();
    expect(screen.getByText(/future drag-to-prompt workflow/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /command center coming online/i }),
    ).toBeDisabled();
  });
});
