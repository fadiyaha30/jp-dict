import SearchBar from "@/components/SearchBar";
import WordCard from "@/components/WordCard";
import { search } from "@/lib/dictionary";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; mode?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, mode } = await searchParams;
  const query = q ?? "";
  const searchMode = (mode ?? "auto") as "auto" | "en" | "jp";

  let results: any[] = [];
  let error: string | null = null;

  if (query) {
    try {
      results = search(query, searchMode, 20);
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
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
          >
            {error}
          </div>
        ) : query && results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <span style={{ fontSize: "2.5rem", filter: "grayscale(0.3)" }}>🔍</span>
            <p className="font-semibold text-white/80">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-sm text-white/40 text-center">
              Try a different word, or switch between EN→JP and JP→EN modes.
            </p>
          </div>
        ) : query ? (
          <>
            <p className="text-sm" style={{ color: "rgba(29,158,117,0.7)" }}>
              {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
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
