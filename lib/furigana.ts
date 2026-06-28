import "server-only";

// Singleton — kuroshiro loads the kuromoji dictionary (~20MB) once on first use.
// Using a promise so concurrent calls share the same initialization.
let initPromise: Promise<any> | null = null;

function getKuroshiro() {
  if (!initPromise) {
    initPromise = (async () => {
      const { default: Kuroshiro } = await import("kuroshiro");
      const { default: KuromojiAnalyzer } = await import("kuroshiro-analyzer-kuromoji");
      const k = new Kuroshiro();
      await k.init(new KuromojiAnalyzer());
      return k;
    })().catch((err) => {
      // Reset so the next call retries instead of using a failed promise
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

/**
 * Converts a Japanese string to HTML with <ruby> furigana tags.
 * Falls back to the original plain text if kuroshiro fails.
 *
 * Example output:
 *   <ruby>靴<rt>くつ</rt></ruby>を<ruby>履<rt>は</rt></ruby>いてください。
 */
export function warmFurigana(): void {
  getKuroshiro();
}

export async function toFurigana(text: string): Promise<string> {
  try {
    const k = await getKuroshiro();
    return await k.convert(text, { mode: "furigana", to: "hiragana" });
  } catch {
    return text;
  }
}
