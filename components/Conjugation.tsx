import type { ConjugationTable } from "@/lib/conjugation";

export default function Conjugation({ table }: { table: ConjugationTable }) {
  return (
    <div className="flex flex-col gap-5">
      <span
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--accent)" }}
      >
        {table.verbType}
      </span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {table.groups.map((group) => (
          <div key={group.title}>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--muted)" }}
            >
              {group.title}
            </p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              {group.rows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--subtle)" }}
                >
                  <span className="text-sm" style={{ color: "var(--muted)" }}>{row.label}</span>
                  <span className="jp-text font-medium" style={{ color: "var(--text)" }}>{row.kana}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
