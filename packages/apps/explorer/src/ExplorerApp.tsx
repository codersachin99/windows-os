import { useEffect, useLayoutEffect, useMemo, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from "react";
import {legacyArt,sourceShellAsset,sourceThemeProgramArt,sourceThemeSpecialFolderArt} from "@windows-os/assets";
import {
  searchFiles, SourceSearchIndex, decodeSourceFindPath, decodeSourceSearchPath, sourceFindSearchRequest,
  sourceMountedSearchRoots,
  parseSourceShortcut, parseSourcePathShortcut,
  createSourcePathDesktopShortcuts, createSourceGuestArchive, sourceCanCompressSelection,
  extractSourceGuestZip, sourceCanExtractGuestZip,
  sourcePrograms, sourceIsShortcutEntry,
  sourceShortcutIconValue,
  readSourceShortcutText,
  importDroppedFiles, SHELL_DRAG_TYPE,
  sourceExecutablePath, SOURCE_START_MENU_PROGRAMS,
  SOURCE_COMPUTER_ROOT, SOURCE_GUEST_PROFILE, SOURCE_WIN2K_START_SEARCH_PATH,
  matchesSourceKind, type FileEntry, type SourceSearchHighlight
} from "@windows-os/filesystem";
import { fileClipboard, fileDragSession, fileStore, sourceFilesystemRuntime,
  SOURCE_FINAL_DESKTOP_MENU_FLAGS } from "@windows-os/sdk";
import { ExplorerSession, type ExplorerViewMode } from "./model";
import { SearchDialog } from "@windows-os/apps/search-dialog";
import { SearchCompanion } from "@windows-os/apps/search-companion";
import { SOURCE_INSTANT_SEARCH_DELAY_MS, sourceExplorerSearchStyle, sourceWin7InstantSearch } from "./searchStyle";
import { SourceAddressProgress } from "./SourceAddressProgress";
import { SourceWin7Navigation, showExplorerUpControl } from "./SourceWin7Navigation";
import { SourceWin7Breadcrumbs } from "./SourceWin7Breadcrumbs";
import { sourceExplorerAddressBreadcrumbs, sourceExplorerSearchPlaceholder } from "./sourceExplorerAddress";
import { sourceOrganizeItems, type SourceOrganizeCommand } from "./sourceOrganizeMenu";
import { SourceOrganizeMenu } from "./SourceOrganizeMenu";
import { SourceViewMenu } from "./SourceViewMenu";
import {SOURCE_VIEW_MODES} from "./sourceViewModes";
import {sourceDesktopMenuPosition} from "@windows-os/ui/menu-position";
import {sourceMenuArrowFocus} from "@windows-os/ui/menu-keyboard";
import {createSourceDesktopItem,type DesktopNewItem} from "@windows-os/ui/desktop-create";
import {
  sourceComputerDetailsLabelWidth,sourceComputerItemExtras,
  SOURCE_COMPUTER_DETAILS_COLUMN_WIDTH
} from "./sourceComputerExtras";
import {sourceComputerIconArtwork,sourceShortcutCustomIconURL} from "./sourceComputerIcons";
import {sourceBinItemMenu,type SourceBinItemAction} from "./sourceBinItemMenu";
import {sourceExplorerItemMenu,sourceExplorerDownloadableItems,
  sourceExplorerSendToMenu,type SourceExplorerItemAction} from "./sourceExplorerItemMenu";
import {sourceExplorerSubmenuPlacement} from "./sourceExplorerSubmenuPlacement";
import { SourceListView, SourceListViewExtra, SourceListViewHeader } from "@windows-os/ui/listview";
import { SourceListViewItem, sourceListItemHighlightParts } from "@windows-os/ui/listitem";
import { SourceListItemRename } from "@windows-os/ui/rename";
import { SourceMessageDialog } from "@windows-os/ui/message";
import type { ThemeId } from "@windows-os/contracts";
import type { SourceFindQuery } from "@windows-os/filesystem";
import "./source.css";
import "./ExplorerApp.css";
import "./sourceExplorerContextTheme.css";
import "./sourceWin10ComputerToolbar.css";
import "./sourceWin8ComputerToolbar.css";
import "./sourceWin31Explorer.css";
import "./sourceWin9xExplorer.css";
import "./sourceLonghornWhistlerExplorer.css";
import "./sourceMacOSExplorer.css";
import "./sourceChromeOSExplorer.css";
import "./sourceUbuntuExplorer.css";
import "./sourceKubuntuExplorer.css";
import "./sourceOxygenExplorer.css";

interface ExplorerAppProps {
  onOpenTextFile(path: string): void;
  onOpenPhotoFile?(path: string): void;
  onOpenMediaFile?(path: string): void;
  onLaunchSourceProgram?(programId: string): boolean;
  initialPath?: string;
  recycleBinPath?: string;
  onOpenFind?(scope: string): void;
  onClose?(): void;
  theme?: ThemeId;
}
/** Source 2e2c.w merge offsets; never interpolate filename text as HTML. */
function sourceMarkedName(name: string, ranges: readonly SourceSearchHighlight[] | undefined): ReactNode {
  if (!ranges?.length) return name;
  // Original webpack 0616 labelParts emits alternating plain/marked spans.
  // Preserve the existing search highlight and safe text rendering.
  const parts = sourceListItemHighlightParts(name,
    ranges.map(({start,end})=>[start,end] as const));
  return parts.map((part,index)=>part.marked
    ? <mark key={index} className="listview__item-highlight explorer-search-mark">{part.text}</mark>
    : part.text);
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
  onOpenTextFile, onOpenPhotoFile, onOpenMediaFile, onLaunchSourceProgram, initialPath, recycleBinPath, onOpenFind,
  onClose, theme = "win7"
}: ExplorerAppProps) {
  const classicSearchStyle = sourceExplorerSearchStyle(theme);
  const isBin = Boolean(recycleBinPath);
  const instantSearch = sourceWin7InstantSearch(theme, isBin);
  const initialFind = useMemo(() => decodeSourceFindPath(initialPath), [initialPath]);
  const initialSourceSearch = useMemo(() => decodeSourceSearchPath(initialPath), [initialPath]);
  // Win2k Start opens an *empty Search Companion*, not an already-run
  // shell:search query or a standard Computer folder window.
  const startWithCompanion=initialPath===SOURCE_WIN2K_START_SEARCH_PATH;
  // Original shell:search is a virtual URI; route to its guest search scope
  // before constructing ExplorerSession, never normalize it as a file path.
  const startPath = startWithCompanion ? SOURCE_COMPUTER_ROOT : initialSourceSearch
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
  const [renamingUri, setRenamingUri] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState<"recycle" | "permanent" | "empty" | null>(null);
  const [context, setContext] = useState<{
    kind:"item"|"background"; x:number;y:number;
    anchorX:number;anchorY:number;viewOpen:boolean;newOpen:boolean;
    sendToOpen:boolean;uri?:string
  }|null>(null);
  const contextRef=useRef<HTMLDivElement>(null);
  const contentRef=useRef<HTMLElement>(null);
  // Both Computer and Bin use real listview item buttons and the
  // focusable folder background as their context-menu anchors.
  const contextReturnFocus=useRef<HTMLElement|null>(null);
  const sendToRef=useRef<HTMLDivElement>(null);
  const backgroundSubmenuRef=useRef<HTMLDivElement>(null);
  // The source BaseMenu re-measures popups against the current viewport.
  // Explorer/Bin previously measured only on open: rotating a phone or
  // resizing desktop Chromium stranded an already-open cascade offscreen.
  // Keep geometry changes separate from context identity and keyboard focus.
  const [contextViewport,setContextViewport]=useState(()=>{
    return {
      width:typeof window==="undefined"?960:window.innerWidth,
      height:typeof window==="undefined"?720:window.innerHeight
    };
  });
  useEffect(()=>{
    if(!context)return;
    const onResize=()=>{
      const width=window.innerWidth,height=window.innerHeight;
      setContextViewport(prev=>prev.width===width&&prev.height===height
        ?prev:{width,height});
    };
    onResize();
    window.addEventListener("resize",onResize);
    return ()=>window.removeEventListener("resize",onResize);
  },[Boolean(context)]);
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
  const [showCompanion, setShowCompanion] = useState(startWithCompanion);
  const [pendingSearch, setPendingSearch] = useState<SourceFindQuery | null>(null);
  const [foldersScanned, setFoldersScanned] = useState(0);
  const [searchFraction, setSearchFraction] = useState(0);
  const searchActive = useRef(false);
  const rerunActiveSearch = useRef<() => void>(() => {});
  const currentSearch = useRef<AbortController | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const dragToken = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [shortcutIcons,setShortcutIcons] = useState<Record<string,string>>({});
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
  useEffect(() => {
    // StrictMode runs a setup/cleanup/setup cycle in development; reconnect
    // after the simulated cleanup rather than leaving Search unsubscribed.
    const disconnect = searchIndex.connect();
    return () => {
      currentSearch.current?.abort();
      disconnect();
    };
  }, [searchIndex]);
  // A source Computer search refreshes when the indexed directory changes.
  // Invalidation happens before this callback; no stale result is reused.
  useEffect(() => searchIndex.subscribeInvalidation(() => {
    if (searchActive.current) rerunActiveSearch.current();
  }), [searchIndex]);
  // Original computer.js 'location' computed: a virtual search path has a
  // single non-clickable result label instead of the real VFS folder trail.
  const showSourceSearchLocation = searchBusy || found !== null;
  const classicSourceSearch = Boolean(initialFind || (initialSourceSearch &&
    initialSourceSearch.namePattern !== null));
  const visible = found ?? session.visible();
  // Stable data signature: icon-map renders do not cause filesystem read loops.
  const sourceShortcutEntries=visible.filter(sourceIsShortcutEntry);
  const sourceShortcutSignature=sourceShortcutEntries.map(item=>
    JSON.stringify([item.uri,item.mtime,item.size])).join("|");
  useEffect(()=>{
    let active=true;
    // Every source theme uses the same .lnk JSON icon field; never suppress
    // source icon discovery solely because the shell skin is XP/Win11.
    if(!sourceShortcutEntries.length){
      setShortcutIcons(current=>Object.keys(current).length?{}:current);
      return;
    }
    void Promise.all(sourceShortcutEntries.map(async item=>{
      try{
        const icon=sourceShortcutIconValue(await readSourceShortcutText(fileStore,item.uri));
        return [item.uri,icon] as const;
      }catch{
        return [item.uri,"file"] as const;
      }
    })).then(entries=>{
      if(!active)return;
      const next:Record<string,string>={};
      for(const [path,icon] of entries)if(icon!==null)next[path]=icon;
      setShortcutIcons(current=>{
        const oldKeys=Object.keys(current),newKeys=Object.keys(next);
        return oldKeys.length===newKeys.length&&
          newKeys.every(key=>current[key]===next[key])?current:next;
      });
    });
    return ()=>{active=false;};
  },[theme,sourceShortcutSignature]);
  // Final pinned Computer source additionally gates touch checkboxes on
  // app.config.json features.showItemCheckboxes, which is false by default.
  const sourceIsTouch = typeof window !== "undefined" && (
    window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0
  );
  const showSourceCheckboxes = theme === "win7" &&
    SOURCE_FINAL_DESKTOP_MENU_FLAGS.showItemCheckboxes &&
    sourceIsTouch && state.selected.length > 0;
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
    // Frozen computer.js open(item): a URI inside this.trashPath is never
    // opened, BEFORE its type dispatch. bin.js hoists the same Explorer to
    // trashPath. Do not let deleted directories bypass this guard and expose
    // recursive browsing of items that have not been restored.
    if (isBin) {
      setMessage("Restore this item from the Recycle Bin before opening it.");
    } else if (type === "directory") {
      void execute(() => session.open(path));
    } else if (/\.txt$/i.test(path)) {
      onOpenTextFile(path);
    } else if (matchesSourceKind({
      uri:path,name:path.split("/").pop() ?? path,type:"file",size:0,mtime:0
    },"picture")) {
      if(onOpenPhotoFile) onOpenPhotoFile(path);
      else setMessage("Windows Photo Viewer is unavailable.");
    } else if (/\.(?:mp3|wav|ogg|oga|m4a|aac|flac|mp4|webm|ogv|mov|m4v|avi)$/i.test(path)) {
      if(onOpenMediaFile) onOpenMediaFile(path);
      else setMessage("Windows Media Player is unavailable.");
    } else if (/\.lnk$/i.test(path)) {
      void execute(async () => {
        const text=await readSourceShortcutText(fileStore,path);
        const target=parseSourcePathShortcut(text);
        if(target){
          const entry=await fileStore.stat(target.path);
          if(!entry||entry.originalPath)
            throw new Error("Shortcut target no longer exists in the Guest filesystem.");
          openEntry(entry.uri,entry.type);
          return;
        }
        const data = parseSourceShortcut(text);
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
  /** Original ExplorerItemMenu Download operates only on eligible file bytes.
   * A directory is not an archive and cannot be downloaded through readBytes.
   * A temporary browser Blob URL never exposes a host filesystem path. */
  const downloadSelectedFiles=(entries:readonly FileEntry[])=>{
    const files=sourceExplorerDownloadableItems(entries);
    void execute(async()=>{
      for(const item of files){
        const bytes=await fileStore.readBytes(item.uri);
        const url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{
          type:"application/octet-stream"
        }));
        try{
          const link=document.createElement("a");
          link.href=url;link.download=item.name;
          document.body.append(link);link.click();link.remove();
        }finally{
          window.setTimeout(()=>URL.revokeObjectURL(url),1000);
        }
      }
    });
  };
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
    if (focused.closest("input,textarea,select,[contenteditable=true],[role=menu]")) return;
    if (event.key === "F2" && !isBin && state.selected.length === 1) {
      event.preventDefault();
      requestRename();
      return;
    }
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
  // Source Computer.search(e) calls delayedSearch.type(e) from
  // window-addressbar-search(instant). Only run a nonempty query; clearing
  // the field returns to real folder breadcrumbs and the original listing.
  // Both Computer and Bin use source webpack 1902's 300ms default delay.
  useEffect(() => {
    if (!instantSearch || !state.search.trim()) return;
    const handle = window.setTimeout(() => rerunActiveSearch.current(), SOURCE_INSTANT_SEARCH_DELAY_MS);
    return () => window.clearTimeout(handle);
  }, [instantSearch, state.search, subfolders, namePattern]);
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
      // The original 252b plugin handles item-context clickout per row.
      // Background context menus retain the existing shared dismissal.
      if (context.kind === "background" && !(event.target instanceof Element
        && event.target.closest("[data-test-explorer-context]"))) setContext(null);
    };
    const escape = (event: KeyboardEvent) => {
      if(event.key!=="Escape")return;
      event.preventDefault();
      setContext(null);
      window.requestAnimationFrame(()=>{
        const origin=contextReturnFocus.current;
        if(origin?.isConnected)origin.focus({preventScroll:true});
        else contentRef.current?.focus({preventScroll:true});
      });
    };
    window.addEventListener("pointerdown", dismiss);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", escape);
    };
  }, [context]);

  // Source ExplorerMenu already supports keyboard roving through its
  // shared menu helper. Enter the root popup on right-click so the
  // existing ArrowUp/Down and child-menu navigation actually work.
  // Never reset focus when a submenu expands or the popup flips sides.
  useLayoutEffect(()=>{
    if(!context||!contextRef.current)return;
    contextRef.current.querySelector<HTMLButtonElement>(
      ':scope > button[role="menuitem"]:not(:disabled)'
    )?.focus({preventScroll:true});
  },[context?.kind,context?.uri,context?.anchorX,context?.anchorY]);

  useLayoutEffect(()=>{
    const element=contextRef.current;
    if(!context||!element)return;
    // Aero's backdrop-filter (and Magnifier's transform) establishes
    // a containing block for position:fixed. Measure the actual screen
    // rectangle, then translate the desired viewport point back into
    // the menu's existing local CSS coordinate system.
    const rect=element.getBoundingClientRect();
    const scaleX=rect.width/element.offsetWidth||1;
    const scaleY=rect.height/element.offsetHeight||1;
    const position=sourceDesktopMenuPosition(
      {x:context.anchorX,y:context.anchorY},
      {width:rect.width,height:rect.height},
      contextViewport);
    const x=context.x+(position.x-rect.left)/scaleX;
    const y=context.y+(position.y-rect.top)/scaleY;
    if(Math.abs(context.x-x)<.5&&Math.abs(context.y-y)<.5)return;
    setContext(current=>current?{...current,x,y}:current);
  },[context,contextViewport]);
  // Source ExplorerMenu's nested BaseMenu is positioned to the side of
  // the row and flips across the desktop edge. Keep it out of the parent
  // flex layout so opening Send to never changes parent item height.
  useLayoutEffect(()=>{
    if(context?.kind!=="item"||!context.sendToOpen)return;
    const parent=contextRef.current,child=sendToRef.current;
    const trigger=parent?.querySelector<HTMLElement>(
      "[data-test-explorer-item-send-to]");
    if(!parent||!child||!trigger)return;
    const a=parent.getBoundingClientRect();
    const b=trigger.getBoundingClientRect();
    const placement=sourceExplorerSubmenuPlacement(
      {left:a.left,top:a.top,width:a.width,height:a.height},
      {top:b.top},{width:child.offsetWidth,height:child.offsetHeight},
      contextViewport);
    child.style.left=placement.left+"px";
    child.style.top=placement.top+"px";
    child.dataset.side=placement.side;
    // On phones neither 205px menu can sit beside the other. When the
    // submenu is stacked above/below the root, the pointer must travel
    // over another root row before it reaches the child. Those rows
    // must not collapse the submenu mid-trajectory.
    child.dataset.cascade=placement.top>=a.height||
      placement.top+child.offsetHeight<=0?"stacked":"adjacent";
  },[context?.kind,context?.sendToOpen,context?.x,context?.y,contextViewport]);
  // The original Computer/Bin background View and Computer New commands use
  // the same separate side-flipping BaseMenu as item Send to. Position it
  // against its trigger after layout, without changing root menu height.
  useLayoutEffect(()=>{
    if(context?.kind!=="background"||(!context.viewOpen&&!context.newOpen))return;
    const parent=contextRef.current,child=backgroundSubmenuRef.current;
    const selector=context.viewOpen?"[data-test-explorer-context-view]":
      "[data-test-explorer-context-new]";
    const trigger=parent?.querySelector<HTMLElement>(selector);
    if(!parent||!child||!trigger)return;
    const bounds=parent.getBoundingClientRect();
    const row=trigger.getBoundingClientRect();
    const placement=sourceExplorerSubmenuPlacement(
      {left:bounds.left,top:bounds.top,width:bounds.width,height:bounds.height},
      {top:row.top},{width:child.offsetWidth,height:child.offsetHeight},
      contextViewport);
    child.style.left=placement.left+"px";
    child.style.top=placement.top+"px";
    child.dataset.side=placement.side;
    // Like Send to, a View/New cascade may stack above or below the
    // parent on narrow screens. Traversing other root rows must not
    // dismiss it before the pointer reaches the child.
    child.dataset.cascade=placement.top>=bounds.height||
      placement.top+child.offsetHeight<=0?"stacked":"adjacent";
  },[context?.kind,context?.viewOpen,context?.newOpen,context?.x,context?.y,contextViewport]);
  const copyExplorerPath=()=>{
    const path=state.path;
    if(!path){setMessage("No mounted folder path is available.");return;}
    if(!navigator.clipboard?.writeText){
      setMessage("Clipboard permission is unavailable.");return;
    }
    void navigator.clipboard.writeText(path).then(()=>setMessage(""))
      .catch(cause=>setMessage(cause instanceof Error?
        cause.message:"Cannot copy folder path"));
  };

  /** Source main.js ExplorerMenu New submenu creates the same safe Guest
   * folder/TXT/RTF objects as Desktop New, not host filesystem files. */
  const createSourceExplorerItem=(kind:DesktopNewItem)=>{
    void execute(async()=>{
      const uri=await createSourceDesktopItem(fileStore,state.path,kind);
      session.select(uri);
      if(theme==="win7")setRenamingUri(uri);
    });
  };

  const showContext = (
    event: import("react").MouseEvent<HTMLElement>,
    kind: "item" | "background", uri?: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    contextReturnFocus.current=event.currentTarget;
    if (kind === "item" && uri && !state.selected.includes(uri)) session.select(uri);
    if (kind === "background") session.clearSelection();
    setContext({
      kind,uri,viewOpen:false,newOpen:false,sendToOpen:false,
      anchorX:event.clientX,anchorY:event.clientY,
      x:event.clientX,y:event.clientY
    });
  };
  const contextAction = (action: () => void) => {
    setContext(null);
    action();
  };
  const requestRename = () => {
    if (!selected || isBin) return;
    if (theme === "win7") {
      setRenamingUri(selected.uri);
    } else {
      setName(selected.name);
      setPrompt("rename");
    }
  };
  const commitInlineRename = (uri: string, value: string) => {
    setRenamingUri(null);
    const nextName = value.trim();
    if (!nextName) {
      setMessage("File name cannot be empty.");
      return;
    }
    const item = visible.find(entry => entry.uri === uri);
    if (item?.name === nextName) return;
    void execute(() => session.rename(uri, nextName));
  };

  const protectedRoots = [
    "/", ...(volume ? [volume.pathConfig.root, ...volume.pathConfig.drives.map(
      drive => volume.pathConfig.root.replace(/\/$/, "") + "/" + drive.path
    )] : [])
  ];
  const organizeItems = sourceOrganizeItems({
    selectedPaths:state.selected, protectedRoots,
    clipboardHasPaths:clipboardState.paths.length > 0,
    canMoveToTrash:Boolean(trashPath), isRecycleBin:isBin,
    recycleBinPath, canCloseWindow:Boolean(onClose)
  });
  const organizeCommand = (command: SourceOrganizeCommand) => {
    switch(command) {
      case "cut": copySelection("cut"); break;
      case "copy": copySelection("copy"); break;
      case "paste": pasteSelection(); break;
      case "delete": requestDelete(); break;
      case "rename": requestRename(); break;
      case "close": onClose?.(); break;
      // Explicitly disabled source menu items cannot reach the callback.
    }
  };

  const contextSelection=context?.kind==="item"&&context.uri
    ?(state.selected.includes(context.uri)?state.selected:[context.uri])
      .map(uri=>visible.find(entry=>entry.uri===uri))
      .filter((entry):entry is FileEntry=>Boolean(entry))
    :[];
  const canExtractGuestZip=Boolean(!isBin&&contextSelection.length===1&&
    contextSelection[0].type==="file"&&!contextSelection[0].originalPath&&
    sourceCanExtractGuestZip(state.path,contextSelection[0].uri));
  const contextItemMenu=sourceExplorerItemMenu({
    selected:contextSelection,canRecycle:Boolean(trashPath),canExtractGuestZip
  });
  const sourceDesktopPath=volume?.desktopPath??null;
  const canSendToDesktop=Boolean(!isBin&&sourceDesktopPath&&contextSelection.length&&
    contextSelection.every(item=>item.uri.startsWith(SOURCE_COMPUTER_ROOT+"/")&&
      !item.originalPath&&!sourceIsShortcutEntry(item)));
  const canCompressGuest=Boolean(!isBin&&contextSelection.length&&
    contextSelection.every(item=>!item.originalPath)&&
    sourceCanCompressSelection(state.path,contextSelection.map(item=>item.uri)));
  const sendToItems=sourceExplorerSendToMenu(canSendToDesktop,canCompressGuest);
  const sendSelectionToDesktop=()=>{
    if(!sourceDesktopPath)return;
    const paths=contextSelection.map(entry=>entry.uri);
    void execute(async()=>{
      await createSourcePathDesktopShortcuts(fileStore,sourceDesktopPath,paths);
    });
  };
  const sendSelectionToCompressedFolder=()=>{
    if(!canCompressGuest)return;
    const paths=contextSelection.map(entry=>entry.uri);
    const destinationFolder=state.path;
    void execute(async()=>{
      const uri=await createSourceGuestArchive(fileStore,destinationFolder,paths);
      session.select(uri);
    });
  };
  const runSourceItemAction=(action:SourceExplorerItemAction)=>{
    switch(action){
      case "open":{
        const item=contextSelection[0];
        if(item)openEntry(item.uri,item.type);
        break;
      }
      case "download":downloadSelectedFiles(contextSelection);break;
      case "cut":copySelection("cut");break;
      case "copy":copySelection("copy");break;
      case "delete":requestDelete();break;
      case "rename":requestRename();break;
      case "extract-here":{
        if(!canExtractGuestZip)return;
        const archivePath=contextSelection[0].uri;
        const folder=state.path;
        void execute(async()=>{
          const created=await extractSourceGuestZip(fileStore,folder,archivePath);
          if(created.length)session.select(created[0]);
        });
        break;
      }
      // Send to is the source parent submenu, not a terminal action.
      // Original Properties still needs a source-backed settings pane.
      case "send-to":case "properties":break;
    }
  };
  const detailsSourceWidth=theme==="win7"?SOURCE_COMPUTER_DETAILS_COLUMN_WIDTH:undefined;
  return <div className={"windows-explorer explorer-stage"+(theme==="win7"?" is-source-win7":theme==="win10"?" is-source-win10":(theme==="win8"||theme==="win81")?" is-source-win8":"")} data-test-explorer="" onKeyDown={handleKeys}>
    <div className="explorer-address">
      {theme === "win7"
        ? <SourceWin7Navigation
            canGoBack={state.canGoBack} canGoForward={state.canGoForward}
            onBack={() => void execute(() => session.back())}
            onForward={() => void execute(() => session.forward())} />
        : <>
            <button aria-label="Back" disabled={!state.canGoBack} onClick={() => void execute(() => session.back())}>◀</button>
            <button aria-label="Forward" disabled={!state.canGoForward} onClick={() => void execute(() => session.forward())}>▶</button>
          </>}
      {/* Original Computer's Win7 address bar contains only the Back/Forward
          nav, location and optional search slot. Preserve the migration-era
          Up control solely for other themes until their source layouts port. */}
      {showExplorerUpControl(theme) &&
        <button aria-label="Up" disabled={state.path === "/"}
          onClick={() => void execute(() => session.up())}>↑</button>}
      <div className={"explorer-address__location" + (theme === "win7" ? " is-source-win7" : "")}>
        <span className="explorer-address__label">Address:</span>
        <span className="explorer-address__location-wrapper">
          <input aria-label="Folder address" readOnly
            tabIndex={theme === "win7" ? -1 : undefined}
            className={theme === "win7" ? "explorer-address__source-path-input" : undefined}
            value={isBin && state.path === recycleBinPath ? "Recycle Bin" : state.path === "/" ? "Computer" : state.path} />
          <SourceAddressProgress fraction={searchBusy ? searchFraction : null} />
          {theme === "win7" && <>
            <SourceWin7Breadcrumbs
              items={sourceExplorerAddressBreadcrumbs(state.path, volume?.pathConfig,
                trashPath, showSourceSearchLocation, classicSourceSearch)}
              icon={showSourceSearchLocation ? legacyArt.search :
                isBin ? legacyArt.recycleBin : legacyArt.computer}
              onNavigate={path => void execute(() => session.open(path))} />
            <button type="button" className="explorer-address__source-refresh"
              aria-label="Reload current folder" title="Refresh"
              onClick={() => void execute(() => session.refresh())}>
              <img className="explorer-address__source-refresh-icon"
                src={legacyArt.fileExplorerRefresh} alt="" />
            </button>
          </>}
        </span>
      </div>
      <input className="explorer-address__search" type="search"
        placeholder={instantSearch
          ? sourceExplorerSearchPlaceholder(state.path, volume?.pathConfig, trashPath)
          : "Search"}
        aria-label="Search files" value={state.search}
        onChange={event => session.search(event.target.value)} />
      {!instantSearch &&
        <button type="button" onClick={() => runSearch()} disabled={searchBusy}
          aria-label="Find files">Find</button>}
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
      {found !== null && !instantSearch && <button type="button" onClick={() => {
        searchActive.current = false;
        setFound(null); setFoundHighlights({});
      }}>Clear results</button>}
      {found !== null && <span role="status">{found.length} found{searchTruncated ? " (first 500)" : ""}</span>}
      {searchBusy && <span role="status">Searching {foldersScanned} folders...</span>}
      {/* Original Computer renders progress in window-addressbar, not here. */}
    </div>
    <div className="explorer-command">
      {/* Original bin.js renders Computer at the trash path; both windows
          inherit the same Organize component. Unsafe trash transfer commands
          remain disabled until their source metadata semantics are ported. */}
      <SourceOrganizeMenu items={organizeItems} onCommand={organizeCommand} />
      {/* Pinned Computer.toolbar(): a non-classic shell:search location adds
          a disabled Save search entry; bin.js inherits Computer.toolbar().
          React represents that virtual location while results are active. */}
      {theme === "win7" && (searchBusy || found !== null) &&
        <button type="button" disabled title="Original Save search is not implemented">
          Save search
        </button>}
      {isBin ? <>
        <button disabled={!selected?.originalPath} onClick={restoreSelection}>Restore</button>
        <button disabled={!state.selected.length} onClick={requestDelete}>Delete permanently</button>
        <button disabled={!state.items.length} onClick={() => setConfirm("empty")}>Empty Recycle Bin</button>
      </> : <>
        {/* The source Computer allows New folder at activePath; the React
            Guest VFS root is a real writable folder ("/"), unlike the
            legacy null Computer sentinel. Do not hide this existing action
            on root/search screens: it is used by Explorer, Bin and search
            workflows and must remain available for backwards compatibility. */}
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
      {(theme === "win7" || theme === "win10" || theme === "win8" || theme === "win81")
        ? <SourceViewMenu value={state.viewMode} onChange={view => session.setViewMode(view)} />
        : <label>View:
            <select aria-label="Explorer view" value={state.viewMode}
              onChange={event => session.setViewMode(event.target.value as ExplorerViewMode)}>
              {viewOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>}
    </div>
    <div className="explorer-workspace">
      {!isBin && showCompanion ? <SearchCompanion key={state.path}
        initialScope={state.path} initialNamePattern={namePattern}
        onSearch={searchInComputer} onClose={() => setShowCompanion(false)} /> :
      <aside className="explorer-navigation">
        <button className="explorer-navigation__home"
          aria-current={state.path===(recycleBinPath??"/")?"location":undefined}
          onClick={() => void execute(() => session.open(recycleBinPath ?? "/"))}>
          <img src={isBin
            ? sourceShellAsset(theme,visible.length?"binFull":"bin") ?? legacyArt.recycleBin
            : sourceShellAsset(theme,"computer") ?? legacyArt.computer} alt="" />
          {isBin ? "Recycle Bin" : "Computer"}
        </button>
        {!isBin && volume?.pathConfig.drives.map(drive =>
          <button key={drive.letter} className="explorer-navigation__home"
            aria-current={state.path===volume.pathConfig.root+"/"+drive.path?"location":undefined}
            onClick={() => void execute(() => session.open(
              volume.pathConfig.root + "/" + drive.path
            ))} title={drive.label + " (" + drive.letter + ":)"}>
            <img src={sourceThemeProgramArt(theme,drive.letter==="C"?"disk-os":"disk-data")
              ?? sourceShellAsset(theme,"computer") ?? legacyArt.computer} alt="" />
            {drive.label} ({drive.letter}:)
          </button>
        )}
        {!isBin && volume && <button className="explorer-navigation__home"
          aria-current={state.path===volume.desktopPath?"location":undefined}
          onClick={() => void execute(() => session.open(volume.desktopPath))}>
          <img src={sourceThemeProgramArt(theme,"desktop") ?? sourceShellAsset(theme,"folder") ?? legacyArt.folder} alt="" /> Desktop
        </button>}
        {shortcuts.map(shortcut =>
          <button key={shortcut.label} className="explorer-navigation__home"
            aria-current={state.path===shortcut.path?"location":undefined}
            onClick={() => void execute(() => session.open(shortcut.path))}>
            <img src={sourceThemeSpecialFolderArt(theme,shortcut.label)
              ?? sourceShellAsset(theme,"folder") ?? legacyArt.folder} alt="" /> {shortcut.label}
          </button>
        )}
        {sourceGuest && <button className="explorer-navigation__home" disabled
          title="The source Z: DVD device is not writable or mounted">
          <img src={sourceThemeProgramArt(theme,"disk-cd")
            ?? sourceShellAsset(theme,"computer") ?? legacyArt.computer}
            alt="" /> DVD RW Drive (Z:)
        </button>}
      </aside>}
      <section className={"explorer-content" +
          (dropTarget === state.path ? " is-drop-target" : "")}
        data-windows-os-drop-directory={isBin ? undefined : state.path}
        aria-label="Folder contents"
        ref={contentRef} tabIndex={-1}
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
        {state.viewMode === "details" && <SourceListViewHeader
          className="explorer-columns" useSourceWidths={theme==="win7"}
          columns={[
            {key:"name",label:"Name",width:detailsSourceWidth},
            {key:"date",label:"Date modified",width:detailsSourceWidth},
            {key:"type",label:"Type",width:detailsSourceWidth},
            {key:"size",label:"Size",width:detailsSourceWidth}
          ]} />}
        <SourceListView
          variant={state.viewMode === "details" ? "details" :
            state.viewMode === "tiles" ? "tiles" :
            state.viewMode === "list" ? "list" :
            state.viewMode === "content" ? "content" : "plain"}
          className={"explorer-list " +
          (state.viewMode.includes("icons") ? "has-icons is-" + state.viewMode.split("-")[0] : "")}>
          {visible.map(item => {
            const icon=sourceComputerIconArtwork(item,shortcutIcons[item.uri],theme);
            return <SourceListViewItem key={state.viewMode+":"+item.uri}
            itemKey={item.uri}
            itemType={sourceIsShortcutEntry(item)?"shortcut":item.type}
            itemLabel={item.name}
            active={state.selected.includes(item.uri)}
            toggle={showSourceCheckboxes ? () => session.select(item.uri,true) : undefined}
            draggable={!isBin}
            onDragStart={event => startDrag(event, item.uri)}
            onDragEnd={endDrag}
            onDragOver={item.type === "directory" && !isBin
              ? event => overDrop(event, item.uri) : undefined}
            onDragLeave={item.type === "directory" ? () => setDropTarget(null) : undefined}
            onDrop={item.type === "directory" && !isBin
              ? event => dropFiles(event, item.uri) : undefined}
            className={"explorer-item " +
              (state.selected.includes(item.uri) ? "is-selected " : "") +
              (dropTarget === item.uri ? "is-drop-target" : "")}
            data-test-explorer-item={item.name}
            data-source-icon-type={icon?.sourceType}
            data-source-icon-override={sourceIsShortcutEntry(item)
              ?shortcutIcons[item.uri]:undefined}
            data-source-icon-artwork={icon.exactSourceArtwork?"original":
              sourceShortcutCustomIconURL(shortcutIcons[item.uri]??"")?"custom":"fallback"}
            data-windows-os-drop-directory={!isBin && item.type === "directory" ? item.uri : undefined}
            aria-label={item.name}
            onClick={event => session.select(item.uri, event.ctrlKey || event.metaKey)}
            onContextMenu={event => showContext(event, "item", item.uri)}
            onClickOutside={context?.kind === "item" && context.uri === item.uri
              ? () => setContext(null) : undefined}
            popupSelector="[data-test-explorer-context]"
            onDoubleClick={() => openEntry(item.uri, item.type)}
            onKeyDown={event => { if (event.key === "Enter") openEntry(item.uri, item.type); }}>
            <span className="listview__item-iconbox">
              <img src={icon.src}
                alt="" draggable={false} />
            </span>
            {state.viewMode === "content"
              ? <span className="listview__item-info" data-test-source-content-extras="">
                  {renamingUri === item.uri
                    ? <SourceListItemRename originalName={item.name}
                        onCommit={value => commitInlineRename(item.uri, value)}
                        onCancel={() => setRenamingUri(null)}/>
                    : <span className="listview__item-label" title={item.uri}>
                        {isBin && item.originalPath ? item.originalPath.split("/").pop()
                          : found !== null ? sourceMarkedName(item.name, foundHighlights[item.uri]) : item.name}
                      </span>}
                  {sourceComputerItemExtras(item, "content", found !== null, volume).map((value,index) =>
                    <SourceListViewExtra key={index}>{value}</SourceListViewExtra>)}
                </span>
              : state.viewMode === "details" && theme === "win7"
              ? <span className="listview__item-info" data-test-source-details-info="">
                  {renamingUri === item.uri
                    ? <SourceListItemRename originalName={item.name}
                        onCommit={value => commitInlineRename(item.uri, value)}
                        onCancel={() => setRenamingUri(null)}/>
                    : <span className="listview__item-label" title={item.uri}
                        style={{width:sourceComputerDetailsLabelWidth(showSourceCheckboxes)}}>
                        {isBin && item.originalPath ? item.originalPath.split("/").pop()
                          : found !== null ? sourceMarkedName(item.name, foundHighlights[item.uri]) : item.name}
                      </span>}
                  {sourceComputerItemExtras(item,"details").map((value,index,extras) =>
                    <SourceListViewExtra key={index}
                      width={SOURCE_COMPUTER_DETAILS_COLUMN_WIDTH}
                      count={extras.length} details>{value}</SourceListViewExtra>)}
                </span>
              : state.viewMode === "tiles" && theme === "win7"
              ? <span className="listview__item-info" data-test-source-tiles-info="">
                  {renamingUri === item.uri
                    ? <SourceListItemRename originalName={item.name}
                        onCommit={value => commitInlineRename(item.uri, value)}
                        onCancel={() => setRenamingUri(null)}/>
                    : <span className="listview__item-label" title={item.uri}>
                        {isBin && item.originalPath ? item.originalPath.split("/").pop()
                          : found !== null ? sourceMarkedName(item.name, foundHighlights[item.uri]) : item.name}
                      </span>}
                  {sourceComputerItemExtras(item, "tiles").map((value,index) =>
                    <SourceListViewExtra key={index}>{value}</SourceListViewExtra>)}
                </span>
              : renamingUri === item.uri
              ? <SourceListItemRename originalName={item.name}
                  onCommit={value => commitInlineRename(item.uri, value)}
                  onCancel={() => setRenamingUri(null)}/>
              : <span className="listview__item-label" title={item.uri}>
                  {isBin && item.originalPath ? item.originalPath.split("/").pop()
                    : found !== null ? sourceMarkedName(item.name, foundHighlights[item.uri]) : item.name}
                </span>}
            {((state.viewMode === "details" && theme !== "win7") ||
                (state.viewMode === "tiles" && theme !== "win7")) &&
              sourceComputerItemExtras(item, state.viewMode).map((value,index) =>
                <SourceListViewExtra key={index}>{value}</SourceListViewExtra>)}
          </SourceListViewItem>;
          })}
          {!state.busy && !searchBusy && !visible.length && <p className="explorer-empty">
            {state.search ? "No items match your search." : "This folder is empty."}
          </p>}
        </SourceListView>
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
    {context && <div ref={contextRef} role="menu" className="explorer-context-menu"
      data-test-explorer-context={context.kind}
      aria-label={context.kind === "item" ? "File actions" : "Folder actions"}
      style={{ left: context.x, top: context.y }}
      onPointerMove={event=>{
        if(context.kind!=="background")return;
        const button=event.target instanceof Element?
          event.target.closest("button"):null;
        if(!button||button.parentElement!==contextRef.current)return;
        if(button.hasAttribute("data-test-explorer-context-view")||
          button.hasAttribute("data-test-explorer-context-new"))return;
        if((context.viewOpen||context.newOpen)&&
          backgroundSubmenuRef.current?.dataset.cascade==="stacked")return;
        if(context.viewOpen||context.newOpen)setContext(current=>current?{
          ...current,viewOpen:false,newOpen:false
        }:current);
      }}
      onKeyDown={event=>{
        const inSendTo=event.target instanceof Element &&
          Boolean(event.target.closest("[data-test-explorer-sendto-submenu]"));
        const inBackgroundSubmenu=event.target instanceof Element &&
          Boolean(event.target.closest("[data-test-explorer-background-submenu]"));
        const focusHost=inSendTo?sendToRef.current:
          inBackgroundSubmenu?backgroundSubmenuRef.current:contextRef.current;
        if(sourceMenuArrowFocus(focusHost,event.target,event.key)){
          event.preventDefault();return;
        }
        if(event.key==="ArrowLeft"&&(context.viewOpen||context.newOpen||context.sendToOpen)){
          event.preventDefault();
          const parent=context.viewOpen?"[data-test-explorer-context-view]":
            context.newOpen?"[data-test-explorer-context-new]":
              "[data-test-explorer-item-send-to]";
          setContext(current=>current?{
            ...current,viewOpen:false,newOpen:false,sendToOpen:false
          }:current);
          window.requestAnimationFrame(()=>contextRef.current
            ?.querySelector<HTMLButtonElement>(parent)?.focus({preventScroll:true}));
        }
      }}>
      {context.kind === "item" && context.uri && (isBin ? <>
        {sourceBinItemMenu(Boolean(selected?.originalPath)).map(action=>
          <button key={action.id} role="menuitem"
            data-test-bin-context-action={action.id}
            disabled={action.disabled}
            title={action.id==="properties"?"Original Properties is disabled":undefined}
            onClick={()=>contextAction(()=>{
              const handlers:Readonly<Record<Exclude<SourceBinItemAction,"properties">,()=>void>>={
                restore:restoreSelection,delete:requestDelete
              };
              if(action.id!=="properties")handlers[action.id]();
            })}>{action.label}</button>)}
      </> : <>
        {contextItemMenu.map(action=><button key={action.id}
          role="menuitem" type="button"
          aria-haspopup={action.id==="send-to"?"menu":undefined}
          aria-expanded={action.id==="send-to"?context.sendToOpen:undefined}
          data-test-explorer-item-action={action.id}
          data-test-explorer-item-send-to={action.id==="send-to"?"":undefined}
          disabled={action.disabled}
          title={action.disabled?"Original action needs an unavailable source service":undefined}
          onPointerEnter={()=>{
            setContext(current=>{
              if(!current)return current;
              const open=action.id==="send-to";
              // A stacked Send-to submenu is reached by crossing the
              // remaining root rows. Do not close it from those
              // incidental pointer-enter events; an actual click still
              // performs the chosen root command and closes the menu.
              if(!open&&current.sendToOpen&&
                sendToRef.current?.dataset.cascade==="stacked")return current;
              return current.sendToOpen===open?current:{
                ...current,sendToOpen:open,
                viewOpen:false,newOpen:false
              };
            });
          }}
          onKeyDown={event=>{
            if(action.id==="send-to"&&event.key==="ArrowRight"){
              event.preventDefault();
              setContext(current=>current?{
                ...current,sendToOpen:true,viewOpen:false,newOpen:false
              }:current);
              window.requestAnimationFrame(()=>sendToRef.current
                ?.querySelector<HTMLButtonElement>('button:not(:disabled)')
                ?.focus({preventScroll:true}));
            }
          }}
          onClick={()=>{
            if(action.id==="send-to"){
              setContext(current=>current?{
                ...current,sendToOpen:true,
                viewOpen:false,newOpen:false
              }:current);
            }else contextAction(()=>runSourceItemAction(action.id));
          }}>{action.label}</button>)}
        {context.sendToOpen&&<div ref={sendToRef} role="menu"
          aria-label="Send to" className="explorer-context-menu__submenu"
          data-test-explorer-sendto-submenu=""
          onPointerEnter={event=>event.stopPropagation()}>
          {sendToItems.map(action=><button key={action.id} type="button"
            role="menuitem"
            data-test-explorer-item-send-to-kind={action.id}
            disabled={action.disabled}
            title={action.disabled?"Original action requires unavailable source service":undefined}
            onClick={()=>{
              if(action.disabled)return;
              if(action.id==="desktop")contextAction(sendSelectionToDesktop);
              else if(action.id==="compress")
                contextAction(sendSelectionToCompressedFolder);
            }}>
            {action.label}
          </button>)}
        </div>}
      </>)}
      {context.kind === "background" && <>
        <button role="menuitem" aria-expanded={context.viewOpen}
          aria-haspopup="menu" data-test-explorer-context-view=""
          onPointerMove={()=>setContext(current=>current&&!current.viewOpen&&
            !(current.newOpen&&backgroundSubmenuRef.current?.dataset.cascade==="stacked")
            ? {...current,viewOpen:true,newOpen:false}:current)}
          onKeyDown={event=>{
            if(event.key==="ArrowRight"){
              event.preventDefault();
              setContext(current=>current?{
                ...current,viewOpen:true,newOpen:false
              }:current);
              window.requestAnimationFrame(()=>backgroundSubmenuRef.current
                ?.querySelector<HTMLButtonElement>('[role="menuitemradio"]')
                ?.focus({preventScroll:true}));
            }
          }}
          onClick={()=>setContext(current=>current?{
            ...current,viewOpen:true,newOpen:false
          }:current)}>View ▸</button>
        <button role="menuitem" onClick={()=>contextAction(
          ()=>void execute(()=>session.refresh())
        )}>Refresh</button>
        {isBin&&<button role="menuitem" disabled={!state.items.length}
          onClick={()=>contextAction(()=>setConfirm("empty"))}>
          Empty Recycle Bin</button>}
        {!isBin&&<button role="menuitem"
          onClick={()=>contextAction(pasteSelection)}
          disabled={!clipboardState.paths.length}>Paste</button>}
        {SOURCE_FINAL_DESKTOP_MENU_FLAGS.showMenuCopyPath&&
          <button role="menuitem" data-test-explorer-context-copy-path=""
            onClick={()=>contextAction(copyExplorerPath)}>Copy Path</button>}
        {SOURCE_FINAL_DESKTOP_MENU_FLAGS.showUploadFiles&&
          <button role="menuitem" data-test-explorer-context-upload=""
            disabled={isBin}
            onClick={()=>contextAction(()=>fileInput.current?.click())}>
            Upload Files</button>}
        {SOURCE_FINAL_DESKTOP_MENU_FLAGS.showMapDirectory&&
          <button role="menuitem" data-test-explorer-context-map-directory=""
            disabled title="Mapped directory host-permission adapter is not yet migrated">
            Map Directory</button>}
        {!isBin&&<>
          <button role="menuitem" aria-expanded={context.newOpen}
            aria-haspopup="menu" data-test-explorer-context-new=""
            onPointerMove={()=>setContext(current=>current&&!current.newOpen&&
              !(current.viewOpen&&backgroundSubmenuRef.current?.dataset.cascade==="stacked")
              ? {...current,newOpen:true,viewOpen:false}:current)}
            onKeyDown={event=>{
              if(event.key==="ArrowRight"){
                event.preventDefault();
                setContext(current=>current?{
                  ...current,newOpen:true,viewOpen:false
                }:current);
                window.requestAnimationFrame(()=>backgroundSubmenuRef.current
                  ?.querySelector<HTMLButtonElement>('[data-test-explorer-context-new-kind="folder"]')
                  ?.focus({preventScroll:true}));
              }
            }}
            onClick={()=>setContext(current=>current?{
              ...current,newOpen:true,viewOpen:false
            }:current)}>New ▸</button>
        </>}
        <button role="menuitem" disabled title="Source Explorer Properties not migrated">
          Properties</button>
        {(context.viewOpen||context.newOpen)&&
          <div ref={backgroundSubmenuRef} role="menu"
            className="explorer-context-menu__submenu"
            data-test-explorer-background-submenu=""
            aria-label={context.viewOpen?"View":"New"}>
            {context.viewOpen?SOURCE_VIEW_MODES.map(mode=>
              <button key={mode.value} role="menuitemradio"
                aria-checked={state.viewMode===mode.value}
                data-test-explorer-context-mode={mode.value}
                onClick={()=>contextAction(()=>session.setViewMode(mode.value))}>
                {state.viewMode===mode.value?"✓ ":"　"}{mode.label}
              </button>):([
                ["folder","Folder"],["richtext","Rich Text Document"],
                ["text","Text Document"]
              ] as const).map(([kind,label])=>
                <button key={kind} role="menuitem"
                  data-test-explorer-context-new-kind={kind}
                  onClick={()=>contextAction(()=>createSourceExplorerItem(kind))}>
                  {label}
                </button>)}
          </div>}
      </>}
    </div>}
    {showSearchDialog && !isBin && <SearchDialog initialScope={state.path}
      onSearch={searchInComputer} onClose={() => setShowSearchDialog(false)} />}
    {confirm && <SourceMessageDialog
      label="Confirm file operation"
      data={{type:"confirm",header:"Confirm file operation",
        message:confirm === "empty" ? "Permanently delete every item in the Recycle Bin?" :
          confirm === "permanent" ? "Permanently delete the selected items?" :
          "Move the selected items to the Recycle Bin?"}}
      onAnswer={accepted => {
        if(accepted) void executeDelete();
        else setConfirm(null);
      }} />}
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
