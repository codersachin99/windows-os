import { useEffect, useState, type FormEvent } from "react";
import { getParentDirectory, getFileName, type VirtualFileStore, type FileEntry } from "@windows-os/filesystem";
import "./VirtualFileDialog.css";

export interface VirtualFileDialogProps {
  fileStore: VirtualFileStore;
  mode: "open" | "save";
  initialDirectory?: string | null;
  suggestedName?: string;
  /** Original source dialog-save accepts an app-specific extension map. */
  fileTypes?: ReadonlyArray<{ extension: string; label: string }>;
  onCancel(): void;
  onSelected(path: string): Promise<void> | void;
}

/** Virtual file dialog shared by document apps; never opens host OS files. */
const DEFAULT_SAVE_TYPES = [
  { extension: "txt", label: "Text Documents (*.txt)" },
  { extension: "html", label: "HTML Documents (*.html; *.htm)" }
] as const;

export function VirtualFileDialog({ fileStore, mode, initialDirectory,
  suggestedName = "", fileTypes = DEFAULT_SAVE_TYPES,
  onCancel, onSelected }: VirtualFileDialogProps) {
  const [directory, setDirectory] = useState(initialDirectory || "/");
  const [items, setItems] = useState<FileEntry[]>([]);
  const [name, setName] = useState(suggestedName);
  const [extension, setExtension] = useState(fileTypes[0]?.extension ?? "txt");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [overwrite, setOverwrite] = useState<string | null>(null);
  const [folderPrompt, setFolderPrompt] = useState(false);
  const [folderName, setFolderName] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const listed = await fileStore.list(directory);
        if (alive) { setItems(listed); setError(""); }
      } catch (cause) {
        if (alive) setError(cause instanceof Error ? cause.message : "Cannot list folder");
      }
    };
    void load();
    const unsubscribe = fileStore.subscribe(() => { void load(); });
    return () => { alive = false; unsubscribe(); };
  }, [fileStore, directory]);

  const navigate = (path: string) => {
    setDirectory(path);
    setName("");
    setOverwrite(null);
    setError("");
  };
  const join = (file: string) => (directory === "/" ? "" : directory) + "/" + file;
  const validName = (file: string) =>
    file !== "" && file !== "." && file !== ".." && !/[/\\\0]/.test(file);

  const choose = async (file = name, confirmed = false) => {
    const base = file.trim();
    if (!validName(base)) { setError("Enter a valid file name."); return; }
    const actual = mode === "save" && !/\.[^.]+$/.test(base) ? base + "." + extension : base;
    const path = join(actual);
    setBusy(true);
    try {
      const existing = await fileStore.stat(path);
      if (mode === "open" && existing?.type !== "file") throw new Error("File not found");
      if (mode === "save" && existing?.type === "directory") throw new Error("A folder has that name");
      if (mode === "save" && existing && !confirmed) { setOverwrite(path); return; }
      await onSelected(path);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Operation failed");
    } finally { setBusy(false); }
  };

  const createFolder = async (event: FormEvent) => {
    event.preventDefault();
    if (!validName(folderName.trim())) { setError("Enter a valid folder name."); return; }
    setBusy(true);
    try {
      await fileStore.mkdir(join(folderName.trim()));
      setFolderPrompt(false);
      setFolderName("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create folder");
    } finally { setBusy(false); }
  };

  return <div className="vfs-dialog__overlay">
    <section role="dialog" aria-modal="true" data-test-file-dialog={mode}
      aria-label={mode === "open" ? "Open" : "Save As"} className="vfs-dialog">
      <header className="vfs-dialog__title">
        <span>{mode === "open" ? "Open" : "Save As"}</span>
        <button onClick={onCancel} aria-label="Close file dialog">×</button>
      </header>
      <div className="vfs-dialog__address">
        <button disabled={directory === "/" || busy} onClick={() => navigate(getParentDirectory(directory))}
          aria-label="Up one level">↑</button>
        <label>Look in: <input aria-label="Current folder" value={directory} readOnly /></label>
        <button onClick={() => setFolderPrompt(true)} disabled={busy}>New folder</button>
      </div>
      <div className="vfs-dialog__files" aria-label="Files and folders">
        {items.map(item => <button type="button" key={item.uri} className="vfs-dialog__file"
          aria-label={(item.type === "directory" ? "Folder " : "File ") + item.name}
          onClick={() => item.type === "directory" ? navigate(item.uri) : setName(item.name)}
          onDoubleClick={() => { if (item.type === "directory") navigate(item.uri); else if (mode === "open") void choose(item.name); }}>
          <span aria-hidden="true">{item.type === "directory" ? "▣" : "▤"}</span>
          <span>{item.name}</span>
        </button>)}
        {!items.length && <p className="vfs-dialog__empty">This folder is empty.</p>}
      </div>
      <form onSubmit={event => { event.preventDefault(); void choose(); }}>
        <div className="vfs-dialog__field">
          <label htmlFor="vfs-file-name">File name:</label>
          <input id="vfs-file-name" autoFocus value={name} onChange={event => setName(event.target.value)} />
        </div>
        {mode === "save" && <div className="vfs-dialog__field">
          <label htmlFor="vfs-file-type">Save as type:</label>
          <select id="vfs-file-type" value={extension} onChange={event => setExtension(event.target.value)}>
            {fileTypes.map(fileType => <option key={fileType.extension} value={fileType.extension}>
              {fileType.label}
            </option>)}
          </select>
        </div>}
        {error && <p className="vfs-dialog__error" role="alert">{error}</p>}
        <div className="vfs-dialog__actions">
          <button type="submit" disabled={busy}>{mode === "open" ? "Open" : "Save"}</button>
          <button type="button" disabled={busy} onClick={onCancel}>Cancel</button>
        </div>
      </form>
      {overwrite && <div className="vfs-dialog__confirm" role="alertdialog" aria-modal="true"
        aria-label="Confirm replace">
        <p>{getFileName(overwrite)} already exists. Replace it?</p>
        <button disabled={busy} onClick={() => { setOverwrite(null); void choose(getFileName(overwrite), true); }}>Yes</button>
        <button onClick={() => setOverwrite(null)}>No</button>
      </div>}
      {folderPrompt && <form className="vfs-dialog__confirm" onSubmit={event => void createFolder(event)}>
        <label htmlFor="vfs-folder-name">New folder name</label>
        <input id="vfs-folder-name" autoFocus value={folderName} onChange={event => setFolderName(event.target.value)} />
        <button type="submit" disabled={busy}>Create</button>
        <button type="button" onClick={() => setFolderPrompt(false)}>Cancel</button>
      </form>}
    </section>
  </div>;
}
