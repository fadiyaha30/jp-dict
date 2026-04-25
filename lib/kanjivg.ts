const KANJIVG_BASE =
  "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";

function isKanji(char: string): boolean {
  const cp = char.codePointAt(0)!;
  return (
    (cp >= 0x4e00 && cp <= 0x9fff) ||   // CJK Unified Ideographs
    (cp >= 0x3400 && cp <= 0x4dbf) ||   // CJK Extension A
    (cp >= 0x20000 && cp <= 0x2a6df)    // CJK Extension B
  );
}

export function extractKanji(text: string): string[] {
  return [...new Set([...text].filter(isKanji))];
}

export async function fetchKanjiSvg(char: string): Promise<string | null> {
  const cp = char.codePointAt(0)!;
  const hex = cp.toString(16).padStart(5, "0");
  try {
    const res = await fetch(`${KANJIVG_BASE}/${hex}.svg`, {
      next: { revalidate: 60 * 60 * 24 * 30 }, // cache 30 days
    });
    if (!res.ok) return null;
    const raw = await res.text();
    // Strip XML declaration + DTD (everything before <svg) to avoid ]> artifact in HTML
    const svgOnly = raw.slice(raw.indexOf("<svg"));
    // Restyle: use accent color for strokes, keep gray for numbers
    return svgOnly
      .replace(/stroke:#000000/g, "stroke:#4f46e5")
      .replace(/stroke-width:3/g, "stroke-width:3.5")
      .replace(/fill:#808080/g, "fill:#9ca3af")
      // Make it scale cleanly inside any container
      .replace(/width="109"/, 'width="100%"')
      .replace(/height="109"/, 'height="100%"');
  } catch {
    return null;
  }
}
