export interface ConjugationRow {
  label: string;
  kana: string;
}

export interface ConjugationGroup {
  title: string;
  rows: ConjugationRow[];
}

export interface ConjugationTable {
  verbType: string;
  groups: ConjugationGroup[];
}

// Godan row mappings: i-row (masu stem), a-row (nai stem), te/ta forms, e-row (potential/conditional), o-row (volitional)
const GODAN: Record<string, { i: string; a: string; te: string; ta: string; e: string; o: string }> = {
  'く': { i: 'き', a: 'か', te: 'いて', ta: 'いた', e: 'け', o: 'こ' },
  'ぐ': { i: 'ぎ', a: 'が', te: 'いで', ta: 'いだ', e: 'げ', o: 'ご' },
  'す': { i: 'し', a: 'さ', te: 'して', ta: 'した', e: 'せ', o: 'そ' },
  'つ': { i: 'ち', a: 'た', te: 'って', ta: 'った', e: 'て', o: 'と' },
  'ぬ': { i: 'に', a: 'な', te: 'んで', ta: 'んだ', e: 'ね', o: 'の' },
  'ぶ': { i: 'び', a: 'ば', te: 'んで', ta: 'んだ', e: 'べ', o: 'ぼ' },
  'む': { i: 'み', a: 'ま', te: 'んで', ta: 'んだ', e: 'め', o: 'も' },
  'る': { i: 'り', a: 'ら', te: 'って', ta: 'った', e: 'れ', o: 'ろ' },
  'う': { i: 'い', a: 'わ', te: 'って', ta: 'った', e: 'え', o: 'お' },
};

function ichidan(reading: string): ConjugationTable {
  const stem = reading.endsWith('る') ? reading.slice(0, -1) : reading;
  return {
    verbType: 'Ichidan verb (一段動詞)',
    groups: [
      {
        title: 'Basic',
        rows: [
          { label: 'Dictionary', kana: reading },
          { label: 'Polite', kana: stem + 'ます' },
          { label: 'Negative', kana: stem + 'ない' },
          { label: 'Te-form', kana: stem + 'て' },
          { label: 'Past', kana: stem + 'た' },
          { label: 'Past polite', kana: stem + 'ました' },
          { label: 'Past negative', kana: stem + 'なかった' },
        ],
      },
      {
        title: 'Extended',
        rows: [
          { label: 'Want to (たい)', kana: stem + 'たい' },
          { label: 'Volitional', kana: stem + 'よう' },
          { label: 'Potential', kana: stem + 'られる' },
          { label: 'Passive', kana: stem + 'られる' },
          { label: 'Causative', kana: stem + 'させる' },
          { label: 'Conditional', kana: stem + 'れば' },
          { label: 'Imperative', kana: stem + 'ろ' },
        ],
      },
    ],
  };
}

function godanVerb(reading: string, rawPos: string[]): ConjugationTable {
  const lastChar = reading.slice(-1);
  const base = reading.slice(0, -1);
  const g = GODAN[lastChar];

  if (!g) {
    return { verbType: 'Godan verb (五段動詞)', groups: [{ title: 'Basic', rows: [{ label: 'Dictionary', kana: reading }] }] };
  }

  const isIku = rawPos.includes('v5k-s'); // 行く: te-form is って, not いて
  const isAru = rawPos.includes('v5r-i'); // ある: negative is ない, not あらない

  const te = isIku ? 'って' : g.te;
  const ta = isIku ? 'った' : g.ta;
  const nai = isAru ? 'ない' : base + g.a + 'ない';
  const pastNeg = isAru ? 'なかった' : base + g.a + 'なかった';

  return {
    verbType: 'Godan verb (五段動詞)',
    groups: [
      {
        title: 'Basic',
        rows: [
          { label: 'Dictionary', kana: reading },
          { label: 'Polite', kana: base + g.i + 'ます' },
          { label: 'Negative', kana: nai },
          { label: 'Te-form', kana: base + te },
          { label: 'Past', kana: base + ta },
          { label: 'Past polite', kana: base + g.i + 'ました' },
          { label: 'Past negative', kana: pastNeg },
        ],
      },
      {
        title: 'Extended',
        rows: [
          { label: 'Want to (たい)', kana: base + g.i + 'たい' },
          { label: 'Volitional', kana: base + g.o + 'う' },
          { label: 'Potential', kana: base + g.e + 'る' },
          { label: 'Passive', kana: isAru ? '—' : base + g.a + 'れる' },
          { label: 'Causative', kana: base + g.a + 'せる' },
          { label: 'Conditional', kana: base + g.e + 'ば' },
          { label: 'Imperative', kana: base + g.e },
        ],
      },
    ],
  };
}

function kuru(): ConjugationTable {
  return {
    verbType: 'Irregular verb (来る)',
    groups: [
      {
        title: 'Basic',
        rows: [
          { label: 'Dictionary', kana: 'くる' },
          { label: 'Polite', kana: 'きます' },
          { label: 'Negative', kana: 'こない' },
          { label: 'Te-form', kana: 'きて' },
          { label: 'Past', kana: 'きた' },
          { label: 'Past polite', kana: 'きました' },
          { label: 'Past negative', kana: 'こなかった' },
        ],
      },
      {
        title: 'Extended',
        rows: [
          { label: 'Want to (たい)', kana: 'きたい' },
          { label: 'Volitional', kana: 'こよう' },
          { label: 'Potential', kana: 'こられる' },
          { label: 'Passive', kana: 'こられる' },
          { label: 'Causative', kana: 'こさせる' },
          { label: 'Conditional', kana: 'くれば' },
          { label: 'Imperative', kana: 'こい' },
        ],
      },
    ],
  };
}

function suru(reading: string): ConjugationTable {
  const prefix = reading.endsWith('する') ? reading.slice(0, -2) : '';
  const s = (form: string) => prefix + form;

  return {
    verbType: prefix ? 'Suru compound verb (〜する)' : 'Irregular verb (する)',
    groups: [
      {
        title: 'Basic',
        rows: [
          { label: 'Dictionary', kana: reading },
          { label: 'Polite', kana: s('します') },
          { label: 'Negative', kana: s('しない') },
          { label: 'Te-form', kana: s('して') },
          { label: 'Past', kana: s('した') },
          { label: 'Past polite', kana: s('しました') },
          { label: 'Past negative', kana: s('しなかった') },
        ],
      },
      {
        title: 'Extended',
        rows: [
          { label: 'Want to (たい)', kana: s('したい') },
          { label: 'Volitional', kana: s('しよう') },
          { label: 'Potential', kana: prefix ? prefix + 'できる' : 'できる' },
          { label: 'Passive', kana: s('される') },
          { label: 'Causative', kana: s('させる') },
          { label: 'Conditional', kana: s('すれば') },
          { label: 'Imperative', kana: s('しろ') },
        ],
      },
    ],
  };
}

function iAdj(reading: string, isIrregular: boolean): ConjugationTable {
  // adj-ix (いい/よい): stem is よ regardless of reading
  const stem = isIrregular ? 'よ' : reading.endsWith('い') ? reading.slice(0, -1) : reading;

  return {
    verbType: 'い-adjective (形容詞)',
    groups: [
      {
        title: 'Plain',
        rows: [
          { label: 'Dictionary', kana: reading },
          { label: 'Negative', kana: stem + 'くない' },
          { label: 'Past', kana: stem + 'かった' },
          { label: 'Past negative', kana: stem + 'くなかった' },
          { label: 'Te-form', kana: stem + 'くて' },
          { label: 'Adverb', kana: stem + 'く' },
        ],
      },
      {
        title: 'Polite (with です)',
        rows: [
          { label: 'Polite', kana: reading + 'です' },
          { label: 'Negative polite', kana: stem + 'くないです' },
          { label: 'Past polite', kana: stem + 'かったです' },
          { label: 'Past neg. polite', kana: stem + 'くなかったです' },
        ],
      },
    ],
  };
}

function naAdj(reading: string): ConjugationTable {
  return {
    verbType: 'な-adjective (形容動詞)',
    groups: [
      {
        title: 'Plain',
        rows: [
          { label: 'Dictionary', kana: reading + 'だ' },
          { label: 'Attributive', kana: reading + 'な' },
          { label: 'Negative', kana: reading + 'じゃない' },
          { label: 'Past', kana: reading + 'だった' },
          { label: 'Past negative', kana: reading + 'じゃなかった' },
          { label: 'Te-form', kana: reading + 'で' },
          { label: 'Adverb', kana: reading + 'に' },
        ],
      },
      {
        title: 'Polite (with です)',
        rows: [
          { label: 'Polite', kana: reading + 'です' },
          { label: 'Negative polite', kana: reading + 'じゃないです' },
          { label: 'Past polite', kana: reading + 'でした' },
          { label: 'Past neg. polite', kana: reading + 'じゃなかったです' },
        ],
      },
    ],
  };
}

export function conjugate(reading: string, rawPos: string[]): ConjugationTable | null {
  const posSet = new Set(rawPos);

  if (posSet.has('v1') || posSet.has('v1-s') || posSet.has('vz')) return ichidan(reading);
  if (posSet.has('vk')) return kuru();
  if (posSet.has('vs-i') || posSet.has('vs-s')) return suru(reading);

  const godanTypes = ['v5k', 'v5k-s', 'v5g', 'v5s', 'v5t', 'v5n', 'v5b', 'v5m', 'v5r', 'v5r-i', 'v5u', 'v5u-s', 'v5aru'];
  if (godanTypes.some(t => posSet.has(t))) return godanVerb(reading, rawPos);

  if (posSet.has('adj-i') || posSet.has('adj-ix')) return iAdj(reading, posSet.has('adj-ix'));
  if (posSet.has('adj-na')) return naAdj(reading);

  return null;
}
