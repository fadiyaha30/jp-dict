import type { ConjugationTable } from "@/lib/conjugation";

export default function Conjugation({ table }: { table: ConjugationTable }) {
  return (
    <div className="flex flex-col gap-5">
      <span
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "#1D9E75" }}
      >
        {table.verbType}
      </span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {table.groups.map((group) => (
          <div key={group.title}>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {group.title}
            </p>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(29,158,117,0.1)" }}
            >
              {group.rows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{
                    background: i % 2 === 0
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(29,158,117,0.03)",
                  }}
                >
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {row.label}
                  </span>
                  <span className="jp-text font-medium" style={{ color: "rgba(255,255,255,0.88)" }}>
                    {row.kana}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
