import type { Metadata } from "next";
import KanaClient from "@/components/KanaClient";

export const metadata: Metadata = {
  title: "Kana — ファヤの辞書",
  description: "Hiragana and katakana reference tables",
};

export default function KanaPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6 w-full">
      <h1 className="jp-text text-2xl font-black mb-1" style={{ color: "var(--text)" }}>
        仮名表
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        ひらがな・カタカナ一覧
      </p>
      <KanaClient />
    </main>
  );
}
