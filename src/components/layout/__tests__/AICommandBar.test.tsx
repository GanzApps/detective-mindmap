/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import AICommandBar from '@/components/layout/AICommandBar';

describe('AICommandBar', () => {
  it('renders the known-intent command surface with quick commands and status', () => {
    render(
      <AICommandBar
        quickCommands={[
          {
            id: 'cmd-1',
            prompt: '/find suspicious patterns',
            label: 'Suspicious patterns',
            kind: 'static',
          },
        ]}
        recentCommands={[]}
        status="idle"
        statusMessage="Known intents are ready."
        onExecute={() => {}}
      />,
    );

    expect(screen.getByText('Investigation command center')).toBeInTheDocument();
    expect(screen.getByText('Known intents')).toBeInTheDocument();
    expect(screen.getByText('Known intents are ready.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suspicious patterns/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Execute' })).toBeDisabled();
    expect(screen.getByText(/natural language and slash commands/i)).toBeInTheDocument();
  });
});
