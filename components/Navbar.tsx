import Link from "next/link";
import { Group, Text } from "@mantine/core";

export default function Navbar() {
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <Group justify="space-between" align="center">
          <Link href="/" style={{ textDecoration: "none" }}>
            <Group gap="xs" align="center">
              <Text
                size="xl"
                fw={700}
                style={{ color: "#1D9E75", letterSpacing: "-0.02em" }}
              >
                辞
              </Text>
              <Text fw={600} size="lg" c="dark">
                JDict
              </Text>
            </Group>
          </Link>
          <Text size="xs" c="dimmed">
            English–Japanese Dictionary
          </Text>
        </Group>
      </div>
    </header>
  );
}
