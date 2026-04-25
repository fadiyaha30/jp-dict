import Link from "next/link";
import { Stack, Text, Button } from "@mantine/core";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      
      <main className="max-w-2xl mx-auto px-4 py-16">
        <Stack align="center" gap="lg">
          <Text size="4rem" className="jp-text" style={{ color: "#1D9E75" }}>
            見つからない
          </Text>
          <Text fw={600} size="xl">
            Page not found
          </Text>
          <Text c="dimmed" ta="center">
            That word or page doesn't exist. Head back and try a new search.
          </Text>
          <Button component={Link} href="/" color="green" radius="xl">
            Back to Home
          </Button>
        </Stack>
      </main>
    </div>
  );
}
