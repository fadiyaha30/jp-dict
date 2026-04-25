"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getHistory } from "@/lib/history";

interface QuizWord {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
}

type Mode = "flip" | "mc";
type View = "home" | "quiz" | "result";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function QuizClient() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;

  const [pool, setPool] = useState<QuizWord[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Quiz state
  const [view, setView] = useState<View>("home");
  const [mode, setMode] = useState<Mode>("flip");
  const [deck, setDeck] = useState<QuizWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);

  // Flip card state
  const [flipped, setFlipped] = useState(false);

  // MC state
  const [mcOptions, setMcOptions] = useState<QuizWord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    async function load() {
      let items: any[];
      if (isLoggedIn) {
        const r = await fetch("/api/history");
        items = await r.json();
      } else {
        items = getHistory();
      }
      const seen = new Set<string>();
      const words: QuizWord[] = [];
      for (const i of items) {
        if (i.type === "word" && !seen.has(i.id)) {
          seen.add(i.id);
          words.push({ id: i.id, kanji: i.kanji, reading: i.reading, meaning: i.meaning });
        }
      }
      setPool(words);
      setLoaded(true);
    }
    load();
  }, [isLoggedIn, status]);

  const makeOptions = useCallback((currentDeck: QuizWord[], currentIdx: number) => {
    const answer = currentDeck[currentIdx];
    const rest = shuffle(currentDeck.filter((_, i) => i !== currentIdx)).slice(0, 3);
    return shuffle([answer, ...rest]);
  }, []);

  function startQuiz(selectedMode: Mode) {
    const shuffled = shuffle(pool).slice(0, 20);
    setMode(selectedMode);
    setDeck(shuffled);
    setIdx(0);
    setCorrect(0);
    setFlipped(false);
    setSelected(null);
    if (selectedMode === "mc") setMcOptions(makeOptions(shuffled, 0));
    setView("quiz");
  }

  function advance(wasCorrect: boolean) {
    const next = idx + 1;
    setCorrect((c) => (wasCorrect ? c + 1 : c));
    if (next >= deck.length) {
      setView("result");
    } else {
      setIdx(next);
      setFlipped(false);
      setSelected(null);
      if (mode === "mc") setMcOptions(makeOptions(deck, next));
    }
  }

  if (status === "loading" || !loaded) return null;

  if (view === "home") {
    return <HomeView pool={pool} onStart={startQuiz} />;
  }

  if (view === "result") {
    return (
      <ResultView
        correct={correct}
        total={deck.length}
        mode={mode}
        onRetry={() => startQuiz(mode)}
        onSwitch={() => startQuiz(mode === "flip" ? "mc" : "flip")}
        onHome={() => setView("home")}
        canSwitch={mode === "mc" ? true : pool.length >= 4}
      />
    );
  }

  const word = deck[idx];
  const progress = { current: idx + 1, total: deck.length };

  if (mode === "flip") {
    return (
      <FlipView
        word={word}
        progress={progress}
        flipped={flipped}
        onFlip={() => setFlipped(true)}
        onGotIt={() => advance(true)}
        onMiss={() => advance(false)}
      />
    );
  }

  return (
    <MCView
      word={word}
      options={mcOptions}
      progress={progress}
      selected={selected}
      onSelect={(id) => { if (!selected) setSelected(id); }}
      onNext={() => advance(selected === word.id)}
    />
  );
}

// ── Home view ─────────────────────────────────────────────────────────────────

function HomeView({ pool, onStart }: { pool: QuizWord[]; onStart: (m: Mode) => void }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Quiz</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Practice words from your history ·{" "}
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{pool.length} word{pool.length !== 1 ? "s" : ""} available</span>
        </p>
      </div>

      {pool.length < 2 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-4xl">📚</p>
          <p className="font-semibold" style={{ color: "var(--text)" }}>Not enough words yet</p>
          <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
            Look up at least 2 words first — they&apos;ll appear here as practice material.
          </p>
          <Link
            href="/"
            className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent)", color: "white" }}
          >
            Start searching
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModeCard
            emoji="🃏"
            title="Flip Cards"
            description="See the word, flip to reveal its reading and meaning. Mark yourself honest."
            available={pool.length >= 1}
            onClick={() => onStart("flip")}
          />
          <ModeCard
            emoji="🔤"
            title="Multiple Choice"
            description="Pick the correct meaning from 4 options. Instant right or wrong feedback."
            available={pool.length >= 4}
            unavailableMsg={`Need at least 4 words (you have ${pool.length})`}
            onClick={() => onStart("mc")}
          />
        </div>
      )}
    </div>
  );
}

function ModeCard({
  emoji, title, description, available, unavailableMsg, onClick,
}: {
  emoji: string;
  title: string;
  description: string;
  available: boolean;
  unavailableMsg?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={available ? onClick : undefined}
      disabled={!available}
      className="flex flex-col gap-4 rounded-2xl p-6 text-left transition-all disabled:opacity-50"
      style={{
        background: "var(--surface)",
        border: available ? "1px solid var(--border)" : "1px solid var(--border)",
        cursor: available ? "pointer" : "not-allowed",
      }}
      onMouseEnter={(e) => { if (available) (e.currentTarget as HTMLButtonElement).style.borderColor = "#c7d2fe"; }}
      onMouseLeave={(e) => { if (available) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
    >
      <span style={{ fontSize: "2.5rem", lineHeight: 1 }}>{emoji}</span>
      <div className="flex flex-col gap-1.5">
        <p className="font-bold text-base" style={{ color: "var(--text)" }}>{title}</p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          {available ? description : unavailableMsg}
        </p>
      </div>
      {available && (
        <span
          className="self-start text-xs font-semibold px-3 py-1.5 rounded-lg mt-auto"
          style={{ background: "var(--accent-pale)", color: "var(--accent)" }}
        >
          Start →
        </span>
      )}
    </button>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "var(--accent)" }}
        />
      </div>
      <span className="text-xs font-medium shrink-0" style={{ color: "var(--muted)" }}>
        {current} / {total}
      </span>
    </div>
  );
}

// ── Flip card view ────────────────────────────────────────────────────────────

function FlipView({
  word, progress, flipped, onFlip, onGotIt, onMiss,
}: {
  word: QuizWord;
  progress: { current: number; total: number };
  flipped: boolean;
  onFlip: () => void;
  onGotIt: () => void;
  onMiss: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <ProgressBar {...progress} />

      {/* 3D flip card */}
      <div style={{ perspective: "1200px" }}>
        <div
          onClick={!flipped ? onFlip : undefined}
          style={{
            position: "relative",
            height: "300px",
            transformStyle: "preserve-3d",
            transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            cursor: flipped ? "default" : "pointer",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-4"
            style={{
              backfaceVisibility: "hidden",
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="jp-text font-black select-none"
              style={{ fontSize: "clamp(3rem, 12vw, 5rem)", color: "var(--text)", lineHeight: 1 }}
            >
              {word.kanji}
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>tap to flip</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 px-6"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "var(--surface)",
              border: "1px solid #c7d2fe",
            }}
          >
            <p className="jp-text text-2xl font-bold select-none" style={{ color: "var(--accent)" }}>
              {word.reading}
            </p>
            <p className="text-base text-center leading-relaxed select-none" style={{ color: "var(--text)" }}>
              {word.meaning}
            </p>
          </div>
        </div>
      </div>

      {/* Self-assessment buttons */}
      <div
        className="flex gap-3 transition-all"
        style={{ opacity: flipped ? 1 : 0, pointerEvents: flipped ? "auto" : "none" }}
      >
        <button
          onClick={onMiss}
          className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
        >
          ✗ Miss
        </button>
        <button
          onClick={onGotIt}
          className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
        >
          ✓ Got it
        </button>
      </div>
    </div>
  );
}

// ── Multiple choice view ──────────────────────────────────────────────────────

function MCView({
  word, options, progress, selected, onSelect, onNext,
}: {
  word: QuizWord;
  options: QuizWord[];
  progress: { current: number; total: number };
  selected: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  function optionStyle(opt: QuizWord): React.CSSProperties {
    if (!selected) {
      return { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" };
    }
    if (opt.id === word.id) {
      return { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" };
    }
    if (opt.id === selected) {
      return { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" };
    }
    return { background: "var(--subtle)", border: "1px solid var(--border)", color: "var(--muted)", opacity: 0.6 };
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressBar {...progress} />

      {/* Question */}
      <div
        className="rounded-2xl flex items-center justify-center"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", height: "160px" }}
      >
        <p
          className="jp-text font-black select-none"
          style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)", color: "var(--text)", lineHeight: 1 }}
        >
          {word.kanji}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            disabled={!!selected}
            className="w-full px-5 py-3.5 rounded-xl text-sm text-left font-medium transition-all"
            style={optionStyle(opt)}
          >
            {opt.meaning}
          </button>
        ))}
      </div>

      {/* Next button */}
      {selected && (
        <button
          onClick={onNext}
          className="self-end px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "var(--accent)", color: "white" }}
        >
          Next →
        </button>
      )}
    </div>
  );
}

// ── Result view ───────────────────────────────────────────────────────────────

function ResultView({
  correct, total, mode, onRetry, onSwitch, onHome, canSwitch,
}: {
  correct: number;
  total: number;
  mode: Mode;
  onRetry: () => void;
  onSwitch: () => void;
  onHome: () => void;
  canSwitch: boolean;
}) {
  const pct = Math.round((correct / total) * 100);
  const scoreColor = pct >= 80 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";
  const message =
    pct === 100 ? "Perfect! 🎉" :
    pct >= 80 ? "Great job!" :
    pct >= 50 ? "Keep it up!" :
    "More practice needed.";

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-5xl font-black" style={{ color: scoreColor }}>{pct}%</p>
        <p className="text-lg font-semibold" style={{ color: "var(--text)" }}>{message}</p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>{correct} out of {total} correct</p>
      </div>

      <div
        className="w-full rounded-2xl p-5 flex flex-col gap-3"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", maxWidth: "20rem" }}
      >
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl text-sm font-semibold"
          style={{ background: "var(--accent)", color: "white" }}
        >
          Try again ({mode === "flip" ? "Flip Cards" : "Multiple Choice"})
        </button>
        {canSwitch && (
          <button
            onClick={onSwitch}
            className="w-full py-3 rounded-xl text-sm font-medium"
            style={{ background: "var(--subtle)", color: "var(--text)", border: "1px solid var(--border)" }}
          >
            Switch to {mode === "flip" ? "Multiple Choice" : "Flip Cards"}
          </button>
        )}
        <button
          onClick={onHome}
          className="w-full py-3 rounded-xl text-sm"
          style={{ color: "var(--muted)", background: "none", border: "none" }}
        >
          ← Back to quiz home
        </button>
      </div>
    </div>
  );
}
