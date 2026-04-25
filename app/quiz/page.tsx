import QuizClient from "@/components/QuizClient";

export const metadata = { title: "Quiz — ファヤの辞書" };

export default function QuizPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8 w-full">
      <QuizClient />
    </main>
  );
}
