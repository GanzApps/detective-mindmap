'use client';

const QUICK_COMMANDS = [
  '/find suspicious patterns',
  '/show top connected entities',
  '/highlight financial relationships',
  '/trace movement path',
];

export default function AICommandBar() {
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
          {QUICK_COMMANDS.map((command) => (
            <button
              key={command}
              type="button"
              className="rounded-shell-pill border border-shell-border bg-shell-surface-raised px-4 py-2 text-sm text-shell-text-secondary transition hover:border-shell-border-strong hover:text-shell-text-primary"
            >
              {command}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-shell-sm px-shell-md py-shell-md lg:flex-row lg:items-center">
        <div className="flex min-h-14 flex-1 items-center rounded-shell-lg border border-shell-accent/35 bg-shell-accent-muted px-shell-md text-sm text-shell-text-secondary">
          Enter a command or drag entities here to route into known workspace actions.
        </div>
        <button
          type="button"
          disabled
          className="rounded-shell-lg bg-shell-accent px-shell-lg py-shell-sm text-sm font-semibold text-shell-accent-fg opacity-50"
        >
          Execute
        </button>
      </div>

      <div className="flex flex-wrap gap-shell-md px-shell-md pb-shell-md text-xs text-shell-text-muted">
        <span>Command Center Active</span>
        <span>Drag &amp; drop entities from graph</span>
        <span>Use / for commands</span>
      </div>
    </section>
  );
}
