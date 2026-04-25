// Maps godan i-row (masu-stem) → u-row (dictionary form)
const I_TO_U: Record<string, string> = {
  き: "く", ぎ: "ぐ", し: "す", ち: "つ",
  に: "ぬ", び: "ぶ", み: "む", り: "る", い: "う",
};

// Maps godan a-row (nai-stem) → u-row (dictionary form)
const A_TO_U: Record<string, string> = {
  か: "く", が: "ぐ", さ: "す", た: "つ",
  な: "ぬ", ば: "ぶ", ま: "む", ら: "る", わ: "う",
};

// Maps godan e-row (potential/conditional stem) → u-row (dictionary form)
const E_TO_U: Record<string, string> = {
  け: "く", げ: "ぐ", せ: "す", て: "つ",
  ね: "ぬ", べ: "ぶ", め: "む", れ: "る", え: "う",
};

// Given a masu-stem (ends in i-row kana), generate dictionary form candidates
function fromMasuStem(stem: string): string[] {
  if (!stem) return [];
  const last = stem.slice(-1);
  const base = stem.slice(0, -1);
  const forms: string[] = [];
  if (I_TO_U[last]) forms.push(base + I_TO_U[last]); // godan
  forms.push(stem + "る"); // ichidan
  if (last === "し") forms.push(base + "する"); // suru compound (べんきょうし → べんきょうする)
  if (stem === "き") forms.push("くる"); // 来る special case
  return forms;
}

// Given a nai-stem (ends in a-row kana), generate dictionary form candidates
function fromNaiStem(stem: string): string[] {
  if (!stem) return [];
  const last = stem.slice(-1);
  const base = stem.slice(0, -1);
  const forms: string[] = [];
  if (A_TO_U[last]) forms.push(base + A_TO_U[last]); // godan
  forms.push(stem + "る"); // ichidan (stem unchanged before ない)
  if (last === "し") forms.push(base + "する");
  return forms;
}

// Te-form suffix → candidate endings
// Note: った/って also covers v5k-s (行く → 行った) by adding く
const TE_MAP: [string, string[]][] = [
  ["いて", ["く"]],
  ["いで", ["ぐ"]],
  ["して", ["す"]],
  ["した", ["す"]],
  ["って", ["つ", "る", "う", "く"]], // く for 行く (v5k-s)
  ["った", ["つ", "る", "う", "く"]],
  ["んで", ["ぬ", "ぶ", "む"]],
  ["んだ", ["ぬ", "ぶ", "む"]],
];

export function deinflect(query: string): string[] {
  const candidates = new Set<string>();
  const q = query.trim();
  if (!q) return [];

  // ── Polite (ます) family ──────────────────────
  for (const suf of ["ます", "ません", "ました", "ませんでした", "ましょう", "ませ", "まして"]) {
    if (q.endsWith(suf) && q.length > suf.length) {
      for (const f of fromMasuStem(q.slice(0, -suf.length))) candidates.add(f);
    }
  }

  // ── Tai (たい) family ─────────────────────────
  for (const suf of ["たい", "たかった", "たくない", "たくて"]) {
    if (q.endsWith(suf) && q.length > suf.length) {
      for (const f of fromMasuStem(q.slice(0, -suf.length))) candidates.add(f);
    }
  }

  // ── Nai (ない) family ─────────────────────────
  for (const suf of ["ない", "なかった", "なくて", "なければ"]) {
    if (q.endsWith(suf) && q.length > suf.length) {
      for (const f of fromNaiStem(q.slice(0, -suf.length))) candidates.add(f);
    }
  }

  // ── I-adjective forms ─────────────────────────
  // 高くない → 高い, おいしかった → おいしい, etc.
  for (const suf of ["くない", "くなかった", "かった", "くて", "くなる", "ければ", "かろう"]) {
    if (q.endsWith(suf) && q.length > suf.length) {
      candidates.add(q.slice(0, -suf.length) + "い");
    }
  }

  // ── Te-form / ta-form (godan) ─────────────────
  for (const [suf, endings] of TE_MAP) {
    if (q.endsWith(suf) && q.length > suf.length) {
      const base = q.slice(0, -suf.length);
      for (const end of endings) candidates.add(base + end);
    }
  }

  // Ichidan て/た: stem + る
  if ((q.endsWith("て") || q.endsWith("た")) && q.length > 1) {
    candidates.add(q.slice(0, -1) + "る");
  }

  // ── Progressive / te-iru forms ────────────────
  for (const suf of ["ている", "ていた", "ていない", "ていなかった", "てから", "てる", "てた"]) {
    if (q.endsWith(suf) && q.length > suf.length) {
      const base = q.slice(0, -suf.length);
      // Recurse: deinflect "base + て" to handle godan te-forms inside progressive
      for (const r of deinflect(base + "て")) candidates.add(r);
      if (base.length > 0) candidates.add(base + "る"); // ichidan fallback
    }
  }

  // ── Potential / passive ───────────────────────
  if (q.endsWith("られる") && q.length > 3) {
    candidates.add(q.slice(0, -3) + "る"); // ichidan potential/passive
  }
  if (q.endsWith("れる") && q.length > 2) {
    for (const f of fromNaiStem(q.slice(0, -2))) candidates.add(f); // godan passive: a-row + れる
  }

  // ── Volitional (よう/おう) ────────────────────
  if (q.endsWith("よう") && q.length > 2) {
    candidates.add(q.slice(0, -2) + "る");
  }
  for (const [e, u] of Object.entries(E_TO_U)) {
    const vol = e + "う";
    if (q.endsWith(vol) && q.length > vol.length) {
      candidates.add(q.slice(0, -vol.length) + u);
    }
  }

  // ── Conditional (eba) ─────────────────────────
  if (q.endsWith("れば") && q.length > 2) {
    candidates.add(q.slice(0, -2) + "る");
  }
  if (q.endsWith("ば") && q.length > 2) {
    const beforeBa = q.slice(-2, -1);
    if (E_TO_U[beforeBa]) candidates.add(q.slice(0, -2) + E_TO_U[beforeBa]);
  }

  // ── Causative ─────────────────────────────────
  if (q.endsWith("させる") && q.length > 3) {
    candidates.add(q.slice(0, -3) + "る"); // ichidan causative
    candidates.add(q.slice(0, -3) + "する");
  }
  if (q.endsWith("せる") && q.length > 2) {
    for (const f of fromNaiStem(q.slice(0, -2))) candidates.add(f); // godan causative
  }

  return [...candidates].filter((c) => c.length > 0 && c !== q);
}
