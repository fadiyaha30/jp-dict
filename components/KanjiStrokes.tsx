interface KanjiStrokeEntry {
  char: string;
  svg: string;
}

interface KanjiStrokesProps {
  chars: KanjiStrokeEntry[];
}

export default function KanjiStrokes({ chars }: KanjiStrokesProps) {
  if (chars.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          この項目に漢字がありません。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        数字は筆順を示します。番号順に書いてください。
      </p>
      <div className="flex flex-wrap gap-6">
        {chars.map(({ char, svg }) => (
          <div
            key={char}
            className="flex flex-col items-center gap-3 rounded-2xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <span
              className="jp-text font-bold text-xl"
              style={{ color: "var(--text)" }}
            >
              {char}
            </span>
            <div
              style={{ width: "min(160px, calc(100vw - 7rem))", height: "min(160px, calc(100vw - 7rem))" }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
