'use client';

import { useEffect, useState } from 'react';
import { type CommandHistoryEntry, type QuickCommandSuggestion } from '@/lib/ai/knownIntents';

export default function AICommandBar({
  quickCommands,
  recentCommands,
  status,
  statusMessage,
  onExecute,
}: {
  quickCommands: QuickCommandSuggestion[];
  recentCommands: CommandHistoryEntry[];
  status: 'idle' | 'running' | 'complete' | 'failed';
  statusMessage: string;
  onExecute: (command: string) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (status === 'complete') {
      setInputValue('');
    }
  }, [status]);

  function handleSubmit() {
    if (!inputValue.trim()) {
      return;
    }

    onExecute(inputValue);
  }

  const statusTone = status === 'failed'
    ? 'border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-300'
    : status === 'complete'
      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
      : status === 'running'
        ? 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300'
        : 'border-shell-border bg-shell-surface-raised text-shell-text-secondary';

  return (
    <section className="rounded-shell-xl border border-shell-border bg-shell-surface shadow-shell-sm">
      <div className="border-b border-shell-border px-shell-md py-shell-md">
        <div className="flex flex-wrap items-center justify-between gap-shell-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-shell-text-muted">
              Quick Commands
            </p>
            <h2 className="mt-2 text-lg font-semibold text-shell-text-primary">
              Investigation command center
            </h2>
          </div>
          <span className="rounded-shell-pill border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            Known intents
          </span>
        </div>

        <div className="mt-shell-md flex flex-wrap gap-shell-sm">
          {quickCommands.map((command) => (
            <button
              key={command.id}
              type="button"
              onClick={() => {
                setInputValue(command.prompt);
                onExecute(command.prompt);
              }}
              className={`rounded-shell-pill border px-4 py-2 text-sm transition ${
                command.kind === 'context'
                  ? 'border-shell-accent/30 bg-shell-accent-muted text-shell-text-primary hover:border-shell-accent'
                  : 'border-shell-border bg-shell-surface-raised text-shell-text-secondary hover:border-shell-border-strong hover:text-shell-text-primary'
              }`}
            >
              {command.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-shell-md py-shell-md">
        <div className="flex flex-col gap-shell-sm lg:flex-row lg:items-center">
          <label className="flex min-h-14 flex-1 items-center rounded-shell-lg border border-shell-accent/35 bg-shell-accent-muted px-shell-md">
            <span className="sr-only">Investigation command input</span>
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Enter a command or ask for an investigation action (e.g. /find suspicious patterns)"
              className="w-full bg-transparent text-sm text-shell-text-primary outline-none placeholder:text-shell-text-muted"
            />
          </label>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === 'running' || !inputValue.trim()}
            className="rounded-shell-lg bg-shell-accent px-shell-lg py-shell-sm text-sm font-semibold text-shell-accent-fg transition disabled:opacity-50"
          >
            {status === 'running' ? 'Running…' : 'Execute'}
          </button>
        </div>

        <div className={`mt-shell-sm rounded-shell-lg border px-4 py-3 text-sm ${statusTone}`}>
          {statusMessage}
        </div>

        {recentCommands.length > 0 ? (
          <div className="mt-shell-md">
            <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">Recent commands</p>
            <div className="mt-3 flex flex-wrap gap-shell-sm">
              {recentCommands.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-shell-pill border border-shell-border bg-shell-surface-raised px-3 py-2 text-xs text-shell-text-secondary"
                >
                  <span className="font-medium text-shell-text-primary">{entry.label}</span>
                  <span className="mx-2 text-shell-text-muted">•</span>
                  <span>{entry.timestampLabel}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-shell-md px-shell-md pb-shell-md text-xs text-shell-text-muted">
        <span>Command Center Active</span>
        <span>Natural language and slash commands</span>
        <span>Results route into the analysis panel</span>
      </div>
    </section>
  );
}
