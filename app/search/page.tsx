import { SimpleGrid, Stack, Text, Alert } from "@mantine/core";
import Navbar from "@/components/Navbar";
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

  let results = [];
  let error: string | null = null;

  if (query) {
    try {
      results = search(query, searchMode, 20);
    } catch (e) {
      error =
        "Dictionary data not found. Run `npm run setup-data` to download it.";
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Stack gap="xl">
          {/* Search bar */}
          <SearchBar defaultQuery={query} defaultMode={searchMode} size="md" />

          {/* Results */}
          {error ? (
            <Alert color="red" title="Data missing">
              {error}
            </Alert>
          ) : query && results.length === 0 ? (
            <Stack align="center" py="xl" gap="sm">
              <Text size="2rem">🔍</Text>
              <Text fw={600}>No results for "{query}"</Text>
              <Text size="sm" c="dimmed">
                Try a different word, or switch between EN→JP and JP→EN modes.
              </Text>
            </Stack>
          ) : query ? (
            <>
              <Text size="sm" c="dimmed">
                {results.length} result{results.length !== 1 ? "s" : ""} for "
                {query}"
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {results.map((result) => (
                  <WordCard key={result.id} result={result} />
                ))}
              </SimpleGrid>
            </>
          ) : null}
        </Stack>
      </main>
    </div>
  );
}
