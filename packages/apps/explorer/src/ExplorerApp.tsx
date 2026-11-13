import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from "react";
import { legacyArt } from "@windows-os/assets";
import {
  searchFiles, SourceSearchIndex, decodeSourceFindPath, decodeSourceSearchPath, sourceFindSearchRequest,
  sourceMountedSearchRoots,
  parseSourceShortcut, sourcePrograms,
  importDroppedFiles, SHELL_DRAG_TYPE,
  sourceExecutablePath, SOURCE_START_MENU_PROGRAMS,
  SOURCE_COMPUTER_ROOT, SOURCE_GUEST_PROFILE,
  type FileEntry, type SourceSearchHighlight
} from "@windows-os/filesystem";
import { fileClipboard, fileDragSession, fileStore, sourceFilesystemRuntime } from "@windows-os/sdk";
import { ExplorerSession, type ExplorerViewMode } from "./model";
import { SearchDialog } from "@windows-os/apps/search-dialog";
import { SearchCompanion } from "@windows-os/apps/search-companion";
import { sourceExplorerSearchStyle } from "./searchStyle";
import type { ThemeId } from "@windows-os/contracts";
import type { SourceFindQuery } from "@windows-os/filesystem";
import "./source.css";
import "./ExplorerApp.css";

interface ExplorerAppProps {
  onOpenTextFile(path: string): void;
  onLaunchSourceProgram?(programId: string): boolean;
  initialPath?: string;
  recycleBinPath?: string;
  onOpenFind?(scope: string): void;
  theme?: ThemeId;
}
/** Source 2e2c.w merge offsets; never interpolate filename text as HTML. */
function sourceMarkedName(name: string, ranges: readonly SourceSearchHighlight[] | undefined): ReactNode {
  if (!ranges?.length) return name;
  const parts: ReactNode[] = [];
  let from = 0;
  for (const { start, end } of ranges) {
    if (start < from || end > name.length || start >= end) continue;
    if (start > from) parts.push(name.slice(from, start));
    parts.push(<mark key={start} className="explorer-search-mark">{name.slice(start, end)}</mark>);
    from = end;
  }
  if (from < name.length) parts.push(name.slice(from));
  return parts;
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
export function ExplorerApp({
  onOpenTextFile, onLaunchSourceProgram, initialPath, recycleBinPath, onOpenFind,
  theme = "win7"
}: ExplorerAppProps) {
  const classicSearchStyle = sourceExplorerSearchStyle(theme);
  const isBin = Boolean(recycleBinPath);
  const initialFind = useMemo(() => decodeSourceFindPath(initialPath), [initialPath]);
  const initialSourceSearch = useMemo(() => decodeSourceSearchPath(initialPath), [initialPath]);
  // Original shell:search is a virtual URI; route to its guest search scope
  // before constructing ExplorerSession, never normalize it as a file path.
  const startPath = initialSourceSearch
    ? initialSourceSearch.scope || SOURCE_COMPUTER_ROOT
    : initialFind?.scope ?? initialPath;
  const session = useMemo(() => new ExplorerSession(
    fileStore, recycleBinPath ?? startPath ?? "/", recycleBinPath
  ), [startPath, recycleBinPath]);
  // Original Computer owns a per-window listing cache; close it on unmount,
  // not on every search, so repeated Find searches reuse the same index.
  const searchIndex = useMemo(() => new SourceSearchIndex(fileStore), []);
  const [volume, setVolume] = useState(() => sourceFilesystemRuntime.snapshot());
  const trashPath = recycleBinPath ?? volume?.trashPath ?? null;
  const [state, setState] = useState(() => session.snapshot());
  const [prompt, setPrompt] = useState<"folder" | "rename" | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState<"recycle" | "permanent" | "empty" | null>(null);
  const [context, setContext] = useState<{
    kind: "item" | "background"; x: number; y: number; uri?: string
  } | null>(null);
  const [clipboardState, setClipboardState] = useState(() => fileClipboard.snapshot());
  const [subfolders, setSubfolders] = useState(
    initialSourceSearch?.subfolders ?? initialFind?.subfolders ?? false);
  const [namePattern, setNamePattern] = useState(
    initialSourceSearch?.namePattern ?? initialFind?.namePattern ?? "");
  const [found, setFound] = useState<FileEntry[] | null>(null);
  const [foundHighlights, setFoundHighlights] = useState<
    Readonly<Record<string, readonly SourceSearchHighlight[]>>
  >({});
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchTruncated, setSearchTruncated] = useState(false);
  // Original Computer owns the child SearchDialog and inline SearchCompanion.
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showCompanion, setShowCompanion] = useState(false);
  const [pendingSearch, setPendingSearch] = useState<SourceFindQuery | null>(null);
  const [foldersScanned, setFoldersScanned] = useState(0);
  const [searchFraction, setSearchFraction] = useState(0);
  const searchActive = useRef(false);
  const rerunActiveSearch = useRef<() => void>(() => {});
  const currentSearch = useRef<AbortController | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const dragToken = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  useEffect(() => {
    const unsubscribe = session.subscribe(setState);
    const disconnect = session.connect();
    void session.refresh();
    return () => { unsubscribe(); disconnect(); };
  }, [session]);
  useEffect(() => fileClipboard.subscribe(setClipboardState), []);
  useEffect(() => sourceFilesystemRuntime.subscribe(setVolume), []);
  useEffect(() => {
    currentSearch.current?.abort();
    setFound(null);
    setFoundHighlights({});
    setSearchBusy(false);
    setFoldersScanned(0);
    setSearchFraction(0);
    searchActive.current = false;
  }, [state.path, state.search, subfolders, namePattern]);
  useEffect(() => () => {
    currentSearch.current?.abort();
    searchIndex.dispose();
  }, [searchIndex]);
  // A source Computer search refreshes when the indexed directory changes.
  // Invalidation happens before this callback; no stale result is reused.
  useEffect(() => searchIndex.subscribeInvalidation(() => {
    if (searchActive.current) rerunActiveSearch.current();
  }), [searchIndex]);
  const visible = found ?? session.visible();
  const selected = state.items.find(item => item.uri === state.selected[0])
    ?? found?.find(item => item.uri === state.selected[0]);
  const sourceGuest = !isBin && volume?.pathConfig.root === SOURCE_COMPUTER_ROOT;
  const shortcuts = sourceGuest ? [
    { label: "Programs", path: SOURCE_START_MENU_PROGRAMS },
    { label: "Documents", path: SOURCE_GUEST_PROFILE + "/Documents" },
    { label: "Downloads", path: SOURCE_GUEST_PROFILE + "/Downloads" },
    { label: "Pictures", path: SOURCE_GUEST_PROFILE + "/Pictures" },
    { label: "Music", path: SOURCE_GUEST_PROFILE + "/Music" },
    { label: "Videos", path: SOURCE_GUEST_PROFILE + "/Videos" }
  ] : [];

  const execute = async (operation: () => Promise<unknown>) => {
    setMessage("");
    try { await operation(); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "File operation failed"); }
  };
  const openEntry = (path: string, type: "directory" | "file") => {
    if (type === "directory") {
      void execute(() => session.open(path));
    } else if (isBin) {
      setMessage("Restore this item from the Recycle Bin before opening it.");
    } else if (/\.txt$/i.test(path)) {
      onOpenTextFile(path);
    } else if (/\.lnk$/i.test(path)) {
      void execute(async () => {
        const data = parseSourceShortcut(await fileStore.read(path));
        if (!data) throw new Error("The original Windows shortcut data is invalid.");
        if (!onLaunchSourceProgram?.(data.exe)) {
          throw new Error("The original " + (sourcePrograms.find(p => p.id === data.exe)?.name ?? data.exe)
            + " application has not been migrated yet.");
        }
      });
    } else {
      const installed = sourcePrograms.find(program => sourceExecutablePath(program) === path);
      if (installed) {
        if (!onLaunchSourceProgram?.(installed.id)) {
          setMessage("The original " + installed.name + " application has not been migrated yet.");
        }
      } else {
        setMessage("No original application association has been migrated for this file type.");
      }
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
  const requestDelete = () => {
    if (!state.selected.length) return;
    if (isBin) setConfirm("permanent");
    else if (trashPath) setConfirm("recycle");
  };
  const executeDelete = () => {
    const operation = confirm;
    setConfirm(null);
    void execute(async () => {
      if (operation === "empty" && recycleBinPath) {
        await fileStore.emptyTrash(recycleBinPath);
      } else if (operation === "permanent" && recycleBinPath) {
        for (const path of state.selected) await fileStore.removeTree(path);
      } else if (operation === "recycle" && trashPath) {
        for (const path of state.selected) await fileStore.trash(path, trashPath);
      }
    });
  };
  const restoreSelection = () => {
    if (!recycleBinPath) return;
    void execute(async () => {
      for (const path of state.selected) await fileStore.restore(path, recycleBinPath);
    });
  };
  const copySelection = (mode: "cut" | "copy") => {
    if (!state.selected.length) return;
    fileClipboard.prepare(state.selected, mode);
  };
  const pasteSelection = () => void execute(async () => {
    await fileClipboard.paste(fileStore, state.path);
  });
  /** Native drag state is independent from Cut/Copy clipboard contents. */
  const startDrag = (event: DragEvent<HTMLElement>, uri: string) => {
    if (isBin) { event.preventDefault(); return; }
    const paths = state.selected.includes(uri) ? state.selected : [uri];
    const token = fileDragSession.begin(paths);
    dragToken.current = token;
    event.dataTransfer.setData(SHELL_DRAG_TYPE, token);
    event.dataTransfer.effectAllowed = "copyMove";
    setMessage("");
  };
  const endDrag = () => {
    if (dragToken.current) fileDragSession.end(dragToken.current);
    dragToken.current = null;
    setDropTarget(null);
  };
  const canDrop = (event: DragEvent<HTMLElement>) =>
    !isBin && (Array.from(event.dataTransfer.types).includes(SHELL_DRAG_TYPE)
      || Array.from(event.dataTransfer.types).includes("Files"));
  const overDrop = (event: DragEvent<HTMLElement>, directory: string) => {
    if (!canDrop(event)) return;
    event.preventDefault();
    event.stopPropagation();
    const internal = Array.from(event.dataTransfer.types).includes(SHELL_DRAG_TYPE);
    event.dataTransfer.dropEffect = !internal || event.ctrlKey || event.metaKey
      ? "copy" : "move";
    if (dropTarget !== directory) setDropTarget(directory);
  };
  const dropFiles = (event: DragEvent<HTMLElement>, directory: string) => {
    if (!canDrop(event)) return;
    event.preventDefault();
    event.stopPropagation();
    setDropTarget(null);
    const token = event.dataTransfer.getData(SHELL_DRAG_TYPE);
    const copy = event.ctrlKey || event.metaKey;
    const incoming = Array.from(event.dataTransfer.files);
    void execute(async () => {
      if (token) {
        await fileDragSession.drop(fileStore, token, directory, copy ? "copy" : "move");
      } else if (incoming.length) {
        await importDroppedFiles(fileStore, incoming, directory);
      }
    });
  };
  const upload = (files: FileList | null) => {
    if (!files || isBin) return;
    void execute(() => importDroppedFiles(fileStore, Array.from(files), state.path));
  };
  const handleKeys = (event: import("react").KeyboardEvent<HTMLDivElement>) => {
    const focused = event.target as HTMLElement;
    if (focused.closest("input,textarea,select,[contenteditable=true]")) return;
    if (event.key === "Delete" && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      requestDelete();
      return;
    }
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    if (isBin && event.key.toLowerCase() !== "a") return;
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
  const runSearch = (query?: SourceFindQuery) => {
    searchActive.current = true;
    currentSearch.current?.abort();
    const controller = new AbortController();
    currentSearch.current = controller;
    setSearchBusy(true);
    setFound(null);
    setFoundHighlights({});
    setMessage("");
    setFoldersScanned(0);
    setSearchFraction(0);
    // Blank original in= means actual mounted disk roots; do not search the
    // /EXTERNAL/computer container (which may hold non-disk virtual entries).
    const allMountedDisks = query?.scope === ""
      || (!query && initialSourceSearch?.scope === null);
    void searchFiles(searchIndex, {
      ...(query ? sourceFindSearchRequest({
          ...query, scope: query.scope || state.path
        })
        : initialSourceSearch ? {
            scope: state.path, sourceNamePattern: namePattern,
            subfolders, sourceRanked: true
          }
        : initialFind ? sourceFindSearchRequest({ ...initialFind, scope: state.path, namePattern, subfolders })
        : { scope: state.path, namePattern: namePattern.trim() || null, subfolders }),
      text: query ? state.search : initialSourceSearch
        ? state.search || initialSourceSearch.text : state.search,
      rootScopes: allMountedDisks ? sourceMountedSearchRoots(volume) : undefined,
      maxResults: 500,
      skipPaths: isBin || !trashPath ? [] : [trashPath]
    }, {
      signal: controller.signal,
      onProgress: progress => {
        if (currentSearch.current === controller) {
          setFoldersScanned(progress.foldersScanned);
          setSearchFraction(progress.fraction ?? 0);
        }
      }
    }).then(result => {
      if (currentSearch.current !== controller) return;
      setFound(result.files);
      setFoundHighlights(result.highlights ?? {});
      setSearchTruncated(result.truncated);
    }).catch(cause => {
      if (currentSearch.current !== controller && cause instanceof Error && cause.name === "AbortError") return;
      if (cause instanceof Error && cause.name !== "AbortError") setMessage(cause.message);
    }).finally(() => {
      if (currentSearch.current === controller) {
        currentSearch.current = null;
        setSearchBusy(false);
      }
    });
  };
  rerunActiveSearch.current = () => runSearch();
  const searchInComputer = (query: SourceFindQuery) => {
    setShowSearchDialog(false);
    if (query.scope && query.scope !== state.path) {
      // Preserve source searchFromDialog/openPath parent navigation rather
      // than opening a second shell window as standalone Find does.
      setPendingSearch(query);
      void execute(() => session.open(query.scope));
    } else {
      runSearch(query);
    }
  };
  useEffect(() => {
    if (!pendingSearch || pendingSearch.scope !== state.path) return;
    setPendingSearch(null);
    runSearch(pendingSearch);
  }, [pendingSearch, state.path]);
  // Original Find Now opens a new Computer window directly in search results.
  useEffect(() => {
    if (initialFind || initialSourceSearch) runSearch();
  }, [initialFind, initialSourceSearch]);
  useEffect(() => {
    if (!context) return;
    const dismiss = (event: PointerEvent) => {
      if (!(event.target instanceof Element
        && event.target.closest("[data-test-explorer-context]"))) setContext(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContext(null);
    };
    window.addEventListener("pointerdown", dismiss);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", escape);
    };
  }, [context]);

  const showContext = (
    event: import("react").MouseEvent<HTMLElement>,
    kind: "item" | "background", uri?: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (kind === "item" && uri && !state.selected.includes(uri)) session.select(uri);
    if (kind === "background") session.clearSelection();
    setContext({
      kind, uri,
      x: Math.max(4, Math.min(event.clientX, window.innerWidth - 215)),
      y: Math.max(4, Math.min(event.clientY, window.innerHeight - 280))
    });
  };
  const contextAction = (action: () => void) => {
    setContext(null);
    action();
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
        <input aria-label="Folder address" readOnly value={isBin && state.path === recycleBinPath ? "Recycle Bin" : state.path === "/" ? "Computer" : state.path} />
      </label>
      <input className="explorer-address__search" type="search"
        placeholder="Search" aria-label="Search files" value={state.search}
        onChange={event => session.search(event.target.value)} />
      <button type="button" onClick={() => runSearch()} disabled={searchBusy}
        aria-label="Find files">Find</button>
    </div>
    <div className="explorer-search-controls">
      <label><input type="checkbox" checked={subfolders}
        onChange={event => setSubfolders(event.target.checked)} /> Search subfolders</label>
      <label>File pattern:
        <input aria-label="File name pattern" value={namePattern}
          placeholder="*.txt" onChange={event => setNamePattern(event.target.value)} />
      </label>
      {!isBin && <>
        {classicSearchStyle === "dialog" && <button type="button" aria-label="Search dialog"
          onClick={() => setShowSearchDialog(true)}>Search...</button>}
        {classicSearchStyle === "companion" && <button type="button" aria-label="Search Companion"
          aria-pressed={showCompanion} onClick={() => setShowCompanion(showing => !showing)}>
          Search Companion</button>}
        {onOpenFind && (classicSearchStyle === "find" || classicSearchStyle === null) &&
          <button type="button" aria-label="Advanced Find"
            onClick={() => onOpenFind(state.path)}>
            {classicSearchStyle === "find" ? "Find..." : "Advanced Find..."}</button>}
      </>}
      {found !== null && <button type="button" onClick={() => {
        searchActive.current = false;
        setFound(null); setFoundHighlights({});
      }}>Clear results</button>}
      {found !== null && <span role="status">{found.length} found{searchTruncated ? " (first 500)" : ""}</span>}
      {searchBusy && <span role="status">Searching {foldersScanned} folders...</span>}
      {searchBusy && <progress aria-label="Search progress"
        value={searchFraction} max={1} />}
    </div>
    <div className="explorer-command">
      <button disabled title="Source Organize menu is pending">Organize</button>
      {isBin ? <>
        <button disabled={!selected?.originalPath} onClick={restoreSelection}>Restore</button>
        <button disabled={!state.selected.length} onClick={requestDelete}>Delete permanently</button>
        <button disabled={!state.items.length} onClick={() => setConfirm("empty")}>Empty Recycle Bin</button>
      </> : <>
        <button onClick={() => { setName(""); setPrompt("folder"); }}>New folder</button>
        <button type="button" onClick={() => fileInput.current?.click()}>Upload</button>
        <input ref={fileInput} aria-label="Upload files" type="file" multiple hidden
          onChange={event => {
            upload(event.currentTarget.files);
            event.currentTarget.value = "";
          }} />
        <button onClick={requestRename} disabled={state.selected.length !== 1}>Rename</button>
        <button disabled={!state.selected.length} onClick={() => copySelection("cut")}>Cut</button>
        <button disabled={!state.selected.length} onClick={() => copySelection("copy")}>Copy</button>
        <button disabled={!clipboardState.paths.length} onClick={pasteSelection}>Paste</button>
        <button disabled={!state.selected.length || !trashPath} onClick={requestDelete}
          title={trashPath ? "Move selected items to the Recycle Bin" : "Source trashPath not mounted"}>Delete</button>
      </>}
      <button onClick={() => void execute(() => session.refresh())}>Refresh</button>
      <label>View:
        <select aria-label="Explorer view" value={state.viewMode}
          onChange={event => session.setViewMode(event.target.value as ExplorerViewMode)}>
          {viewOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    </div>
    <div className="explorer-workspace">
      {!isBin && showCompanion ? <SearchCompanion key={state.path}
        initialScope={state.path} initialNamePattern={namePattern}
        onSearch={searchInComputer} onClose={() => setShowCompanion(false)} /> :
      <aside className="explorer-navigation">
        <button className="explorer-navigation__home"
          onClick={() => void execute(() => session.open(recycleBinPath ?? "/"))}>
          <img src={isBin ? legacyArt.recycleBin : legacyArt.computer} alt="" />
          {isBin ? "Recycle Bin" : "Computer"}
        </button>
        {!isBin && volume?.pathConfig.drives.map(drive =>
          <button key={drive.letter} className="explorer-navigation__home"
            onClick={() => void execute(() => session.open(
              volume.pathConfig.root + "/" + drive.path
            ))} title={drive.label + " (" + drive.letter + ":)"}>
            <img src={legacyArt.computer} alt="" />
            {drive.label} ({drive.letter}:)
          </button>
        )}
        {!isBin && volume && <button className="explorer-navigation__home"
          onClick={() => void execute(() => session.open(volume.desktopPath))}>
          <img src={legacyArt.folder} alt="" /> Desktop
        </button>}
        {shortcuts.map(shortcut =>
          <button key={shortcut.label} className="explorer-navigation__home"
            onClick={() => void execute(() => session.open(shortcut.path))}>
            <img src={legacyArt.folder} alt="" /> {shortcut.label}
          </button>
        )}
        {sourceGuest && <button className="explorer-navigation__home" disabled
          title="The source Z: DVD device is not writable or mounted">
          DVD RW Drive (Z:)
        </button>}
      </aside>}
      <section className={"explorer-content" +
          (dropTarget === state.path ? " is-drop-target" : "")}
        data-windows-os-drop-directory={isBin ? undefined : state.path}
        aria-label="Folder contents"
        onDragOver={event => overDrop(event, state.path)}
        onDragLeave={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropTarget(null);
        }}
        onDrop={event => dropFiles(event, state.path)}
        onContextMenu={event => {
          if (!(event.target as HTMLElement).closest(".explorer-item")) {
            showContext(event, "background");
          }
        }}>
        {state.viewMode === "details" && <div className="explorer-columns" aria-hidden="true">
          <span>Name</span><span>Date modified</span><span>Type</span><span>Size</span>
        </div>}
        <div className={"listview__view explorer-list " +
          (state.viewMode.includes("icons") ? "has-icons is-" + state.viewMode.split("-")[0] :
          state.viewMode === "tiles" ? "has-tiles" :
          state.viewMode === "content" ? "has-content" : "has-" + state.viewMode)}>
          {visible.map(item => <button key={item.uri} type="button"
            draggable={!isBin}
            onDragStart={event => startDrag(event, item.uri)}
            onDragEnd={endDrag}
            onDragOver={item.type === "directory" && !isBin
              ? event => overDrop(event, item.uri) : undefined}
            onDragLeave={item.type === "directory" ? () => setDropTarget(null) : undefined}
            onDrop={item.type === "directory" && !isBin
              ? event => dropFiles(event, item.uri) : undefined}
            className={"listview__item explorer-item " +
              (state.selected.includes(item.uri) ? "is-selected " : "") +
              (dropTarget === item.uri ? "is-drop-target" : "")}
            data-test-explorer-item={item.name}
            data-windows-os-drop-directory={!isBin && item.type === "directory" ? item.uri : undefined}
            aria-label={item.name}
            onClick={event => session.select(item.uri, event.ctrlKey || event.metaKey)}
            onContextMenu={event => showContext(event, "item", item.uri)}
            onDoubleClick={() => openEntry(item.uri, item.type)}
            onKeyDown={event => { if (event.key === "Enter") openEntry(item.uri, item.type); }}>
            <span className="listview__item-iconbox">
              <img src={item.type === "directory" ? legacyArt.folder : legacyArt.file} alt="" draggable={false} />
            </span>
            <span className="listview__item-label" title={item.uri}>
              {isBin && item.originalPath ? item.originalPath.split("/").pop()
                : found !== null ? sourceMarkedName(item.name, foundHighlights[item.uri]) : item.name}
            </span>
            {state.viewMode === "details" && <>
              <span>{new Date(item.mtime).toLocaleString()}</span>
              <span>{item.type === "directory" ? "File folder"
                : /\.lnk$/i.test(item.name) ? "Shortcut"
                : /\.exe$/i.test(item.name) ? "Application"
                : /\.cpl$/i.test(item.name) ? "Control Panel Item"
                : /\.txt$/i.test(item.name) ? "Text Document"
                : "File"}</span>
              <span>{item.type === "directory" ? "" : item.size + " B"}</span>
            </>}
          </button>)}
          {!state.busy && !searchBusy && !visible.length && <p className="explorer-empty">
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
    {context && <div role="menu" className="explorer-context-menu"
      data-test-explorer-context={context.kind}
      aria-label={context.kind === "item" ? "File actions" : "Folder actions"}
      style={{ left: context.x, top: context.y }}>
      {context.kind === "item" && context.uri && <>
        <button role="menuitem" onClick={() => contextAction(() => {
          const item = visible.find(entry => entry.uri === context.uri);
          if (item) openEntry(item.uri, item.type);
        })}>{isBin ? "Open folder" : "Open"}</button>
        {isBin
          ? <>
              <button role="menuitem" disabled={!selected?.originalPath}
                onClick={() => contextAction(restoreSelection)}>Restore</button>
              <button role="menuitem"
                onClick={() => contextAction(requestDelete)}>Delete permanently</button>
            </>
          : <>
              <button role="menuitem" onClick={() => contextAction(() => copySelection("cut"))}>Cut</button>
              <button role="menuitem" onClick={() => contextAction(() => copySelection("copy"))}>Copy</button>
              <button role="menuitem" onClick={() => contextAction(requestRename)}>Rename</button>
              <button role="menuitem" disabled={!trashPath}
                onClick={() => contextAction(requestDelete)}>Delete</button>
            </>}
        <button role="menuitem" disabled title="Source Properties dialog is not migrated">Properties</button>
      </>}
      {context.kind === "background" && <>
        {!isBin && <>
          <button role="menuitem" onClick={() => contextAction(pasteSelection)}
            disabled={!clipboardState.paths.length}>Paste</button>
          <button role="menuitem" onClick={() => contextAction(() => {
            setName(""); setPrompt("folder");
          })}>New folder</button>
        </>}
        {isBin && <button role="menuitem" disabled={!state.items.length}
          onClick={() => contextAction(() => setConfirm("empty"))}>Empty Recycle Bin</button>}
        <button role="menuitem" onClick={() => contextAction(
          () => void execute(() => session.refresh())
        )}>Refresh</button>
      </>}
    </div>}
    {showSearchDialog && !isBin && <SearchDialog initialScope={state.path}
      onSearch={searchInComputer} onClose={() => setShowSearchDialog(false)} />}
    {confirm && <div className="explorer-prompt__backdrop">
      <section className="explorer-prompt" role="alertdialog" aria-label="Confirm file operation" aria-modal="true">
        <p>{confirm === "empty" ? "Permanently delete every item in the Recycle Bin?" :
          confirm === "permanent" ? "Permanently delete the selected items?" :
          "Move the selected items to the Recycle Bin?"}</p>
        <div>
          <button type="button" onClick={executeDelete}>Yes</button>
          <button type="button" onClick={() => setConfirm(null)}>No</button>
        </div>
      </section>
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
