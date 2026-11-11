/**
 * Adapt source CMD's Windows drive letters to Explorer's slash-separated URIs.
 * Ported from legacy-win7/src/modules/apps/cmd.js functions m,g,y,w,v,x,k,E.
 * No drive is fabricated: caller must supply getStats-derived mount metadata.
 */
export interface LegacyDrive {
  letter: string;
  path: string;
  label?: string;
  size?: number;
  used?: number;
}
export interface LegacyPathConfig {
  root: string;
  drives: readonly LegacyDrive[];
  user?: { folder: string; name: string };
}
export interface LegacyDriveStats {
  letter?: string;
  path?: string;
  label?: string;
  size?: number;
  used?: number;
}
export function drivesFromLegacyStats(stats: readonly LegacyDriveStats[]): LegacyDrive[] {
  return stats.filter(d => Boolean(d.path && d.letter)).map(d => ({
    letter: (d.letter as string).toUpperCase(),
    path: (d.path as string).split("/").filter(Boolean).pop() ?? "",
    label: d.label ?? "", size: d.size ?? 0, used: d.used ?? 0
  }));
}
export function parseWindowsPath(path: string): {
  letter: string | null; segments: string[]; rooted: boolean
} {
  const value = String(path || "").replace(/\//g, "\\");
  const match = /^([a-z]):/i.exec(value);
  const body = match ? value.slice(2) : value;
  return {
    letter: match ? match[1].toUpperCase() : null,
    segments: body.split("\\").filter(Boolean),
    rooted: body.startsWith("\\")
  };
}
function cleaned(parts: string[]): string[] {
  const out: string[] = [];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return out;
}
export function windowsPath(letter: string, segments: readonly string[]): string {
  return letter.toUpperCase() + ":\\" + segments.join("\\");
}
export function resolveWindowsPath(
  path: string,
  options: { cwd: string; driveCwd?: Readonly<Record<string, string>> }
): string {
  const current = parseWindowsPath(options.cwd);
  const requested = parseWindowsPath(path);
  const letter = requested.letter ?? current.letter;
  if (!letter) throw new Error("Current Windows drive is not configured");
  let base = current.segments;
  if (requested.letter && requested.letter !== current.letter) {
    base = parseWindowsPath(options.driveCwd?.[requested.letter] ?? "").segments;
  }
  return windowsPath(letter, cleaned(requested.rooted
    ? requested.segments : [...base, ...requested.segments]));
}
function switchUser(parts: string[], from?: string, to?: string): string[] {
  if (!from || !to || parts.length < 2
    || parts[0].toLowerCase() !== "users"
    || parts[1].toLowerCase() !== from.toLowerCase()) return parts;
  return [parts[0], to, ...parts.slice(2)];
}
export function toStorageUri(path: string, config: LegacyPathConfig): string | null {
  const { letter, segments } = parseWindowsPath(path);
  const drive = letter && config.drives.find(d => d.letter.toUpperCase() === letter);
  if (!drive) return null;
  const translated = switchUser(segments, config.user?.name, config.user?.folder);
  return [config.root.replace(/\/+$/, ""), drive.path, ...translated].join("/");
}
export function fromStorageUri(uri: string, config: LegacyPathConfig): string | null {
  const parts = String(uri || "").split("/").filter(Boolean);
  const rootParts = config.root.split("/").filter(Boolean);
  // No accidental mapping of unrelated mount roots.
  if (rootParts.some((part, i) => parts[i] !== part)) return null;
  const [mount, ...remaining] = parts.slice(rootParts.length);
  const drive = config.drives.find(d => d.path === mount);
  if (!drive) return null;
  return windowsPath(drive.letter,
    switchUser(remaining, config.user?.folder, config.user?.name));
}
export function windowsParentDirectory(path: string): string {
  const parsed = parseWindowsPath(path);
  if (!parsed.letter) throw new Error("Windows drive is required");
  return windowsPath(parsed.letter, parsed.segments.slice(0, -1));
}
export function windowsFileName(path: string): string {
  const parts = parseWindowsPath(path).segments;
  return parts[parts.length - 1] ?? "";
}
