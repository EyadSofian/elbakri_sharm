export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16" aria-busy="true">
      <div className="h-[42vh] w-full animate-pulse rounded-2xl bg-ice" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-[20px] bg-white shadow-card">
            <div className="aspect-[10/7] bg-ice" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-3/4 rounded bg-ice" />
              <div className="h-4 w-1/2 rounded bg-ice" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">جارٍ التحميل…</span>
    </div>
  );
}
