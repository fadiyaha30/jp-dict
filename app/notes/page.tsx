import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPersonalNotes } from "@/lib/db";
import PersonalNotesList from "@/components/PersonalNotesList";

export const metadata = { title: "Personal Notes — ファヤの辞書" };

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notes = getPersonalNotes(parseInt(session.user.id));

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Personal Notes
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Phrases and sentences you want to remember from daily life.
          </p>
        </div>
        <PersonalNotesList initial={notes} />
      </div>
    </main>
  );
}
