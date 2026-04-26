import grammarData from "@/data/grammar.json";

export interface GrammarExample {
  japanese: string;
  english: string;
  note?: string;
}

export interface GrammarPoint {
  id: string;
  pattern: string;
  meaning: string;
  jlpt: string;
  structure: string;
  examples: GrammarExample[];
  notes?: string;
  related?: string[];
}

const ALL_GRAMMAR: GrammarPoint[] = grammarData as GrammarPoint[];

export function getAllGrammar(): GrammarPoint[] {
  return ALL_GRAMMAR;
}

export function getGrammarById(id: string): GrammarPoint | undefined {
  return ALL_GRAMMAR.find((g) => g.id === id);
}

export function searchGrammar(query: string, jlpt?: string): GrammarPoint[] {
  const q = query.trim().toLowerCase();

  const score = (g: GrammarPoint): number => {
    const pattern = g.pattern.toLowerCase();
    // Exact pattern match
    if (pattern === q || g.pattern === query) return 100;
    // Pattern starts with query (e.g. "つもり" matches "〜つもり")
    if (pattern.startsWith(q) || pattern.includes(`〜${q}`) || pattern.includes(`～${q}`)) return 80;
    // Pattern contains query anywhere
    if (pattern.includes(q)) return 60;
    // Meaning match
    if (g.meaning.toLowerCase().includes(q)) return 40;
    // Structure match
    if (g.structure.toLowerCase().includes(q)) return 20;
    // Example Japanese match
    if (g.examples.some((ex) => ex.japanese.includes(query))) return 15;
    // Example English or notes match
    if (
      (g.notes?.toLowerCase().includes(q) ?? false) ||
      g.examples.some((ex) => ex.english.toLowerCase().includes(q))
    ) return 10;
    return 0;
  };

  return ALL_GRAMMAR
    .filter((g) => {
      const matchesJlpt = !jlpt || jlpt === "all" || g.jlpt === jlpt;
      return matchesJlpt && (!q || score(g) > 0);
    })
    .sort((a, b) => score(b) - score(a));
}

export function getGrammarByLevel(jlpt: string): GrammarPoint[] {
  return ALL_GRAMMAR.filter((g) => g.jlpt === jlpt);
}

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
