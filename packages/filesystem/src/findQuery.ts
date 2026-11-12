import { normalizeFileUri, type FileSearchRequest } from "./index";

/**
 * Original src/modules/apps/find.js 16d5.a constructs a virtual Computer
 * search path from namePattern, scope, subfolders, date, kind and size.
 * Keep that file.path launch contract without allowing a virtual path to enter
 * the real Guest VFS. This adapter is internal, not a host filesystem URI.
 */
export interface SourceFindQuery {
  scope: string;
  namePattern: string;
  subfolders: boolean;
  kind: NonNullable<FileSearchRequest["kind"]> | "";
  date: null | { from: string; to: string } | { days: number } | { months: number };
  size: null | { atLeast: boolean; kb: number };
}
export const SOURCE_FIND_PREFIX = "win7-find:";

export function createSourceFindQuery(scope = "/"): SourceFindQuery {
  return { scope, namePattern: "", subfolders: true, kind: "", date: null, size: null };
}
export function encodeSourceFindPath(query: SourceFindQuery): string {
  return SOURCE_FIND_PREFIX + encodeURIComponent(JSON.stringify(query));
}
export function decodeSourceFindPath(path: string | undefined): SourceFindQuery | null {
  if (!path?.startsWith(SOURCE_FIND_PREFIX)) return null;
  try {
    const value: unknown = JSON.parse(decodeURIComponent(path.slice(SOURCE_FIND_PREFIX.length)));
    if (!value || typeof value !== "object") return null;
    const q = value as Partial<SourceFindQuery>;
    if (typeof q.scope !== "string" || !q.scope.startsWith("/")
      || normalizeFileUri(q.scope) !== q.scope
      || typeof q.namePattern !== "string" || typeof q.subfolders !== "boolean"
      || typeof q.kind !== "string"
      || !["", "folder", "text", "image", "audio", "video", "document",
        "archive", "application"].includes(q.kind)) return null;
    if (q.size !== null && q.size !== undefined &&
      (typeof q.size.atLeast !== "boolean" || !Number.isFinite(q.size.kb)
        || q.size.kb < 0)) return null;
    if (q.date !== null && q.date !== undefined) {
      if ("from" in q.date) {
        if (typeof q.date.from !== "string" || typeof q.date.to !== "string"
          || !/^\d{4}-\d{2}-\d{2}$/.test(q.date.from)
          || !/^\d{4}-\d{2}-\d{2}$/.test(q.date.to)) return null;
      } else if ("days" in q.date) {
        if (!Number.isFinite(q.date.days) || q.date.days < 0) return null;
      } else if ("months" in q.date) {
        if (!Number.isFinite(q.date.months) || q.date.months < 0) return null;
      } else return null;
    }
    return { scope: q.scope, namePattern: q.namePattern, subfolders: q.subfolders,
      kind: q.kind as SourceFindQuery["kind"], date: q.date ?? null, size: q.size ?? null };
  } catch { return null; }
}

function localDate(value: string, end: boolean): number {
  const [year, month, day] = value.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day)
    return Number.NaN;
  return d.getTime() + (end ? 24 * 60 * 60 * 1000 - 1 : 0);
}

/** Source 16d5.a resolves relative dates against the moment Find Now is clicked. */
export function sourceFindSearchRequest(query: SourceFindQuery, now = Date.now()): FileSearchRequest {
  const request: FileSearchRequest = {
    scope: query.scope, sourceNamePattern: query.namePattern,
    subfolders: query.subfolders, kind: query.kind || undefined
  };
  if (query.size) {
    const bytes = Math.max(0, query.size.kb) * 1024;
    if (query.size.atLeast) request.minSizeBytes = bytes;
    else request.maxSizeBytes = bytes;
  }
  if (query.date) {
    let from: number;
    let to: number;
    if ("from" in query.date) {
      from = localDate(query.date.from, false);
      to = localDate(query.date.to, true);
    } else {
      const current = new Date(now);
      const start = new Date(current.getFullYear(),
        current.getMonth() - ("months" in query.date ? query.date.months : 0),
        current.getDate() - ("days" in query.date ? query.date.days : 0));
      from = start.getTime();
      to = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1).getTime() - 1;
    }
    request.modifiedAfter = Number.isFinite(from) ? from : Number.POSITIVE_INFINITY;
    request.modifiedBefore = Number.isFinite(to) ? to : Number.NEGATIVE_INFINITY;
  }
  return request;
}
