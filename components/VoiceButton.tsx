"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface VoiceButtonProps {
  text: string;
  reading?: string;
}

export default function VoiceButton({ text, reading }: VoiceButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback(() => {
    if (!supported) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(reading ?? text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;

    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find((v) => v.lang.startsWith("ja"));
    if (jpVoice) utterance.voice = jpVoice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [supported, speaking, text, reading]);

  if (!supported) return null;

  return (
    <button
      onClick={speak}
      aria-label={speaking ? "Stop" : "Listen to pronunciation"}
      title={speaking ? "Stop" : "Listen to pronunciation"}
      className="flex items-center justify-center rounded-full transition-all"
      style={{
        width: 40,
        height: 40,
        background: speaking ? "var(--accent)" + "18" : "var(--subtle)",
        border: `1.5px solid ${speaking ? "var(--accent)" : "var(--border)"}`,
        color: speaking ? "var(--accent)" : "var(--muted)",
        flexShrink: 0,
      }}
    >
      {speaking ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
