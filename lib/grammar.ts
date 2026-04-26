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
  return ALL_GRAMMAR.filter((g) => {
    const matchesJlpt = !jlpt || jlpt === "all" || g.jlpt === jlpt;
    if (!matchesJlpt) return false;
    if (!q) return true;
    return (
      g.pattern.toLowerCase().includes(q) ||
      g.meaning.toLowerCase().includes(q) ||
      g.structure.toLowerCase().includes(q) ||
      (g.notes?.toLowerCase().includes(q) ?? false) ||
      g.examples.some(
        (ex) =>
          ex.japanese.includes(query) ||
          ex.english.toLowerCase().includes(q)
      )
    );
  });
}

export function getGrammarByLevel(jlpt: string): GrammarPoint[] {
  return ALL_GRAMMAR.filter((g) => g.jlpt === jlpt);
}

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
