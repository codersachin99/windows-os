import { sourcePrograms, sourceProgramsById, type SourceProgram } from "@windows-os/filesystem";

/**
 * Pinned legacy src/modules/shell/shortcutwiz.js lists allProgramItems, not
 * only applications already migrated to React. The local manifest is an
 * inventory of source installed programs, including pending ones. We keep
 * source hidden system utilities off the visible program list except cpanel,
 * which has a dedicated special case in the legacy Finish method.
 */
export const sourceWizardPrograms: readonly SourceProgram[] = Object.freeze(
  sourcePrograms.filter(program => program.installPath
    && (!program.hidden || program.id === "cpanel"))
);

const wizardIds = new Set(sourceWizardPrograms.map(program => program.id));

export function sourceWizardChoice(id: string): SourceProgram | null {
  return wizardIds.has(id) ? sourceProgramsById.get(id) ?? null : null;
}
export function canFinishSourceShortcut(programId: string | null, name: string): boolean {
  return Boolean(programId && sourceWizardChoice(programId) && name.trim());
}
