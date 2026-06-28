export default function OfflinePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-4">
      <span className="jp-text text-6xl font-black" style={{ color: "var(--accent)" }}>辞</span>
      <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>You&apos;re offline</h1>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Check your connection and try again.
      </p>
    </main>
  );
}
