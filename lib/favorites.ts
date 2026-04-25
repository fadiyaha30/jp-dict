export interface FavoriteItem {
  id: string;
  kanji: string;
  reading: string;
  romaji: string;
  meaning: string;
  partOfSpeech: string[];
  jlpt: string | null;
  savedAt: number;
}

const KEY = "faya_dict_favorites";

export function getFavorites(): FavoriteItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isFavorited(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

export function addFavorite(item: Omit<FavoriteItem, "savedAt">) {
  const favorites = getFavorites().filter((f) => f.id !== item.id);
  favorites.unshift({ ...item, savedAt: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(favorites));
}

export function removeFavorite(id: string) {
  const favorites = getFavorites().filter((f) => f.id !== id);
  localStorage.setItem(KEY, JSON.stringify(favorites));
}

export function toggleFavorite(item: Omit<FavoriteItem, "savedAt">): boolean {
  if (isFavorited(item.id)) {
    removeFavorite(item.id);
    return false;
  } else {
    addFavorite(item);
    return true;
  }
}
