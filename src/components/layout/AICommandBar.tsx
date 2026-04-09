'use client';

export default function AICommandBar() {
  return (
    <section className="rounded-[1.75rem] border border-fuchsia-500/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(9,12,24,0.96))] px-5 py-4 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-300/70">
            AICommandBar
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-50">Command center placeholder</h2>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-100">
          Future capability
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row">
        <div className="flex min-h-14 flex-1 items-center rounded-[1.25rem] border border-slate-800 bg-slate-950/80 px-4 text-sm text-slate-400">
          Enter command or drag entities here for AI-assisted pattern tracing, summaries, and follow-up prompts.
        </div>
        <button
          type="button"
          disabled
          className="rounded-[1.25rem] border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-500"
        >
          Command Center Coming Online
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span>Intentional placeholder only</span>
        <span>Slash-command surface reserved</span>
        <span>Future drag-to-prompt workflow</span>
      </div>
    </section>
  );
}
