export interface TatoebaExample {
  id: number;
  japanese: string;
  english: string;
}

export async function fetchExamples(
  word: string,
  limit = 5
): Promise<TatoebaExample[]> {
  try {
    const url = `https://tatoeba.org/en/api_v0/search?from=jpn&to=eng&query=${encodeURIComponent(word)}&orphans=no&unapproved=no&limit=${limit}`;
    const res = await fetch(url, {
      next: { revalidate: 86400 }, // cache per word for 24h
      headers: { "User-Agent": "jdict-app/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();

    return (data.results ?? [])
      .flatMap((r: any) => {
        const english = r.translations?.[0]?.[0]?.text;
        if (!english) return [];
        return [{ id: r.id, japanese: r.text, english }];
      })
      .slice(0, limit);
  } catch {
    return [];
  }
}
