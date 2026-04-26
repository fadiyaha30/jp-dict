import RecorderClient from "@/components/RecorderClient";

export const metadata = { title: "Recorder — ファヤの辞書" };

export default function RecordPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 w-full">
      <RecorderClient />
    </main>
  );
}
