import { sourcePrograms, type SourceProgram } from "@windows-os/filesystem";

/**
 * Pinned source src/modules/apps/run.js resolves the entered command through
 * the original program lookup (module 2636), then opens that shell program.
 * Reuse the pinned c170 source program IDs, explicit aliases and original
 * installed executable paths. Do not interpret arbitrary shell commands,
 * browse host files or treat unported apps as successfully launched.
 */
export function resolveSourceRunCommand(raw: string): SourceProgram | null {
  if (!raw || raw.includes("\0")) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const command = (trimmed.startsWith('"') && trimmed.endsWith('"')
    ? trimmed.slice(1, -1) : trimmed).trim().replace(/\\/g, "/").toLocaleLowerCase();
  if (!command || command.includes("\0")) return null;

  // A drive-qualified command must match one explicit installed executable.
  // No host-process access, traversal, arbitrary URI/URL, or filesystem probing.
  const drive = command.match(/^([a-z]):\/(.*)$/);
  if (drive && drive[1] !== "c") return null;
  const normalizedPath = drive ? drive[2] : command;
  const isPath = normalizedPath.includes("/") || command.includes(":");

  for (const program of sourcePrograms) {
    const installed = program.installPath?.replace(/\\/g, "/").toLocaleLowerCase();
    if (isPath) {
      if (installed && normalizedPath === installed) return program;
      continue;
    }
    if (command === program.id.toLocaleLowerCase()) return program;
    if (program.aliases?.some(alias => alias.toLocaleLowerCase() === command)) return program;
    if (!installed) continue;
    const executable = installed.slice(installed.lastIndexOf("/") + 1);
    const withoutExtension = executable.replace(/\.(exe|cpl)$/i, "");
    if (command === executable || command === withoutExtension) return program;
  }
  return null;
}
