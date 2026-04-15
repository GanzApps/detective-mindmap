'use client';

import { useEffect, useRef, useState } from 'react';
import { type QuickCommandSuggestion } from '@/lib/ai/knownIntents';

export default function AICommandBar({
  quickCommands,
  status,
  statusMessage,
  onExecute,
}: {
  quickCommands: QuickCommandSuggestion[];
  /** @deprecated — no longer rendered */
  recentCommands?: unknown[];
  status: 'idle' | 'running' | 'complete' | 'failed';
  statusMessage: string;
  onExecute: (command: string) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === 'complete') {
      setInputValue('');
    }
  }, [status]);

  function handleSubmit() {
    if (!inputValue.trim()) return;
    onExecute(inputValue);
  }

  function handleInputFocus() {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    setInputFocused(true);
  }

  function handleInputBlur() {
    // Short delay so quick-command button clicks register before hiding
    blurTimerRef.current = setTimeout(() => setInputFocused(false), 150);
  }

  const statusTone = status === 'failed'
    ? 'border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-300'
    : status === 'complete'
      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
      : status === 'running'
        ? 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300'
        : 'border-shell-border bg-shell-surface-raised text-shell-text-secondary';

  return (
    <section className="border-t border-shell-border bg-shell-surface">

      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-3 py-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.22em] text-shell-text-muted">
          Command Center
        </span>

        {/* (?) help */}
        <div className="relative">
          <button
            type="button"
            aria-label="Command center help"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            onFocus={() => setTooltipVisible(true)}
            onBlur={() => setTooltipVisible(false)}
            className="flex h-4 w-4 items-center justify-center rounded-full border border-shell-border bg-shell-surface-raised text-[9px] font-bold text-shell-text-muted transition hover:border-shell-accent/40 hover:text-shell-accent"
          >
            ?
          </button>
          {tooltipVisible && (
            <div
              role="tooltip"
              className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-lg border border-shell-border bg-shell-surface px-3 py-2 text-xs text-shell-text-secondary shadow-shell-lg"
            >
              Natural language and slash commands to investigate the graph. Focus the input to see available quick commands.
            </div>
          )}
        </div>

        <div className="flex-1" />

        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
          Known intents
        </span>
      </div>

      {/* ── Quick commands — visible only when input is focused ── */}
      {inputFocused && quickCommands.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-shell-border px-3 py-2">
          {quickCommands.map((command) => (
            <button
              key={command.id}
              type="button"
              onMouseDown={(e) => {
                // Prevent blur before click fires
                e.preventDefault();
                setInputValue(command.prompt);
                onExecute(command.prompt);
                setInputFocused(false);
              }}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                command.kind === 'context'
                  ? 'border-shell-accent/30 bg-shell-accent-muted text-shell-text-primary hover:border-shell-accent'
                  : 'border-shell-border bg-shell-surface-raised text-shell-text-secondary hover:border-shell-border-strong hover:text-shell-text-primary'
              }`}
            >
              {command.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input row ── */}
      <div className="flex items-center gap-2 border-t border-shell-border px-3 py-2">
        <label className="flex flex-1 items-center rounded-lg border border-shell-accent/35 bg-shell-accent-muted px-3 py-1.5">
          <span className="sr-only">Investigation command input</span>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
            }}
            placeholder="Type a command or /action…"
            className="w-full bg-transparent text-sm text-shell-text-primary outline-none placeholder:text-shell-text-muted"
          />
        </label>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={status === 'running' || !inputValue.trim()}
          className="rounded-lg bg-shell-accent px-4 py-1.5 text-sm font-semibold text-shell-accent-fg transition disabled:opacity-50"
        >
          {status === 'running' ? 'Running…' : 'Execute'}
        </button>
      </div>

      {/* ── Status ── */}
      <div className={`mx-3 mb-2 rounded-lg border px-3 py-1.5 text-xs ${statusTone}`}>
        {statusMessage}
      </div>
    </section>
  );
}
