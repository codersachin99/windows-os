import {
  FileStoreError, normalizeFileUri,
  type VirtualFileStore, type FileEntry
} from "./index";
import { transferFiles } from "./transfer";

/**
 * One shell clipboard shared across Explorer windows.
 * Source mapping: computer.js FileCopy / FileMove actions; source paste goes
 * through the shell dispatcher rather than through the browser clipboard.
 * No host file access or implicit overwrite is permitted.
 */
export type ClipboardOperation = "copy" | "cut";
export interface FileClipboardState {
  operation: ClipboardOperation | null;
  paths: string[];
}
export class FileClipboard {
  private state: FileClipboardState = { operation: null, paths: [] };
  private listeners = new Set<(state: FileClipboardState) => void>();

  snapshot(): FileClipboardState {
    return { operation: this.state.operation, paths: [...this.state.paths] };
  }
  subscribe(listener: (state: FileClipboardState) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  private publish(): void {
    const next = this.snapshot();
    for (const listener of this.listeners) {
      try { listener(next); } catch { /* UI cannot undo committed clipboard updates */ }
    }
  }
  prepare(paths: readonly string[], operation: ClipboardOperation): void {
    if (!paths.length) throw new FileStoreError("EINVAL", "No files selected");
    const unique = [...new Set(paths.map(normalizeFileUri))];
    if (unique.includes("/")) throw new FileStoreError("EINVAL", "Root cannot be copied");
    // Dropping nested sources avoids a duplicate move when both parent and child
    // are selected by the explorer.
    this.state = {
      operation,
      paths: unique.filter(path => !unique.some(parent => parent !== path && path.startsWith(parent + "/")))
    };
    this.publish();
  }
  clear(): void {
    this.state = { operation: null, paths: [] };
    this.publish();
  }

  /** Validate every destination before modifying the file store. */
  async paste(files: Pick<VirtualFileStore, "stat" | "copy" | "move">, destination: string): Promise<FileEntry[]> {
    const snapshot = this.snapshot();
    if (!snapshot.operation || !snapshot.paths.length) {
      throw new FileStoreError("EINVAL", "Clipboard is empty");
    }
    const result = await transferFiles(files, snapshot.paths, destination,
      snapshot.operation === "cut" ? "move" : "copy");
    // Cut clears the clipboard only after successful paste; copy remains reusable.
    if (snapshot.operation === "cut") this.clear();
    return result;
  }
}
