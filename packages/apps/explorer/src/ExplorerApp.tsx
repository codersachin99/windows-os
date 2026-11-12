import { useEffect, useMemo, useState, type FormEvent } from "react";
import { legacyArt } from "@windows-os/assets";
import { fileClipboard, fileStore } from "@windows-os/sdk";
import { ExplorerSession, type ExplorerViewMode } from "./model";
import "./source.css";
import "./ExplorerApp.css";

interface ExplorerAppProps {
  onOpenTextFile(path: string): void;
}
const viewOptions: { value: ExplorerViewMode; label: string }[] = [
  { value: "details", label: "Details" },
  { value: "list", label: "List" },
  { value: "small-icons", label: "Small icons" },
  { value: "medium-icons", label: "Medium icons" },
  { value: "large-icons", label: "Large icons" },
  { value: "tiles", label: "Tiles" },
  { value: "content", label: "Content" }
];

/**
 * Native Explorer's first connected folder/navigation slice, mapped to the
 * original Computer session/view model. Source disks, shell actions, drag/drop
 * and trash semantics are still pending and intentionally not fabricated.
 */
export function ExplorerApp({ onOpenTextFile }: ExplorerAppProps) {
  const session = useMemo(() => new ExplorerSession(fileStore), []);
  const [state, setState] = useState(() => session.snapshot());
  const [prompt, setPrompt] = useState<"folder" | "rename" | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [clipboardState, setClipboardState] = useState(() => fileClipboard.snapshot());
  useEffect(() => {
    const unsubscribe = session.subscribe(setState);
    const disconnect = session.connect();
    void session.refresh();
    return () => { unsubscribe(); disconnect(); };
  }, [session]);
  useEffect(() => fileClipboard.subscribe(setClipboardState), []);
  const visible = session.visible();
  const selected = state.items.find(item => item.uri === state.selected[0]);

  const execute = async (operation: () => Promise<unknown>) => {
    setMessage("");
    try { await operation(); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "File operation failed"); }
  };
  const openEntry = (path: string, type: "directory" | "file") => {
    if (type === "directory") {
      void execute(() => session.open(path));
    } else if (/\.txt$/i.test(path)) {
      onOpenTextFile(path);
    } else {
      setMessage("No original application association has been migrated for this file type.");
    }
  };

  const submitPrompt = (event: FormEvent) => {
    event.preventDefault();
    const text = name.trim();
    void execute(async () => {
      if (prompt === "folder") await session.createFolder(text);
      else if (prompt === "rename" && selected) await session.rename(selected.uri, text);
      setPrompt(null);
      setName("");
    });
  };
  const copySelection = (mode: "cut" | "copy") => {
    if (!state.selected.length) return;
    fileClipboard.prepare(state.selected, mode);
  };
  const pasteSelection = () => void execute(async () => {
    await fileClipboard.paste(fileStore, state.path);
  });
  const handleKeys = (event: import("react").KeyboardEvent<HTMLDivElement>) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    const focused = event.target as HTMLElement;
    if (focused.closest("input,textarea,select,[contenteditable=true]")) return;
    if (event.key.toLowerCase() === "c" && state.selected.length) {
      event.preventDefault(); copySelection("copy");
    } else if (event.key.toLowerCase() === "x" && state.selected.length) {
      event.preventDefault(); copySelection("cut");
    } else if (event.key.toLowerCase() === "v" && clipboardState.paths.length) {
      event.preventDefault(); pasteSelection();
    } else if (event.key.toLowerCase() === "a") {
      event.preventDefault(); session.selectAll();
    }
  };
  const requestRename = () => {
    if (!selected) return;
    setName(selected.name);
    setPrompt("rename");
  };

  return <div className="windows-explorer explorer-stage" data-test-explorer="" onKeyDown={handleKeys}>
    <div className="explorer-address">
      <button aria-label="Back" disabled={!state.canGoBack} onClick={() => void execute(() => session.back())}>◀</button>
      <button aria-label="Forward" disabled={!state.canGoForward} onClick={() => void execute(() => session.forward())}>▶</button>
      <button aria-label="Up" disabled={state.path === "/"} onClick={() => void execute(() => session.up())}>↑</button>
      <label className="explorer-address__location">Address:
        <input aria-label="Folder address" readOnly value={state.path === "/" ? "Computer" : state.path} />
      </label>
      <input className="explorer-address__search" type="search"
        placeholder="Search" aria-label="Search files" value={state.search}
        onChange={event => session.search(event.target.value)} />
    </div>
    <div className="explorer-command">
      <button disabled title="Source Organize menu is pending">Organize</button>
      <button onClick={() => { setName(""); setPrompt("folder"); }}>New folder</button>
      <button onClick={requestRename} disabled={state.selected.length !== 1}>Rename</button>
      <button disabled={!state.selected.length} onClick={() => copySelection("cut")}>Cut</button>
      <button disabled={!state.selected.length} onClick={() => copySelection("copy")}>Copy</button>
      <button disabled={!clipboardState.paths.length} onClick={pasteSelection}>Paste</button>
      <button disabled title="Requires source Recycle Bin protocol">Delete</button>
      <button onClick={() => void execute(() => session.refresh())}>Refresh</button>
      <label>View:
        <select aria-label="Explorer view" value={state.viewMode}
          onChange={event => session.setViewMode(event.target.value as ExplorerViewMode)}>
          {viewOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    </div>
    <div className="explorer-workspace">
      <aside className="explorer-navigation">
        <button className="explorer-navigation__home" onClick={() => void execute(() => session.open("/"))}>
          <img src={legacyArt.computer} alt="" /> Computer
        </button>
      </aside>
      <section className="explorer-content" aria-label="Folder contents">
        {state.viewMode === "details" && <div className="explorer-columns" aria-hidden="true">
          <span>Name</span><span>Date modified</span><span>Type</span><span>Size</span>
        </div>}
        <div className={"listview__view explorer-list " +
          (state.viewMode.includes("icons") ? "has-icons is-" + state.viewMode.split("-")[0] :
          state.viewMode === "tiles" ? "has-tiles" :
          state.viewMode === "content" ? "has-content" : "has-" + state.viewMode)}>
          {visible.map(item => <button key={item.uri} type="button" className={"listview__item explorer-item " +
            (state.selected.includes(item.uri) ? "is-selected" : "")}
            data-test-explorer-item={item.name} aria-label={item.name}
            onClick={event => session.select(item.uri, event.ctrlKey || event.metaKey)}
            onDoubleClick={() => openEntry(item.uri, item.type)}
            onKeyDown={event => { if (event.key === "Enter") openEntry(item.uri, item.type); }}>
            <span className="listview__item-iconbox">
              <img src={item.type === "directory" ? legacyArt.folder : legacyArt.file} alt="" draggable={false} />
            </span>
            <span className="listview__item-label">{item.name}</span>
            {state.viewMode === "details" && <>
              <span>{new Date(item.mtime).toLocaleString()}</span>
              <span>{item.type === "directory" ? "File folder" : "TXT File"}</span>
              <span>{item.type === "directory" ? "" : item.size + " B"}</span>
            </>}
          </button>)}
          {!state.busy && !visible.length && <p className="explorer-empty">
            {state.search ? "No items match your search." : "This folder is empty."}
          </p>}
        </div>
        {state.busy && <p className="explorer-empty">Loading...</p>}
      </section>
    </div>
    <footer className="explorer-status">{visible.length} {visible.length === 1 ? "item" : "items"}
      {state.selected.length > 0 && " — " + state.selected.length + " selected"}
      {clipboardState.paths.length > 0 && " — " + clipboardState.operation + " " + clipboardState.paths.length}
    </footer>
    {(state.error || message) && <div role="alert" className="explorer-error">
      {state.error || message}
      <button aria-label="Dismiss Explorer message" onClick={() => setMessage("")}>×</button>
    </div>}
    {prompt && <div className="explorer-prompt__backdrop">
      <form className="explorer-prompt" role="dialog" aria-label={prompt === "folder" ? "New folder" : "Rename"}
        onSubmit={submitPrompt}>
        <label htmlFor="explorer-name">{prompt === "folder" ? "New folder name" : "Rename item"}</label>
        <input id="explorer-name" autoFocus value={name} onChange={event => setName(event.target.value)} />
        <div>
          <button type="submit">OK</button>
          <button type="button" onClick={() => setPrompt(null)}>Cancel</button>
        </div>
      </form>
    </div>}
  </div>;
}
