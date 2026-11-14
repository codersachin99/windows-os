import manifest from "./sourceProgramManifest.json";
import { FileStoreError, getParentDirectory, type VirtualFileStore } from "./index";
import { SOURCE_SYSTEM_DISK, SOURCE_GUEST_APPDATA } from "./sourceGuest";

/**
 * Source manifest exported by webpack module c170 in
 * legacy-win7/src/modules/system/testmode.js. Variant is the pinned non-clean
 * Win7 Simu build (15ca.c=false). No apps are claimed implemented by this list.
 */
export interface SourceProgram {
  id: string;
  name: string;
  category: string;
  kind?: string;
  publisher?: string;
  hidden?: boolean;
  aliases?: readonly string[];
  installPath?: string;
  appData?: string;
}
export const sourcePrograms: readonly SourceProgram[] = Object.freeze(
  manifest.programs.map(program => Object.freeze({ ...program }))
);
export const sourceProgramsById = new Map(sourcePrograms.map(p => [p.id, p]));
export const SOURCE_START_MENU_PROGRAMS =
  SOURCE_GUEST_APPDATA + "/WindowsOS/Windows/Start Menu/Programs";

export interface SourceShortcut {
  exe: string;
  icon: string;
}
/** Original source 757f.j()/757f.O(): Shortcut uses exe+icon JSON fields. */
export function sourceShortcut(program: SourceProgram): SourceShortcut {
  return { exe: program.id, icon: program.id };
}
export function parseSourceShortcut(text: string): SourceShortcut | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.exe !== "string" || typeof obj.icon !== "string") return null;
    if (!sourceProgramsById.has(obj.exe)) return null;
    return { exe: obj.exe, icon: obj.icon };
  } catch { return null; }
}
export function sourceShortcutPath(program: SourceProgram): string | null {
  if (!program.installPath) return null;
  const category = program.category === "accessories" ? "Accessories"
    : program.category === "games" ? "Games" : "";
  // Source 757f.w() uses the original localized name, first pipe alternative,
  // and replaces Windows-invalid filename characters.
  const name = program.name.split(" | ")[0].replace(/[\\/:*?"<>|]/g, "").trim();
  const dir = category ? SOURCE_START_MENU_PROGRAMS + "/" + category
    : SOURCE_START_MENU_PROGRAMS;
  return dir + "/" + name + ".lnk";
}
export function sourceExecutablePath(program: SourceProgram): string | null {
  return program.installPath ? SOURCE_SYSTEM_DISK + "/" + program.installPath : null;
}
export function sourceExecutableStub(): Uint8Array {
  const bytes = new Uint8Array(1024);
  bytes[0] = 77; // M
  bytes[1] = 90; // Z
  return bytes;
}
async function ensureFolder(
  store: Pick<VirtualFileStore, "stat" | "mkdir">,
  path: string
): Promise<void> {
  if (path === "/") return;
  await ensureFolder(store, getParentDirectory(path));
  const entry = await store.stat(path);
  if (entry?.type === "file") {
    throw new FileStoreError("ENOTDIR", "Installer directory is occupied: " + path);
  }
  if (!entry) await store.mkdir(path);
}
/**
 * Source 757f and 760d implementation:
 * - derive installed programs from the same c170 source program manifest;
 * - create original executable parent directories and 1024-byte MZ stubs;
 * - create every installed program's .lnk file under source Start Menu paths.
 * Existing user-edited/deleted shortcuts are never overwritten or recreated
 * on a later login. Full installer build upgrades remain a separate task.
 */
export async function installSourceGuestPrograms(
  store: Pick<VirtualFileStore, "stat" | "mkdir" | "write" | "writeBytes">,
  options: { shouldInstall?: boolean } = {}
): Promise<{ installedExecutables: number; installedShortcuts: number }> {
  if (options.shouldInstall === false) return { installedExecutables: 0, installedShortcuts: 0 };
  let installedExecutables = 0;
  let installedShortcuts = 0;
  for (const program of sourcePrograms) {
    const binary = sourceExecutablePath(program);
    const shortcut = sourceShortcutPath(program);
    if (!binary || !shortcut) continue;
    await ensureFolder(store, getParentDirectory(binary));
    if (!await store.stat(binary)) {
      await store.writeBytes(sourceExecutableStub(), binary);
      installedExecutables++;
    }
    await ensureFolder(store, getParentDirectory(shortcut));
    if (!await store.stat(shortcut)) {
      await store.write(JSON.stringify(sourceShortcut(program)), shortcut);
      installedShortcuts++;
    }
  }
  return { installedExecutables, installedShortcuts };
}
