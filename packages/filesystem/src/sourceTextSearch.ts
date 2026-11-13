import type { FileEntry } from "./index";

/**
 * Direct port of pinned legacy-win7/src/modules/chunks/
 * shared~bin~...~search-dia~fc0c0d68.js modules 5985 and 2e2c.
 *
 * This is a query over the *guest virtual filesystem*, not the host OS.
 * The original weights a filename match 10, adds 1,000 for an exact name,
 * 100 for a prefix and 5 for ordered token matches. Plain text tokens use
 * the original word-start matcher, not arbitrary contains().
 */
export interface SourceParsedSearch {
  terms: string[];
  filters: Record<string, string>;
}
export interface SourceSearchHighlight {
  start: number;
  end: number;
}
export interface SourceSearchMatch {
  score: number;
  highlights: SourceSearchHighlight[];
}
export type SourceKindMatcher = (entry: FileEntry, kind: string) => boolean;

const DAY = 86_400_000;
const SIZES: Record<string, [number, number]> = {
  empty: [-1, 0],
  tiny: [0, 10 * 1024],
  small: [10 * 1024, 100 * 1024],
  medium: [100 * 1024, 1024 * 1024],
  large: [1024 * 1024, 16 * 1024 * 1024],
  huge: [16 * 1024 * 1024, 128 * 1024 * 1024],
  gigantic: [128 * 1024 * 1024, Infinity]
};
const UNITS: Record<string, number> = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };
const QUERIED_KINDS = new Set([
  "folder", "document", "picture", "music", "video", "movie",
  "playlist", "program", "link", "webpage"
]);
// The source 5985 punctuation boundary range, including U+0060 (backtick),
// plus east-Asian script boundaries even when adjacent to another letter.
const PUNCTUATION = /[\s!-/:-@\[-_\x60\{-~\u00a1-\u00bf\u00d7\u00f7\u060c\u061b\u061f\u066a-\u066d\u0964\u0965\u2000-\u206f\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/u;
const EAST_ASIAN = /[\u0e00-\u0eff\u1000-\u109f\u1780-\u17ff\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;

export function normalizeSourceSearchText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Source 5985.d: terms, quoted phrases and last-wins named field filters. */
export function parseSourceSearchText(text: string): SourceParsedSearch {
  const parsed: SourceParsedSearch = { terms: [], filters: {} };
  const expression = /([a-z]+:)?"([^"]*)"?|(\S+)/g;
  const normalized = normalizeSourceSearchText(text);
  let match: RegExpExecArray | null;
  while ((match = expression.exec(normalized))) {
    const [, quotedKey, quoted, plain] = match;
    const field = plain?.match(/^([a-z]+):(.+)$/);
    if (field) parsed.filters[field[1]] = field[2];
    else if (quotedKey) {
      if (quoted.trim()) parsed.filters[quotedKey.slice(0, -1)] = quoted.trim();
    } else if (quoted !== undefined) {
      if (quoted.trim()) parsed.terms.push(quoted.trim());
    } else if (plain) parsed.terms.push(plain);
  }
  return parsed;
}

/** Source 5985.b: a term may start at beginning, after punctuation or at CJK boundary. */
export function findSourceWordStart(text: string, term: string, from = 0): number {
  let match = text.indexOf(term, from);
  while (match !== -1) {
    if (match === 0 || PUNCTUATION.test(text[match - 1]) ||
      EAST_ASIAN.test(text[match - 1]) || EAST_ASIAN.test(text[match])) return match;
    match = text.indexOf(term, match + 1);
  }
  return -1;
}

/** Source 5985.e: every term required; exact > starts-with > ordered occurrence. */
export function scoreSourceFileName(name: string, terms: readonly string[]): number {
  if (!terms.length) return 1;
  const normalized = normalizeSourceSearchText(name);
  for (const term of terms) {
    if (findSourceWordStart(normalized, term) === -1) return 0;
  }
  let score = 10 * terms.length;
  const joined = terms.join(" ");
  if (normalized === joined) score += 1000;
  else if (normalized.startsWith(joined)) score += 100;
  else {
    let position = 0;
    let ordered = true;
    for (const term of terms) {
      const at = findSourceWordStart(normalized, term, position);
      if (at === -1) { ordered = false; break; }
      position = at + term.length;
    }
    if (ordered) score += 5;
  }
  return score;
}

/** Source 2e2c.w: merge overlapping filename marks; accents can change length. */
export function sourceSearchHighlights(name: string, terms: readonly string[]): SourceSearchHighlight[] {
  const normalized = normalizeSourceSearchText(name);
  if (normalized.length !== name.length) return [];
  const ranges: SourceSearchHighlight[] = [];
  for (const term of terms) {
    let position = findSourceWordStart(normalized, term);
    while (position !== -1) {
      ranges.push({ start: position, end: position + term.length });
      position = findSourceWordStart(normalized, term, position + 1);
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  const merged: SourceSearchHighlight[] = [];
  for (const range of ranges) {
    const previous = merged[merged.length - 1];
    if (previous && range.start <= previous.end) previous.end = Math.max(previous.end, range.end);
    else merged.push({ ...range });
  }
  return merged;
}

/** Original numeric-size grammar, ranges are (exclusive lower, inclusive upper]. */
export function sourceSizeRange(value: string): [number, number] | null {
  if (SIZES[value]) return SIZES[value];
  const matched = value.match(/^(>=|<=|>|<|=)?(\d+(?:\.\d+)?)(b|kb|mb|gb)?$/);
  if (!matched) return null;
  const amount = Number(matched[2]) * UNITS[matched[3] ?? "b"];
  switch (matched[1]) {
    case ">": return [amount, Infinity];
    case ">=": return [amount - 1, Infinity];
    case "<": return [-1, amount - 1];
    case "<=": return [-1, amount];
    default: return [amount - 1, amount];
  }
}

function localMidnight(time: number): number {
  const date = new Date(time);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
function sourceDate(value: string): number | null {
  const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : localMidnight(date.getTime());
}

/** Source 2e2c.O: Sunday-start weeks, local calendar months/years, inclusive dates. */
export function sourceModifiedRange(value: string, now = Date.now()): [number, number] | null {
  const today = localMidnight(now);
  const date = new Date(today);
  const week = today - date.getDay() * DAY;
  switch (value.replace(/\s+/g, " ")) {
    case "today": return [today, today + DAY];
    case "yesterday": return [today - DAY, today];
    case "this week": return [week, week + 7 * DAY];
    case "last week": return [week - 7 * DAY, week];
    case "this month": return [
      new Date(date.getFullYear(), date.getMonth()).getTime(),
      new Date(date.getFullYear(), date.getMonth() + 1).getTime()
    ];
    case "last month": return [
      new Date(date.getFullYear(), date.getMonth() - 1).getTime(),
      new Date(date.getFullYear(), date.getMonth()).getTime()
    ];
    case "this year": return [
      new Date(date.getFullYear(), 0).getTime(),
      new Date(date.getFullYear() + 1, 0).getTime()
    ];
    case "last year": return [
      new Date(date.getFullYear() - 1, 0).getTime(),
      new Date(date.getFullYear(), 0).getTime()
    ];
  }
  const between = value.split("..");
  if (between.length === 2) {
    const from = sourceDate(between[0]);
    const to = sourceDate(between[1]);
    return from !== null && to !== null ? [from, to + DAY] : null;
  }
  const comparison = value.match(/^(>|<)?(.+)$/);
  if (!comparison) return null;
  const found = sourceDate(comparison[2]);
  if (found === null) return null;
  if (comparison[1] === ">") return [found + DAY, Infinity];
  if (comparison[1] === "<") return [-Infinity, found];
  return [found, found + DAY];
}

/** Compile query filters once per search; unknown keys remain literal terms per 2e2c.e. */
export function compileSourceSearch(text: string, now = Date.now()): {
  terms: string[];
  filters: readonly { field: string; value: string; range?: [number, number] }[];
  valid: boolean;
} {
  const parsed = parseSourceSearchText(text);
  const terms = [...parsed.terms];
  const filters: { field: string; value: string; range?: [number, number] }[] = [];
  let valid = true;
  for (const [field, value] of Object.entries(parsed.filters)) {
    if (field === "name") { terms.push(value); continue; }
    if (!["kind", "type", "size", "datemodified"].includes(field)) {
      terms.push(field + ":" + value);
      continue;
    }
    if (field === "kind" && !QUERIED_KINDS.has(value)) valid = false;
    const range = field === "size" ? sourceSizeRange(value)
      : field === "datemodified" ? sourceModifiedRange(value, now) : undefined;
    if ((field === "size" || field === "datemodified") && !range) valid = false;
    filters.push({ field, value, ...(range ? { range } : {}) });
  }
  return { terms, filters, valid };
}

/** Source 2e2c.e/y: apply structured metadata before scoring the filename. */
export function sourceSearchMatch(
  entry: FileEntry, query: ReturnType<typeof compileSourceSearch>,
  matchKind: SourceKindMatcher
): SourceSearchMatch | null {
  if (!query.valid) return null;
  for (const filter of query.filters) {
    if (filter.field === "kind" && !matchKind(entry, filter.value)) return null;
    if (filter.field === "type") {
      if (entry.type === "directory") return null;
      const extension = entry.name.slice(entry.name.lastIndexOf(".") + 1).toLowerCase();
      if (extension !== filter.value.replace(/^\./, "")) return null;
    }
    if (filter.field === "size") {
      if (entry.type === "directory" || !filter.range ||
        !(entry.size > filter.range[0] && entry.size <= filter.range[1])) return null;
    }
    if (filter.field === "datemodified") {
      if (!filter.range || !(entry.mtime >= filter.range[0] && entry.mtime < filter.range[1])) return null;
    }
  }
  const score = scoreSourceFileName(entry.name, query.terms);
  return score ? { score, highlights: sourceSearchHighlights(entry.name, query.terms) } : null;
}
