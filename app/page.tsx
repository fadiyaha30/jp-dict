import { Stack, Text } from "@mantine/core";
import SearchBar from "@/components/SearchBar";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Stack gap="xl" align="center" w="100%" maw={600}>
          {/* Logo / hero */}
          <Stack gap="sm" align="center">
            <Text
              size="5rem"
              fw={700}
              className="jp-text"
              style={{ color: "#1D9E75", lineHeight: 1 }}
            >
              辞書
            </Text>
            <Text size="xl" fw={600} c="dark">
              English–Japanese Dictionary
            </Text>
            <Text size="sm" c="dimmed" ta="center" maw={400}>
              Search in English or Japanese. Includes readings, romaji, JLPT
              levels, and example sentences.
            </Text>
          </Stack>

          {/* Search */}
          <div className="w-full">
            <SearchBar size="lg" />
          </div>

          {/* Quick examples */}
          <Text size="xs" c="dimmed" ta="center">
            Try:{" "}
            {["water", "食べる", "beautiful", "東京", "travel"].map((t, i) => (
              <a
                key={t}
                href={`/search?q=${encodeURIComponent(t)}&mode=auto`}
                className="text-[#1D9E75] hover:underline"
              >
                {t}
                {i < 4 ? " · " : ""}
              </a>
            ))}
          </Text>
        </Stack>
      </main>
    </div>
  );
}
