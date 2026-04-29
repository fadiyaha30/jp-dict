import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { getPersonalNotes } from "@/lib/db";
import PersonalNotesList from "@/components/PersonalNotesList";

export const metadata = { title: "Personal Notes — ファヤの辞書" };

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function NotesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tab = "all" } = await searchParams;
  const notes = getPersonalNotes(parseInt(session.user.id));

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Personal Notes
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Phrases and sentences you want to remember.
          </p>
        </div>
        <Suspense><PersonalNotesList initial={notes} initialTab={tab} /></Suspense>
      </div>
    </main>
  );
}
