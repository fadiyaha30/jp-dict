import { notFound } from "next/navigation";
import { Anchor, Breadcrumbs, Stack } from "@mantine/core";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import WordDetail from "@/components/WordDetail";
import { getWordDetail } from "@/lib/dictionary";

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

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Stack gap="xl">
          <Breadcrumbs>
            <Anchor component={Link} href="/" size="sm">
              Home
            </Anchor>
            <Anchor component={Link} href="/search" size="sm">
              Search
            </Anchor>
            <span className="jp-text" style={{ fontSize: "0.875rem" }}>
              {result.kanji}
            </span>
          </Breadcrumbs>

          <WordDetail word={word} result={result} />
        </Stack>
      </main>
    </div>
  );
}
