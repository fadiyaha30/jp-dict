declare module 'kuroshiro' {
  interface KuroshiroOptions {
    mode?: string;
    to?: string;
    romajiSystem?: string;
  }

  class Kuroshiro {
    init(analyzer: unknown): Promise<void>;
    convert(text: string, options?: KuroshiroOptions): Promise<string>;
    static Util: {
      isHiragana(ch: string): boolean;
      isKatakana(ch: string): boolean;
      isKana(ch: string): boolean;
      isKanji(ch: string): boolean;
      isJapanese(ch: string): boolean;
      hasHiragana(str: string): boolean;
      hasKatakana(str: string): boolean;
      hasKana(str: string): boolean;
      hasKanji(str: string): boolean;
      hasJapanese(str: string): boolean;
    };
  }

  export = Kuroshiro;
}

declare module 'kuroshiro-analyzer-kuromoji' {
  class KuromojiAnalyzer {
    constructor(options?: { dictPath?: string });
  }
  export = KuromojiAnalyzer;
}
