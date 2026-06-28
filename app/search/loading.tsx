export default function SearchLoading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-6 w-full animate-pulse">
      <div className="h-12 rounded-xl mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
      <div className="flex flex-col gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-6 rounded w-1/4" style={{ background: "var(--subtle)" }} />
                <div className="h-4 rounded w-1/3" style={{ background: "var(--subtle)" }} />
                <div className="h-3 rounded w-2/3" style={{ background: "var(--subtle)" }} />
              </div>
              <div className="h-6 w-10 rounded" style={{ background: "var(--subtle)" }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
