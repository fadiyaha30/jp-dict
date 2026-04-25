import SearchBar from "@/components/SearchBar";
import WordCard from "@/components/WordCard";
import { search, isJapanese } from "@/lib/dictionary";
import { deinflect } from "@/lib/deinflect";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; mode?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, mode } = await searchParams;
  const query = q ?? "";
  const searchMode = (mode ?? "auto") as "auto" | "en" | "jp";

  let results: any[] = [];
  let error: string | null = null;
  let deinflectedTo: string | null = null;

  if (query) {
    try {
      results = search(query, searchMode, 24);
      if (results.length === 0 && isJapanese(query)) {
        const candidates = deinflect(query);
        for (const candidate of candidates) {
          const r = search(candidate, "jp", 24);
          if (r.length > 0) {
            results = r;
            deinflectedTo = candidate;
            break;
          }
        }
      }
    } catch {
      error = "Dictionary data not found. Run `npm run setup-data` to download it.";
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col gap-6">
        <SearchBar defaultQuery={query} defaultMode={searchMode} size="md" />

        {error ? (
          <div
            className="rounded-xl p-4 text-sm"
            style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
          >
            {error}
          </div>
        ) : query && results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <p className="text-2xl">🔍</p>
            <p className="font-semibold" style={{ color: "var(--text)" }}>
              No results for &ldquo;{query}&rdquo;
            </p>
            <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
              Try a different word, or switch between EN→JP and JP→EN modes.
            </p>
          </div>
        ) : query ? (
          <>
            {deinflectedTo && (
              <div
                className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
                style={{ background: "var(--accent-pale)", border: "1px solid #c7d2fe", color: "var(--accent)" }}
              >
                <span>Showing results for</span>
                <span className="font-semibold jp-text">{deinflectedTo}</span>
                <span style={{ color: "var(--muted)" }}>(deinflected from &ldquo;{query}&rdquo;)</span>
              </div>
            )}
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{deinflectedTo ?? query}&rdquo;
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map((result) => (
                <WordCard key={result.id} result={result} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
