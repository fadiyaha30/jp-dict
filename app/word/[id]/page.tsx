import { notFound } from "next/navigation";
import { Anchor, Breadcrumbs, Stack } from "@mantine/core";
import Link from "next/link";
import WordDetail from "@/components/WordDetail";
import WordHistoryTracker from "@/components/WordHistoryTracker";
import ExampleSentences from "@/components/ExampleSentences";
import { getWordDetail } from "@/lib/dictionary";
import { fetchExamples } from "@/lib/tatoeba";

interface WordPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WordPageProps) {
  const { id } = await params;
  const detail = getWordDetail(id);
  if (!detail) return { title: "Word not found" };
  return {
    title: `${detail.result.kanji} — JDict`,
    description: detail.result.meanings.join(", "),
  };
}

export default async function WordPage({ params }: WordPageProps) {
  const { id } = await params;
  const detail = getWordDetail(id);
  if (!detail) notFound();

  const { word, result } = detail;

  // Fetch examples using kanji form if available, else kana
  const searchWord = result.kanji !== result.reading ? result.kanji : result.reading;
  const examples = await fetchExamples(searchWord, 5);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Stack gap="xl">
        <Breadcrumbs>
          <Anchor component={Link} href="/" size="sm">Home</Anchor>
          <Anchor component={Link} href="/search" size="sm">Search</Anchor>
          <span className="jp-text" style={{ fontSize: "0.875rem" }}>{result.kanji}</span>
        </Breadcrumbs>

        <WordHistoryTracker
          id={result.id}
          kanji={result.kanji}
          reading={result.reading}
          meaning={result.meanings[0] ?? ""}
        />

        <WordDetail word={word} result={result} />

        <ExampleSentences examples={examples} word={searchWord} />
      </Stack>
    </main>
  );
}
