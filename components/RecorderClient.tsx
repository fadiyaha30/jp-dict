"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

type ExtractedWord = { word: string; reading: string; pos: string; meanings: string[] };

const POS_LABEL: Record<string, string> = {
  名詞: "noun",
  動詞: "verb",
  形容詞: "adj",
  副詞: "adverb",
};

type Status = "idle" | "recording" | "transcribing" | "extracting";

export default function RecorderClient() {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [words, setWords] = useState<ExtractedWord[]>([]);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError("");
    setWords([]);
    setTranscript("");
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access denied. Please allow microphone access and try again.");
      return;
    }

    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      await transcribeAndExtract(blob);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setStatus("recording");
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setStatus("transcribing");
  }, []);

  const transcribeAndExtract = async (blob: Blob) => {
    setStatus("transcribing");
    setError("");

    let text: string;
    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      text = data.transcript;
      setTranscript(text);
    } catch (err: any) {
      setError(err.message ?? "Transcription failed");
      setStatus("idle");
      return;
    }

    if (!text.trim()) {
      setError("No speech detected in the recording.");
      setStatus("idle");
      return;
    }

    setStatus("extracting");
    try {
      const res = await fetch("/api/extract-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWords(data.words);
    } catch (err: any) {
      setError(err.message ?? "Word extraction failed");
    }
    setStatus("idle");
  };

  const clearAll = useCallback(() => {
    setTranscript("");
    setWords([]);
    setError("");
    setStatus("idle");
  }, []);

  const isRecording = status === "recording";
  const isBusy = status === "transcribing" || status === "extracting";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Conversation Recorder
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Record spoken Japanese and extract key vocabulary automatically.
        </p>
      </div>

      {/* Controls */}
      <div className="card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {!isRecording && !isBusy && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all hover:opacity-90"
              style={{ background: "var(--accent)", color: "white" }}
            >
              <span className="w-2 h-2 rounded-full bg-white inline-block" />
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all hover:opacity-90"
              style={{ background: "#ef4444", color: "white" }}
            >
              <span className="w-2 h-2 rounded-full bg-white inline-block" style={{ animation: "blink 1s infinite" }} />
              Stop Recording
            </button>
          )}

          {isBusy && (
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm"
              style={{ background: "var(--subtle)", color: "var(--muted)", border: "1px solid var(--border)" }}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--accent)", animation: "blink 1s infinite" }} />
              {status === "transcribing" ? "Transcribing…" : "Extracting words…"}
            </div>
          )}

          {isRecording && (
            <span className="text-sm font-medium" style={{ color: "#ef4444" }}>
              Listening…
            </span>
          )}

          {!isRecording && !isBusy && (transcript || words.length > 0) && (
            <button
              onClick={clearAll}
              className="ml-auto text-xs px-3 py-1.5 rounded-full transition-all"
              style={{ border: "1px solid var(--border)", color: "var(--muted)", background: "var(--subtle)" }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Transcript */}
        {transcript ? (
          <div
            className="rounded-xl p-4 jp-text text-base leading-relaxed"
            style={{ background: "var(--subtle)", border: "1px solid var(--border)" }}
          >
            {transcript}
          </div>
        ) : (
          !isBusy && !isRecording && (
            <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>
              Press Start Recording and speak in Japanese
            </p>
          )
        )}

        {error && (
          <p className="text-sm" style={{ color: "#ef4444" }}>
            {error}
          </p>
        )}
      </div>

      {/* Extracted words */}
      {words.length > 0 && (
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base" style={{ color: "var(--text)" }}>
              Extracted Words
            </h2>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              {words.length} word{words.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {words.map(({ word, reading, pos, meanings }) => (
              <Link
                key={word}
                href={`/search?q=${encodeURIComponent(word)}&mode=auto`}
                className="no-underline group"
              >
                <div
                  className="flex flex-col gap-1 px-4 py-3 rounded-xl transition-all group-hover:border-[#c7d2fe] group-hover:shadow-sm"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    minWidth: "8rem",
                    maxWidth: "14rem",
                  }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="jp-text font-bold text-lg" style={{ color: "var(--text)" }}>
                      {word}
                    </span>
                    {reading && reading !== word && (
                      <span className="jp-text text-xs" style={{ color: "var(--muted)" }}>
                        {reading}
                      </span>
                    )}
                  </div>
                  {meanings.length > 0 && (
                    <p className="text-xs leading-snug" style={{ color: "var(--muted)" }}>
                      {meanings.join(" · ")}
                    </p>
                  )}
                  <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                    {POS_LABEL[pos] ?? pos}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
