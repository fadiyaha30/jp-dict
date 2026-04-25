export interface KanjiEntry {
  text: string;
  tags: string[];
}

export interface KanaEntry {
  text: string;
  tags: string[];
  appliesToKanji: string[];
}

export interface SenseExample {
  text: string;
  sentences: { lang: string; text: string }[];
}

export interface Sense {
  partOfSpeech: string[];
  gloss: string[];
  examples: SenseExample[];
  tags: string[];
  misc: string[];
  info: string[];
}

export interface DictWord {
  id: string;
  kanji: KanjiEntry[];
  kana: KanaEntry[];
  sense: Sense[];
}

export interface DictData {
  version: string;
  dictDate: string;
  words: DictWord[];
}

export interface SearchResult {
  id: string;
  kanji: string;
  reading: string;
  romaji: string;
  meanings: string[];
  partOfSpeech: string[];
  jlpt: string | null;
}
