/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import AICommandBar from '@/components/layout/AICommandBar';

const defaultProps = {
  quickCommands: [
    {
      id: 'cmd-1',
      prompt: '/find suspicious patterns',
      label: 'Suspicious patterns',
      kind: 'static' as const,
    },
  ],
  status: 'idle' as const,
  statusMessage: 'Known intents are ready.',
  onExecute: () => {},
};

describe('AICommandBar', () => {
  it('renders title, help button, known-intents badge, and status', () => {
    render(<AICommandBar {...defaultProps} />);

    expect(screen.getByText('Command Center')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /command center help/i })).toBeInTheDocument();
    expect(screen.getByText('Known intents')).toBeInTheDocument();
    expect(screen.getByText('Known intents are ready.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Execute' })).toBeDisabled();
  });

  it('hides quick commands by default and shows them on input focus', () => {
    render(<AICommandBar {...defaultProps} />);

    // Not visible before focus
    expect(screen.queryByRole('button', { name: /suspicious patterns/i })).not.toBeInTheDocument();

    fireEvent.focus(screen.getByPlaceholderText(/type a command/i));

    expect(screen.getByRole('button', { name: /suspicious patterns/i })).toBeInTheDocument();
  });

  it('shows tooltip on (?) hover and hides on mouse-leave', () => {
    render(<AICommandBar {...defaultProps} />);

    const helpBtn = screen.getByRole('button', { name: /command center help/i });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(helpBtn);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent(/natural language and slash commands/i);

    fireEvent.mouseLeave(helpBtn);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not render recent commands section', () => {
    render(<AICommandBar {...defaultProps} recentCommands={[]} />);

    expect(screen.queryByText(/recent commands/i)).not.toBeInTheDocument();
  });
});
