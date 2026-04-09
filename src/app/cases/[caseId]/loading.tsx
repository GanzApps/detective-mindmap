export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-24 rounded-3xl border border-slate-800 bg-slate-900/70" />
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="h-[640px] rounded-3xl border border-slate-800 bg-slate-900/70" />
          <div className="h-[640px] rounded-3xl border border-slate-800 bg-slate-900/70" />
        </div>
      </div>
    </main>
  );
}
