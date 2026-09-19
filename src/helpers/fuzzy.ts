const WORD_BREAK = /[\s\-_/·.:]/;

/**
 * Scores `query` against `text` as an in-order subsequence (0 = no match).
 * Rewards matches at word starts, consecutive runs, prefixes and plain
 * substrings, and slightly prefers shorter texts.
 */
export function fuzzyScore(query: string, text: string) {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const t = text.toLowerCase();
  if (!q) return 1;

  let score = 0;
  let from = 0;
  let run = 0;
  for (const char of q) {
    const found = t.indexOf(char, from);
    if (found < 0) return 0;
    run = found === from ? run + 1 : 0;
    const wordStart = found === 0 || WORD_BREAK.test(t[found - 1]);
    score += 1 + (wordStart ? 3 : 0) + run * 2;
    from = found + 1;
  }

  const phrase = query.trim().toLowerCase();
  if (t.startsWith(phrase)) score += 12;
  else if (t.includes(phrase)) score += 6;

  return score / (1 + t.length / 80);
}
