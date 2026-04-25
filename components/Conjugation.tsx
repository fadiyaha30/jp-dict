import type { ConjugationTable } from "@/lib/conjugation";

export default function Conjugation({ table }: { table: ConjugationTable }) {
  return (
    <div className="space-y-6">
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1D9E75" }}>
        {table.verbType}
      </span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {table.groups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              {group.title}
            </p>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {group.rows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: i % 2 === 1 ? "#f9fafb" : "white" }}
                >
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="jp-text font-medium text-gray-900">{row.kana}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
