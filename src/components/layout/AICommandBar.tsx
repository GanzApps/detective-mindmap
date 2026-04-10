'use client';

export default function AICommandBar() {
  return (
    <section className="rounded-shell-xl border border-shell-accent/20 bg-shell-surface shadow-shell-sm">
      <div className="flex flex-col gap-shell-sm px-shell-md py-shell-md xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-shell-text-muted">
            AICommandBar
          </p>
          <h2 className="mt-2 text-lg font-semibold text-shell-text-primary">Command center placeholder</h2>
        </div>
        <div className="rounded-shell-pill border border-emerald-500/20 bg-emerald-500/10 px-shell-sm py-1 text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Future capability
        </div>
      </div>

      <div className="flex flex-col gap-shell-sm px-shell-md pb-shell-md lg:flex-row">
        <div className="flex min-h-14 flex-1 items-center rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md text-sm text-shell-text-muted">
          Enter command or drag entities here for AI-assisted pattern tracing, summaries, and follow-up prompts.
        </div>
        <button
          type="button"
          disabled
          className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm text-sm font-semibold text-shell-text-muted opacity-60"
        >
          Command Center Coming Online
        </button>
      </div>

      <div className="flex flex-wrap gap-shell-sm px-shell-md pb-shell-md text-xs text-shell-text-muted">
        <span>Intentional placeholder only</span>
        <span>Slash-command surface reserved</span>
        <span>Future drag-to-prompt workflow</span>
      </div>
    </section>
  );
}
