export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-10 w-72 rounded-full bg-slate-800/80" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-56 rounded-3xl border border-slate-800 bg-slate-900/70"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
