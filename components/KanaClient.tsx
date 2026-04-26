"use client";

import { useState } from "react";

type KanaEntry = { kana: string; romaji: string } | null;
type KanaRow = { group: string; cells: KanaEntry[] };
type ComboRow = { group: string; ya: KanaEntry; yu: KanaEntry; yo: KanaEntry };

// ── Data ──────────────────────────────────────────────────────────────────────

const MAIN_H: KanaRow[] = [
  { group: "",   cells: [{ kana: "あ", romaji: "a" },  { kana: "い", romaji: "i" },  { kana: "う", romaji: "u" },  { kana: "え", romaji: "e" },  { kana: "お", romaji: "o" }] },
  { group: "k",  cells: [{ kana: "か", romaji: "ka" }, { kana: "き", romaji: "ki" }, { kana: "く", romaji: "ku" }, { kana: "け", romaji: "ke" }, { kana: "こ", romaji: "ko" }] },
  { group: "s",  cells: [{ kana: "さ", romaji: "sa" }, { kana: "し", romaji: "shi"},{ kana: "す", romaji: "su" }, { kana: "せ", romaji: "se" }, { kana: "そ", romaji: "so" }] },
  { group: "t",  cells: [{ kana: "た", romaji: "ta" }, { kana: "ち", romaji: "chi"},{ kana: "つ", romaji: "tsu"},{ kana: "て", romaji: "te" }, { kana: "と", romaji: "to" }] },
  { group: "n",  cells: [{ kana: "な", romaji: "na" }, { kana: "に", romaji: "ni" }, { kana: "ぬ", romaji: "nu" }, { kana: "ね", romaji: "ne" }, { kana: "の", romaji: "no" }] },
  { group: "h",  cells: [{ kana: "は", romaji: "ha" }, { kana: "ひ", romaji: "hi" }, { kana: "ふ", romaji: "fu" }, { kana: "へ", romaji: "he" }, { kana: "ほ", romaji: "ho" }] },
  { group: "m",  cells: [{ kana: "ま", romaji: "ma" }, { kana: "み", romaji: "mi" }, { kana: "む", romaji: "mu" }, { kana: "め", romaji: "me" }, { kana: "も", romaji: "mo" }] },
  { group: "y",  cells: [{ kana: "や", romaji: "ya" }, null,                         { kana: "ゆ", romaji: "yu" }, null,                         { kana: "よ", romaji: "yo" }] },
  { group: "r",  cells: [{ kana: "ら", romaji: "ra" }, { kana: "り", romaji: "ri" }, { kana: "る", romaji: "ru" }, { kana: "れ", romaji: "re" }, { kana: "ろ", romaji: "ro" }] },
  { group: "w",  cells: [{ kana: "わ", romaji: "wa" }, null,                         null,                         null,                         { kana: "を", romaji: "wo" }] },
  { group: "n",  cells: [{ kana: "ん", romaji: "n" },  null,                         null,                         null,                         null] },
];

const MAIN_K: KanaRow[] = [
  { group: "",   cells: [{ kana: "ア", romaji: "a" },  { kana: "イ", romaji: "i" },  { kana: "ウ", romaji: "u" },  { kana: "エ", romaji: "e" },  { kana: "オ", romaji: "o" }] },
  { group: "k",  cells: [{ kana: "カ", romaji: "ka" }, { kana: "キ", romaji: "ki" }, { kana: "ク", romaji: "ku" }, { kana: "ケ", romaji: "ke" }, { kana: "コ", romaji: "ko" }] },
  { group: "s",  cells: [{ kana: "サ", romaji: "sa" }, { kana: "シ", romaji: "shi"},{ kana: "ス", romaji: "su" }, { kana: "セ", romaji: "se" }, { kana: "ソ", romaji: "so" }] },
  { group: "t",  cells: [{ kana: "タ", romaji: "ta" }, { kana: "チ", romaji: "chi"},{ kana: "ツ", romaji: "tsu"},{ kana: "テ", romaji: "te" }, { kana: "ト", romaji: "to" }] },
  { group: "n",  cells: [{ kana: "ナ", romaji: "na" }, { kana: "ニ", romaji: "ni" }, { kana: "ヌ", romaji: "nu" }, { kana: "ネ", romaji: "ne" }, { kana: "ノ", romaji: "no" }] },
  { group: "h",  cells: [{ kana: "ハ", romaji: "ha" }, { kana: "ヒ", romaji: "hi" }, { kana: "フ", romaji: "fu" }, { kana: "ヘ", romaji: "he" }, { kana: "ホ", romaji: "ho" }] },
  { group: "m",  cells: [{ kana: "マ", romaji: "ma" }, { kana: "ミ", romaji: "mi" }, { kana: "ム", romaji: "mu" }, { kana: "メ", romaji: "me" }, { kana: "モ", romaji: "mo" }] },
  { group: "y",  cells: [{ kana: "ヤ", romaji: "ya" }, null,                         { kana: "ユ", romaji: "yu" }, null,                         { kana: "ヨ", romaji: "yo" }] },
  { group: "r",  cells: [{ kana: "ラ", romaji: "ra" }, { kana: "リ", romaji: "ri" }, { kana: "ル", romaji: "ru" }, { kana: "レ", romaji: "re" }, { kana: "ロ", romaji: "ro" }] },
  { group: "w",  cells: [{ kana: "ワ", romaji: "wa" }, null,                         null,                         null,                         { kana: "ヲ", romaji: "wo" }] },
  { group: "n",  cells: [{ kana: "ン", romaji: "n" },  null,                         null,                         null,                         null] },
];

const DAKU_H: KanaRow[] = [
  { group: "g", cells: [{ kana: "が", romaji: "ga" }, { kana: "ぎ", romaji: "gi" }, { kana: "ぐ", romaji: "gu" }, { kana: "げ", romaji: "ge" }, { kana: "ご", romaji: "go" }] },
  { group: "z", cells: [{ kana: "ざ", romaji: "za" }, { kana: "じ", romaji: "ji" }, { kana: "ず", romaji: "zu" }, { kana: "ぜ", romaji: "ze" }, { kana: "ぞ", romaji: "zo" }] },
  { group: "d", cells: [{ kana: "だ", romaji: "da" }, { kana: "ぢ", romaji: "di" }, { kana: "づ", romaji: "du" }, { kana: "で", romaji: "de" }, { kana: "ど", romaji: "do" }] },
  { group: "b", cells: [{ kana: "ば", romaji: "ba" }, { kana: "び", romaji: "bi" }, { kana: "ぶ", romaji: "bu" }, { kana: "べ", romaji: "be" }, { kana: "ぼ", romaji: "bo" }] },
  { group: "p", cells: [{ kana: "ぱ", romaji: "pa" }, { kana: "ぴ", romaji: "pi" }, { kana: "ぷ", romaji: "pu" }, { kana: "ぺ", romaji: "pe" }, { kana: "ぽ", romaji: "po" }] },
];

const DAKU_K: KanaRow[] = [
  { group: "g", cells: [{ kana: "ガ", romaji: "ga" }, { kana: "ギ", romaji: "gi" }, { kana: "グ", romaji: "gu" }, { kana: "ゲ", romaji: "ge" }, { kana: "ゴ", romaji: "go" }] },
  { group: "z", cells: [{ kana: "ザ", romaji: "za" }, { kana: "ジ", romaji: "ji" }, { kana: "ズ", romaji: "zu" }, { kana: "ゼ", romaji: "ze" }, { kana: "ゾ", romaji: "zo" }] },
  { group: "d", cells: [{ kana: "ダ", romaji: "da" }, { kana: "ヂ", romaji: "di" }, { kana: "ヅ", romaji: "du" }, { kana: "デ", romaji: "de" }, { kana: "ド", romaji: "do" }] },
  { group: "b", cells: [{ kana: "バ", romaji: "ba" }, { kana: "ビ", romaji: "bi" }, { kana: "ブ", romaji: "bu" }, { kana: "ベ", romaji: "be" }, { kana: "ボ", romaji: "bo" }] },
  { group: "p", cells: [{ kana: "パ", romaji: "pa" }, { kana: "ピ", romaji: "pi" }, { kana: "プ", romaji: "pu" }, { kana: "ペ", romaji: "pe" }, { kana: "ポ", romaji: "po" }] },
];

const COMBO_H: ComboRow[] = [
  { group: "ky", ya: { kana: "きゃ", romaji: "kya" }, yu: { kana: "きゅ", romaji: "kyu" }, yo: { kana: "きょ", romaji: "kyo" } },
  { group: "sh", ya: { kana: "しゃ", romaji: "sha" }, yu: { kana: "しゅ", romaji: "shu" }, yo: { kana: "しょ", romaji: "sho" } },
  { group: "ch", ya: { kana: "ちゃ", romaji: "cha" }, yu: { kana: "ちゅ", romaji: "chu" }, yo: { kana: "ちょ", romaji: "cho" } },
  { group: "ny", ya: { kana: "にゃ", romaji: "nya" }, yu: { kana: "にゅ", romaji: "nyu" }, yo: { kana: "にょ", romaji: "nyo" } },
  { group: "hy", ya: { kana: "ひゃ", romaji: "hya" }, yu: { kana: "ひゅ", romaji: "hyu" }, yo: { kana: "ひょ", romaji: "hyo" } },
  { group: "my", ya: { kana: "みゃ", romaji: "mya" }, yu: { kana: "みゅ", romaji: "myu" }, yo: { kana: "みょ", romaji: "myo" } },
  { group: "ry", ya: { kana: "りゃ", romaji: "rya" }, yu: { kana: "りゅ", romaji: "ryu" }, yo: { kana: "りょ", romaji: "ryo" } },
  { group: "gy", ya: { kana: "ぎゃ", romaji: "gya" }, yu: { kana: "ぎゅ", romaji: "gyu" }, yo: { kana: "ぎょ", romaji: "gyo" } },
  { group: "j",  ya: { kana: "じゃ", romaji: "ja"  }, yu: { kana: "じゅ", romaji: "ju"  }, yo: { kana: "じょ", romaji: "jo"  } },
  { group: "by", ya: { kana: "びゃ", romaji: "bya" }, yu: { kana: "びゅ", romaji: "byu" }, yo: { kana: "びょ", romaji: "byo" } },
  { group: "py", ya: { kana: "ぴゃ", romaji: "pya" }, yu: { kana: "ぴゅ", romaji: "pyu" }, yo: { kana: "ぴょ", romaji: "pyo" } },
];

const COMBO_K: ComboRow[] = [
  { group: "ky", ya: { kana: "キャ", romaji: "kya" }, yu: { kana: "キュ", romaji: "kyu" }, yo: { kana: "キョ", romaji: "kyo" } },
  { group: "sh", ya: { kana: "シャ", romaji: "sha" }, yu: { kana: "シュ", romaji: "shu" }, yo: { kana: "ショ", romaji: "sho" } },
  { group: "ch", ya: { kana: "チャ", romaji: "cha" }, yu: { kana: "チュ", romaji: "chu" }, yo: { kana: "チョ", romaji: "cho" } },
  { group: "ny", ya: { kana: "ニャ", romaji: "nya" }, yu: { kana: "ニュ", romaji: "nyu" }, yo: { kana: "ニョ", romaji: "nyo" } },
  { group: "hy", ya: { kana: "ヒャ", romaji: "hya" }, yu: { kana: "ヒュ", romaji: "hyu" }, yo: { kana: "ヒョ", romaji: "hyo" } },
  { group: "my", ya: { kana: "ミャ", romaji: "mya" }, yu: { kana: "ミュ", romaji: "myu" }, yo: { kana: "ミョ", romaji: "myo" } },
  { group: "ry", ya: { kana: "リャ", romaji: "rya" }, yu: { kana: "リュ", romaji: "ryu" }, yo: { kana: "リョ", romaji: "ryo" } },
  { group: "gy", ya: { kana: "ギャ", romaji: "gya" }, yu: { kana: "ギュ", romaji: "gyu" }, yo: { kana: "ギョ", romaji: "gyo" } },
  { group: "j",  ya: { kana: "ジャ", romaji: "ja"  }, yu: { kana: "ジュ", romaji: "ju"  }, yo: { kana: "ジョ", romaji: "jo"  } },
  { group: "by", ya: { kana: "ビャ", romaji: "bya" }, yu: { kana: "ビュ", romaji: "byu" }, yo: { kana: "ビョ", romaji: "byo" } },
  { group: "py", ya: { kana: "ピャ", romaji: "pya" }, yu: { kana: "ピュ", romaji: "pyu" }, yo: { kana: "ピョ", romaji: "pyo" } },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function Cell({ entry, showRomaji }: { entry: KanaEntry; showRomaji: boolean }) {
  if (!entry) {
    return (
      <td className="p-1">
        <div className="w-14 h-14 rounded-xl" style={{ background: "var(--subtle)", opacity: 0.4 }} />
      </td>
    );
  }
  return (
    <td className="p-1">
      <div
        className="w-14 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl cursor-default transition-colors hover:bg-[var(--subtle)]"
        style={{ border: "1px solid transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
      >
        <span className="jp-text text-2xl font-medium leading-none" style={{ color: "var(--text)" }}>
          {entry.kana}
        </span>
        {showRomaji && (
          <span className="text-[10px] tracking-wide font-mono" style={{ color: "var(--muted)" }}>
            {entry.romaji}
          </span>
        )}
      </div>
    </td>
  );
}

function ComboCell({ entry, showRomaji }: { entry: KanaEntry; showRomaji: boolean }) {
  if (!entry) return <td className="p-1"><div className="w-20 h-14 rounded-xl" style={{ background: "var(--subtle)", opacity: 0.4 }} /></td>;
  return (
    <td className="p-1">
      <div
        className="w-20 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl cursor-default transition-colors hover:bg-[var(--subtle)]"
        style={{ border: "1px solid transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
      >
        <span className="jp-text text-2xl font-medium leading-none" style={{ color: "var(--text)" }}>
          {entry.kana}
        </span>
        {showRomaji && (
          <span className="text-[10px] tracking-wide font-mono" style={{ color: "var(--muted)" }}>
            {entry.romaji}
          </span>
        )}
      </div>
    </td>
  );
}

function GroupLabel({ label }: { label: string }) {
  return (
    <td className="pr-3 text-right w-8">
      <span className="text-xs font-mono font-semibold" style={{ color: "var(--muted)" }}>{label}</span>
    </td>
  );
}

const VOW_HEADERS = ["a", "i", "u", "e", "o"];
const COMBO_HEADERS = ["ya", "yu", "yo"];

function MainTable({ rows, showRomaji }: { rows: KanaRow[]; showRomaji: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="border-separate" style={{ borderSpacing: 0 }}>
        <thead>
          <tr>
            <th className="w-8" />
            {VOW_HEADERS.map((v) => (
              <th key={v} className="pb-2 text-xs font-semibold font-mono w-16 text-center" style={{ color: "var(--accent)" }}>
                {v}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <GroupLabel label={row.group} />
              {row.cells.map((cell, j) => (
                <Cell key={j} entry={cell} showRomaji={showRomaji} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComboTable({ rows, showRomaji }: { rows: ComboRow[]; showRomaji: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="border-separate" style={{ borderSpacing: 0 }}>
        <thead>
          <tr>
            <th className="w-8" />
            {COMBO_HEADERS.map((v) => (
              <th key={v} className="pb-2 text-xs font-semibold font-mono w-24 text-center" style={{ color: "var(--accent)" }}>
                {v}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <GroupLabel label={row.group} />
              <ComboCell entry={row.ya} showRomaji={showRomaji} />
              <ComboCell entry={row.yu} showRomaji={showRomaji} />
              <ComboCell entry={row.yo} showRomaji={showRomaji} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest mb-3 mt-6" style={{ color: "var(--muted)" }}>
      {title}
    </h2>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

type Tab = "hiragana" | "katakana";

export default function KanaClient() {
  const [tab, setTab] = useState<Tab>("hiragana");
  const [showRomaji, setShowRomaji] = useState(true);

  const isHira = tab === "hiragana";
  const main = isHira ? MAIN_H : MAIN_K;
  const daku = isHira ? DAKU_H : DAKU_K;
  const combo = isHira ? COMBO_H : COMBO_K;

  return (
    <div className="flex flex-col gap-2">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        {/* Tabs */}
        <div className="flex gap-2">
          {(["hiragana", "katakana"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize"
              style={{
                background: tab === t ? "var(--accent)" : "var(--surface)",
                color: tab === t ? "white" : "var(--muted)",
                border: `1px solid ${tab === t ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {t === "hiragana" ? "Hiragana ひ" : "Katakana カ"}
            </button>
          ))}
        </div>

        {/* Romaji toggle */}
        <button
          onClick={() => setShowRomaji((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          style={{
            background: showRomaji ? "var(--accent)" + "18" : "var(--surface)",
            border: `1px solid ${showRomaji ? "var(--accent-mid)" : "var(--border)"}`,
            color: showRomaji ? "var(--accent)" : "var(--muted)",
          }}
        >
          <span
            className="inline-block w-3 h-3 rounded-full transition-colors"
            style={{ background: showRomaji ? "var(--accent)" : "var(--border)" }}
          />
          Romaji
        </button>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <SectionHeading title="Basic — Gojūon 五十音" />
        <MainTable rows={main} showRomaji={showRomaji} />

        <SectionHeading title="Voiced — Dakuten 濁点" />
        <MainTable rows={daku} showRomaji={showRomaji} />

        <SectionHeading title="Combinations — Yōon 拗音" />
        <ComboTable rows={combo} showRomaji={showRomaji} />
      </div>
    </div>
  );
}
