import Link from "next/link";
import { Stack, Text, Button } from "@mantine/core";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <Stack align="center" gap="lg">
        <Text size="4rem" className="jp-text" style={{ color: "#1D9E75" }}>
          見つからない
        </Text>
        <Text fw={600} size="xl">ページが見つかりません</Text>
        <Text c="dimmed" ta="center">
          そのページまたは単語は見つかりません。検索し直してみてください。
        </Text>
        <Button component={Link} href="/" color="green" radius="xl">
          ホームへ戻る
        </Button>
      </Stack>
    </main>
  );
}
