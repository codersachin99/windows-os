import { getFileName, type VirtualFileStore } from "@windows-os/filesystem";

/**
 * Native React Notepad document engine, ported from
 * legacy-win7/src/modules/apps/notepad.js (pinned source SHA in migration docs).
 *
 * Source features not covered here: CodeMirror editing UI, visual menubar,
 * font/open/save dialogs and window-close controls. This class supplies
 * their source-equivalent state and file operations, not a replacement UI.
 */
export interface NotepadFont {
  font: string;
  size: number;
  style: string;
}
export interface NotepadDocumentState {
  fileName: string;
  path: string | null;
  content: string;
  initial: { fileName: string; content: string };
  isChanged: boolean;
  cursor: [line: number, column: number];
  font: NotepadFont;
  isWrapped: boolean;
  isStatusVisible: boolean;
}
export type NotepadStorage = Pick<VirtualFileStore, "read" | "write" | "getParentDirectory">;

export const SOURCE_NOTEPAD_DEFAULT_FONT: Readonly<NotepadFont> = Object.freeze({
  font: "'lucida console',monospace",
  size: 10,
  style: "normal,normal"
});

export function formatNotepadDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return pad(date.getHours()) + ":" + pad(date.getMinutes())
    + " " + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
}

export class NotepadDocument {
  private readonly untitled: string;
  private readonly listeners = new Set<(state: NotepadDocumentState) => void>();
  private state: NotepadDocumentState;

  constructor(private readonly filesystem: NotepadStorage, options: {
    untitled?: string; font?: Partial<NotepadFont>;
    wrap?: boolean; status?: boolean
  } = {}) {
    this.untitled = options.untitled ?? "Untitled";
    this.state = {
      fileName: this.untitled, path: null, content: "",
      initial: { fileName: this.untitled, content: "" },
      isChanged: false, cursor: [1, 1],
      font: { ...SOURCE_NOTEPAD_DEFAULT_FONT, ...options.font },
      isWrapped: options.wrap ?? false,
      isStatusVisible: options.status ?? true
    };
  }

  snapshot(): NotepadDocumentState {
    return {
      ...this.state,
      initial: { ...this.state.initial },
      cursor: [...this.state.cursor],
      font: { ...this.state.font }
    };
  }

  subscribe(listener: (state: NotepadDocumentState) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private emit(): void {
    const current = this.snapshot();
    for (const listener of this.listeners) {
      try { listener(current); } catch {
        // A React subscriber cannot turn a completed save into an error.
      }
    }
  }

  title(): string {
    return (this.state.isChanged ? "*" : "") + this.state.fileName + " - Notepad";
  }

  /** Original handleChange compares the editor content to the last saved content. */
  changeContent(content: string): void {
    this.state.content = content;
    this.state.isChanged = content !== this.state.initial.content;
    this.emit();
  }

  changeCursor(line: number, column: number): void {
    this.state.cursor = [line, column];
    this.emit();
  }

  setFont(value: Partial<NotepadFont>): void {
    this.state.font = { ...this.state.font, ...value };
    this.emit();
  }
  setWordWrap(value: boolean): void {
    this.state.isWrapped = value;
    this.emit();
  }
  setStatusVisible(value: boolean): void {
    this.state.isStatusVisible = value;
    this.emit();
  }

  /**
   * Source create() resets initial/content/title but does not clear path.
   * Keep this quirk until parity tests establish intended behavior.
   */
  create(): void {
    this.state.initial = { fileName: this.untitled, content: "" };
    this.state.fileName = this.untitled;
    this.state.content = "";
    this.state.isChanged = false;
    this.emit();
  }

  async open(path: string): Promise<void> {
    // Source only updates document metadata after read succeeds.
    const content = await this.filesystem.read(path, true);
    const name = getFileName(path);
    this.state.content = content;
    this.state.fileName = name;
    this.state.initial = { fileName: name, content };
    this.state.path = path;
    this.state.isChanged = false;
    this.emit();
  }

  /**
   * Source save() launches the Save As dialog when no path exists.
   * The UI must handle "save-as-required" by opening the original dialog.
   */
  async save(): Promise<"saved" | "save-as-required"> {
    if (!this.state.path) return "save-as-required";
    await this.filesystem.write(this.state.content, this.state.path);
    this.afterSave();
    return "saved";
  }

  saveAsLocation(): string | null {
    return this.state.path ? this.filesystem.getParentDirectory(this.state.path) : null;
  }

  /** Called when the source-style Save dialog confirms its path/overwrite. */
  async saveAs(path: string): Promise<void> {
    await this.filesystem.write(this.state.content, path);
    this.state.path = path;
    this.state.fileName = getFileName(path);
    this.afterSave();
  }

  requestClose(): "confirm-save" | "close" {
    return this.state.isChanged ? "confirm-save" : "close";
  }

  private afterSave(): void {
    this.state.initial = {
      fileName: this.state.fileName,
      content: this.state.content
    };
    this.state.isChanged = false;
    this.emit();
  }
}
