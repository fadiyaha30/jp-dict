export type HistoryItem =
  | {
      type: "search";
      query: string;
      mode: string;
      timestamp: number;
    }
  | {
      type: "word";
      id: string;
      kanji: string;
      reading: string;
      meaning: string;
      timestamp: number;
    };

const KEY = "faya_dict_history";
const MAX = 50;

export function getHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function pushSearch(query: string, mode: string) {
  const history = getHistory().filter(
    (h) => !(h.type === "search" && h.query === query && h.mode === mode)
  );
  history.unshift({ type: "search", query, mode, timestamp: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(history.slice(0, MAX)));
}

export function pushWord(id: string, kanji: string, reading: string, meaning: string) {
  const history = getHistory().filter(
    (h) => !(h.type === "word" && h.id === id)
  );
  history.unshift({ type: "word", id, kanji, reading, meaning, timestamp: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(history.slice(0, MAX)));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

export function removeItem(timestamp: number) {
  const history = getHistory().filter((h) => h.timestamp !== timestamp);
  localStorage.setItem(KEY, JSON.stringify(history));
}
