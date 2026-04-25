"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getHistory } from "@/lib/history";
import { getFavorites } from "@/lib/favorites";

type Source = "history" | "favorites";

interface QuizWord {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
}

type Mode = "flip" | "mc";
type View = "home" | "setup" | "quiz" | "result";

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

  const [histPool, setHistPool] = useState<QuizWord[]>([]);
  const [favPool, setFavPool] = useState<QuizWord[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [view, setView] = useState<View>("home");
  const [mode, setMode] = useState<Mode>("flip");
  const [source, setSource] = useState<Source>("history");
  const [count, setCount] = useState(10);

  const activePool = source === "favorites" ? favPool : histPool;
  const [deck, setDeck] = useState<QuizWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);

  const [flipped, setFlipped] = useState(false);
  const [mcOptions, setMcOptions] = useState<QuizWord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    async function load() {
      // History words
      let histItems: any[];
      if (isLoggedIn) {
        const r = await fetch("/api/history");
        histItems = await r.json();
      } else {
        histItems = getHistory();
      }
      const seen = new Set<string>();
      const histWords: QuizWord[] = [];
      for (const i of histItems) {
        if (i.type === "word" && !seen.has(i.id)) {
          seen.add(i.id);
          histWords.push({ id: i.id, kanji: i.kanji, reading: i.reading, meaning: i.meaning });
        }
      }
      setHistPool(histWords);

      // Favorites
      let favItems: any[];
      if (isLoggedIn) {
        const r = await fetch("/api/favorites");
        favItems = await r.json();
      } else {
        favItems = getFavorites();
      }
      setFavPool(
        favItems.map((f: any) => ({ id: f.id, kanji: f.kanji, reading: f.reading, meaning: f.meaning }))
      );

      setLoaded(true);
    }
    load();
  }, [isLoggedIn, status]);

  const makeOptions = useCallback((currentDeck: QuizWord[], currentIdx: number) => {
    const answer = currentDeck[currentIdx];
    const rest = shuffle(currentDeck.filter((_, i) => i !== currentIdx)).slice(0, 3);
    return shuffle([answer, ...rest]);
  }, []);

  function startQuiz() {
    const shuffled = shuffle(activePool).slice(0, Math.min(count, activePool.length));
    setDeck(shuffled);
    setIdx(0);
    setCorrect(0);
    setFlipped(false);
    setSelected(null);
    if (mode === "mc") setMcOptions(makeOptions(shuffled, 0));
    setView("quiz");
  }

  function pickMode(m: Mode) {
    setMode(m);
    setCount(Math.min(10, activePool.length));
    setView("setup");
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
    return <HomeView pool={activePool} onPickMode={pickMode} />;
  }

  if (view === "setup") {
    return (
      <SetupView
        mode={mode}
        source={source}
        histPool={histPool}
        favPool={favPool}
        count={count}
        onSourceChange={(s) => {
          setSource(s);
          const newPool = s === "favorites" ? favPool : histPool;
          setCount(Math.min(count, newPool.length) || newPool.length);
        }}
        onCountChange={setCount}
        onStart={startQuiz}
        onBack={() => setView("home")}
      />
    );
  }

  if (view === "result") {
    return (
      <ResultView
        correct={correct}
        total={deck.length}
        mode={mode}
        onRetry={startQuiz}
        onChangeSettings={() => setView("setup")}
        onSwitchMode={() => pickMode(mode === "flip" ? "mc" : "flip")}
        onHome={() => setView("home")}
        canSwitch={mode === "flip" ? activePool.length >= 4 : true}
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

function HomeView({ pool, onPickMode }: { pool: QuizWord[]; onPickMode: (m: Mode) => void }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Quiz</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Practice words from your history ·{" "}
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>
            {pool.length} word{pool.length !== 1 ? "s" : ""} available
          </span>
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
            available
            onClick={() => onPickMode("flip")}
          />
          <ModeCard
            emoji="🔤"
            title="Multiple Choice"
            description="Pick the correct meaning from 4 options. Instant right or wrong feedback."
            available={pool.length >= 4}
            unavailableMsg={`Need at least 4 words (you have ${pool.length})`}
            onClick={() => onPickMode("mc")}
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
      style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: available ? "pointer" : "not-allowed" }}
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
          Select →
        </span>
      )}
    </button>
  );
}

// ── Setup view ────────────────────────────────────────────────────────────────

function SetupView({
  mode, source, histPool, favPool, count, onSourceChange, onCountChange, onStart, onBack,
}: {
  mode: Mode;
  source: Source;
  histPool: QuizWord[];
  favPool: QuizWord[];
  count: number;
  onSourceChange: (s: Source) => void;
  onCountChange: (n: number) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  const pool = source === "favorites" ? favPool : histPool;
  const clamped = Math.min(Math.max(count, 1), pool.length);

  function handleInput(raw: string) {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onCountChange(Math.min(Math.max(n, 1), pool.length));
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <button
          onClick={onBack}
          className="self-start flex items-center gap-1.5 text-sm mb-2"
          style={{ color: "var(--muted)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
          {mode === "flip" ? "🃏 Flip Cards" : "🔤 Multiple Choice"}
        </h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>How many questions?</p>
      </div>

      {/* Source toggle */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          Word source
        </p>
        <div
          className="flex rounded-xl overflow-hidden gap-px self-start w-full"
          style={{ background: "var(--border)", border: "1px solid var(--border)" }}
        >
          {([
            { key: "history", label: `History (${histPool.length})` },
            { key: "favorites", label: `Favorites (${favPool.length})` },
          ] as { key: Source; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onSourceChange(key)}
              disabled={key === "favorites" ? favPool.length === 0 : histPool.length === 0}
              className="flex-1 py-2 text-sm font-medium transition-all disabled:opacity-40"
              style={
                source === key
                  ? { background: "var(--surface)", color: "var(--accent)", fontWeight: 600 }
                  : { background: "var(--subtle)", color: "var(--muted)" }
              }
            >
              {label}
            </button>
          ))}
        </div>
        {source === "favorites" && favPool.length === 0 && (
          <p className="text-xs" style={{ color: "#dc2626" }}>No favorites yet — save some words first.</p>
        )}
      </div>

      {/* Spinner */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="flex items-center rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
        >
          <button
            onClick={() => onCountChange(Math.max(clamped - 1, 1))}
            disabled={clamped <= 1}
            className="px-5 py-4 text-xl font-bold transition-colors disabled:opacity-30"
            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer" }}
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={pool.length}
            value={clamped}
            onChange={(e) => handleInput(e.target.value)}
            className="text-center font-black outline-none"
            style={{
              width: "5rem",
              fontSize: "2rem",
              background: "none",
              border: "none",
              color: "var(--text)",
              MozAppearance: "textfield",
            } as React.CSSProperties}
          />
          <button
            onClick={() => onCountChange(Math.min(clamped + 1, pool.length))}
            disabled={clamped >= pool.length}
            className="px-5 py-4 text-xl font-bold transition-colors disabled:opacity-30"
            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer" }}
          >
            +
          </button>
        </div>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          max {pool.length} (your word history)
        </p>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        disabled={pool.length === 0}
        className="w-full py-4 rounded-2xl font-bold text-base disabled:opacity-40"
        style={{ background: "var(--accent)", color: "white" }}
      >
        Start {clamped} question{clamped !== 1 ? "s" : ""}
      </button>
    </div>
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
            style={{ backfaceVisibility: "hidden", background: "var(--surface)", border: "1px solid var(--border)" }}
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

      <div
        className="flex gap-3 transition-all"
        style={{ opacity: flipped ? 1 : 0, pointerEvents: flipped ? "auto" : "none" }}
      >
        <button
          onClick={onMiss}
          className="flex-1 py-3 rounded-xl font-semibold text-sm"
          style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
        >
          ✗ Miss
        </button>
        <button
          onClick={onGotIt}
          className="flex-1 py-3 rounded-xl font-semibold text-sm"
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
    if (!selected) return { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" };
    if (opt.id === word.id) return { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" };
    if (opt.id === selected) return { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" };
    return { background: "var(--subtle)", border: "1px solid var(--border)", color: "var(--muted)", opacity: 0.6 };
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressBar {...progress} />

      <div
        className="rounded-2xl flex flex-col items-center justify-center gap-2"
        style={{
          background: "var(--surface)",
          border: selected ? "1px solid #c7d2fe" : "1px solid var(--border)",
          height: "160px",
          transition: "border-color 0.2s",
        }}
      >
        <p
          className="jp-text font-black select-none"
          style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)", color: "var(--text)", lineHeight: 1 }}
        >
          {word.kanji}
        </p>
        {selected && word.reading !== word.kanji && (
          <p
            className="jp-text text-base select-none"
            style={{ color: "var(--accent)", opacity: 0, animation: "fadeIn 0.25s ease forwards" }}
          >
            {word.reading}
          </p>
        )}
      </div>

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
  correct, total, mode, onRetry, onChangeSettings, onSwitchMode, onHome, canSwitch,
}: {
  correct: number;
  total: number;
  mode: Mode;
  onRetry: () => void;
  onChangeSettings: () => void;
  onSwitchMode: () => void;
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
          Try again
        </button>
        <button
          onClick={onChangeSettings}
          className="w-full py-3 rounded-xl text-sm font-medium"
          style={{ background: "var(--subtle)", color: "var(--text)", border: "1px solid var(--border)" }}
        >
          Change questions
        </button>
        {canSwitch && (
          <button
            onClick={onSwitchMode}
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
