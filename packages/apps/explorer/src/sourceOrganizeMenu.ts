/**
 * Source Computer toolbar Organize.items from
 * legacy-win7@4e63290/src/modules/apps/computer.js#toolbar().
 *
 * Preserve source order, separator placement and explicitly unavailable actions.
 * Original menu predicates only inspect hasItemSelected for Cut/Copy/Paste/
 * Delete/Rename. This port also checks actual migrated clipboard/trash support
 * (and single-item Rename) before enabling an action we can execute safely.
 */
export const SOURCE_ORGANIZE_DEFINITIONS = [
  { id:"cut", label:"Cut", dividerAfter:false },
  { id:"copy", label:"Copy", dividerAfter:false },
  { id:"paste", label:"Paste", dividerAfter:false },
  { id:"undo", label:"Undo", dividerAfter:false },
  { id:"redo", label:"Redo", dividerAfter:true },
  { id:"select-all", label:"Select all", dividerAfter:false },
  { id:"layout", label:"Layout", dividerAfter:false },
  { id:"folder-and-search-options", label:"Folder and search options", dividerAfter:true },
  { id:"delete", label:"Delete", dividerAfter:false },
  { id:"rename", label:"Rename", dividerAfter:false },
  { id:"remove-properties", label:"Remove properties", dividerAfter:false },
  { id:"properties", label:"Properties", dividerAfter:true },
  { id:"close", label:"Close", dividerAfter:false }
] as const;

export type SourceOrganizeCommand = typeof SOURCE_ORGANIZE_DEFINITIONS[number]["id"];
export interface SourceOrganizeItem {
  id: SourceOrganizeCommand;
  label: string;
  dividerAfter: boolean;
  enabled: boolean;
}

export interface SourceOrganizeState {
  selectedPaths: readonly string[];
  protectedRoots: readonly string[];
  clipboardHasPaths: boolean;
  canMoveToTrash: boolean;
  /** Original bin.js mounts Computer id=bin at the real trashPath. */
  isRecycleBin: boolean;
  recycleBinPath?: string | null;
  canCloseWindow: boolean;
}

export function sourceOrganizeItems(state: SourceOrganizeState): SourceOrganizeItem[] {
  const selected = state.selectedPaths;
  const hasItemSelected = selected.length > 0 &&
    !selected.some(uri => state.protectedRoots.includes(uri));
  // Trash entries carry restore metadata and must not be moved/renamed using
  // normal file operations. Only allow Delete via the existing permanent
  // confirmation; never permit deleting the bin root or an unrelated path.
  const binRoot = state.recycleBinPath?.replace(/\/$/, "");
  const hasSafeBinSelection = state.isRecycleBin && Boolean(binRoot) &&
    selected.length > 0 && selected.every(path => path.startsWith(binRoot + "/"));
  return SOURCE_ORGANIZE_DEFINITIONS.map(def => {
    let enabled = false;
    switch (def.id) {
      case "cut":
      case "copy":
        enabled = !state.isRecycleBin && hasItemSelected;
        break;
      case "paste":
        enabled = !state.isRecycleBin && hasItemSelected && state.clipboardHasPaths;
        break;
      case "delete":
        enabled = state.isRecycleBin ? hasSafeBinSelection
          : hasItemSelected && state.canMoveToTrash;
        break;
      case "rename":
        enabled = !state.isRecycleBin && hasItemSelected && selected.length === 1;
        break;
      case "close":
        enabled = state.canCloseWindow;
        break;
      // Undo/Redo/Select all/Layout/Options/Remove properties/Properties
      // are explicitly disabled by the pinned original Computer menu.
    }
    return { ...def, enabled };
  });
}
