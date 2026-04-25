// Hiragana/katakana to romaji using wanakana on the client,
// and a basic map on the server (where wanakana may not be available in all runtimes).

const HIRAGANA_MAP: Record<string, string> = {
  あ:"a",い:"i",う:"u",え:"e",お:"o",
  か:"ka",き:"ki",く:"ku",け:"ke",こ:"ko",
  さ:"sa",し:"shi",す:"su",せ:"se",そ:"so",
  た:"ta",ち:"chi",つ:"tsu",て:"te",と:"to",
  な:"na",に:"ni",ぬ:"nu",ね:"ne",の:"no",
  は:"ha",ひ:"hi",ふ:"fu",へ:"he",ほ:"ho",
  ま:"ma",み:"mi",む:"mu",め:"me",も:"mo",
  や:"ya",ゆ:"yu",よ:"yo",
  ら:"ra",り:"ri",る:"ru",れ:"re",ろ:"ro",
  わ:"wa",ゐ:"wi",ゑ:"we",を:"wo",ん:"n",
  が:"ga",ぎ:"gi",ぐ:"gu",げ:"ge",ご:"go",
  ざ:"za",じ:"ji",ず:"zu",ぜ:"ze",ぞ:"zo",
  だ:"da",ぢ:"ji",づ:"zu",で:"de",ど:"do",
  ば:"ba",び:"bi",ぶ:"bu",べ:"be",ぼ:"bo",
  ぱ:"pa",ぴ:"pi",ぷ:"pu",ぺ:"pe",ぽ:"po",
  きゃ:"kya",きゅ:"kyu",きょ:"kyo",
  しゃ:"sha",しゅ:"shu",しょ:"sho",
  ちゃ:"cha",ちゅ:"chu",ちょ:"cho",
  にゃ:"nya",にゅ:"nyu",にょ:"nyo",
  ひゃ:"hya",ひゅ:"hyu",ひょ:"hyo",
  みゃ:"mya",みゅ:"myu",みょ:"myo",
  りゃ:"rya",りゅ:"ryu",りょ:"ryo",
  ぎゃ:"gya",ぎゅ:"gyu",ぎょ:"gyo",
  じゃ:"ja",じゅ:"ju",じょ:"jo",
  びゃ:"bya",びゅ:"byu",びょ:"byo",
  ぴゃ:"pya",ぴゅ:"pyu",ぴょ:"pyo",
  っ:"",ー:"-",
};

// Build katakana map by offsetting Unicode code points
const KATAKANA_MAP: Record<string, string> = {};
for (const [hira, roma] of Object.entries(HIRAGANA_MAP)) {
  const kata = Array.from(hira)
    .map((c) => {
      const cp = c.codePointAt(0)!;
      // Hiragana range: 0x3041–0x3096 → Katakana: 0x30A1–0x30F6 (offset +96)
      return cp >= 0x3041 && cp <= 0x3096
        ? String.fromCodePoint(cp + 0x60)
        : c;
    })
    .join("");
  KATAKANA_MAP[kata] = roma;
}

export function toRomaji(text: string): string {
  let result = "";
  let i = 0;
  while (i < text.length) {
    // Try 2-char combo first (e.g. きゃ)
    const two = text.slice(i, i + 2);
    if (HIRAGANA_MAP[two] !== undefined) {
      result += HIRAGANA_MAP[two];
      i += 2;
      continue;
    }
    if (KATAKANA_MAP[two] !== undefined) {
      result += KATAKANA_MAP[two];
      i += 2;
      continue;
    }
    const one = text[i];
    if (HIRAGANA_MAP[one] !== undefined) {
      result += HIRAGANA_MAP[one];
    } else if (KATAKANA_MAP[one] !== undefined) {
      result += KATAKANA_MAP[one];
    } else {
      result += one;
    }
    i++;
  }
  return result;
}
