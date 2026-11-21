import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
  type Dispatch, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent
} from "react";
import type { AppDefinition, DesktopAction, ThemeId } from "@windows-os/contracts";
import { sourceShellAsset,sourceThemeProgramArt } from "@windows-os/assets";
import {
  desktopBand, desktopBandHits, desktopBandSelection,
  type DesktopBand, type DesktopBandModifier
} from "./desktopSelection";
import { appRegistry, browserStorage, fileClipboard, fileDragSession, fileStore, sourceFilesystemRuntime } from "@windows-os/sdk";
import {listSourceDesktopFiles,sourceDesktopFileArtwork,type SourceDesktopFile} from "./desktopFiles";
import { desktopEditableName, renameSourceDesktopFile } from "./desktopRename";
import {
  createSourceDesktopItem,createSourceDesktopShortcut,type DesktopNewItem
} from "./desktopCreate";
import { hitDesktopRecycleBin } from "./desktopDrop";
import {sourceDesktopMenuPosition} from "./sourceDesktopMenuPosition";
import {SOURCE_FINAL_DESKTOP_MENU_FLAGS} from "./sourceDesktopMenuFlags";
import {
  SOURCE_DESKTOP_DEFAULT_SORT,sourceNextDesktopSort,sourceSortDesktopItems,
  type SourceDesktopSortKey
} from "./sourceDesktopSort";
import {sourceMenuArrowFocus} from "./sourceMenuKeyboard";
import {taskbarPins} from "./sourceTaskbarPins";
import {
  sourceDesktopItemMenu,type SourceDesktopItemMenuAction
} from "./sourceDesktopItemMenu";
import { importDroppedFiles, SHELL_DRAG_TYPE, sourceProgramsById,
  sourceFileIconType,createSourceGuestArchive,sourceCanCompressSelection,
  type FileEntry } from "@windows-os/filesystem";
import { desktopSelectedFilePaths } from "./desktopFileActions";
import { nativeDesktopIconDropTarget } from "./desktopNativeDrop";
import { explorerDropTargetAt } from "./desktopExplorerDrop";
import {
  DesktopPositionStore, SOURCE_DESKTOP_DRAG_THRESHOLD, SOURCE_DESKTOP_ICON_SIZES,
  boundedIconDrag, type DesktopArea, type DesktopIconSize, type DesktopPoint
} from "./desktopPositions";

interface DesktopIconsProps {
  apps: readonly AppDefinition[];
  dispatch: Dispatch<DesktopAction>;
  theme?: ThemeId;
}
interface DesktopItem {
  id: string;
  label: string;
  icon: string;
  app?: AppDefinition;
  file?: SourceDesktopFile;
}
interface ActivePress {
  id: string;
  startX: number;
  startY: number;
  keys: string[];
  indices: { id: string; index: number }[];
  points: DesktopPoint[];
  moved: boolean;
  offset: DesktopPoint;
  narrowTo: string | null;
  dragToken: string | null;
}
type DesktopMenu = { x: number; y: number; anchorX:number; anchorY:number; id: string | null; view: boolean; sortOpen:boolean; newOpen: boolean; sendToOpen?:boolean };
interface ActiveBand {
  start: DesktopPoint;
  previous: string[];
  modifier: DesktopBandModifier;
  moved: boolean;
}

export function DesktopIcons({ apps, dispatch, theme = "win7" }: DesktopIconsProps) {
  const layout = useMemo(() => new DesktopPositionStore(browserStorage()), []);
  const [options, setOptions] = useState(() => layout.snapshot());
  const [area, setArea] = useState<DesktopArea>({
    width: typeof window === "undefined" ? 960 : window.innerWidth,
    height: typeof window === "undefined" ? 620 : Math.max(0, window.innerHeight - 40)
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [guestFiles, setGuestFiles] = useState<SourceDesktopFile[]>([]);
  const items: DesktopItem[] = useMemo(() => [
    ...apps.map(app => ({
      id: app.id, label: app.label, icon: app.icon, app
    })),
    ...guestFiles.map(file => ({
      id: file.id, label: file.label,
      icon: file.icon,
      file
    }))
  ], [apps, guestFiles]);
  const [drag, setDrag] = useState<{ keys: string[]; offset: DesktopPoint } | null>(null);
  const [overBin, setOverBin] = useState(false);
  const [nativeDesktopDropHover, setNativeDesktopDropHover] = useState(false);
  const [nativeIconDropHover, setNativeIconDropHover] = useState<string | null>(null);
  const [band, setBand] = useState<DesktopBand | null>(null);
  const [menu, setMenu] = useState<DesktopMenu | null>(null);
  const [sortChoice,setSortChoice]=useState(SOURCE_DESKTOP_DEFAULT_SORT);
  const [error, setError] = useState<string | null>(null);
  const [clipboardState, setClipboardState] = useState(() => fileClipboard.snapshot());
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const [pendingEmptyBin,setPendingEmptyBin]=useState(false);
  const [trashCount,setTrashCount]=useState(0);
  const [pinned,setPinned]=useState(()=>taskbarPins.snapshot());
  useEffect(()=>taskbarPins.subscribe(setPinned),[]);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{id:string;value:string} | null>(null);
  const renameRef = useRef<{id:string;value:string} | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const uploadInput = useRef<HTMLInputElement>(null);
  const menuHost = useRef<HTMLDivElement>(null);
  const sendToMenuHost = useRef<HTMLDivElement>(null);
  // Context can open on a specific icon or the Desktop background.
  // Keep the real invoking element for Escape rather than losing focus.
  const menuReturnFocus = useRef<HTMLElement|null>(null);
  const press = useRef<ActivePress | null>(null);
  const bandPress = useRef<ActiveBand | null>(null);
  const anchor = useRef<string | null>(null);
  const ignoreClick = useRef(false);
  const highlightedExplorerDrop = useRef<HTMLElement | null>(null);
  const clearExplorerDropHighlight = useCallback(() => {
    highlightedExplorerDrop.current?.removeAttribute("data-desktop-pointer-hover");
    highlightedExplorerDrop.current = null;
  }, []);
  const showExplorerDropHighlight = useCallback((target: HTMLElement | null) => {
    if (highlightedExplorerDrop.current === target) return;
    highlightedExplorerDrop.current?.removeAttribute("data-desktop-pointer-hover");
    highlightedExplorerDrop.current = target;
    target?.setAttribute("data-desktop-pointer-hover", "true");
  }, []);


  // Source DesktopItemMenu Bin action reads the actual mounted trash folder
  // on the same VFS as Explorer, never an assumed empty or fabricated path.
  useEffect(()=>{
    let live=true,revision=0;
    const refresh=()=>{
      const token=++revision;
      const path=sourceFilesystemRuntime.snapshot()?.trashPath;
      if(!path){if(live)setTrashCount(0);return;}
      void fileStore.list(path).then(entries=>{
        if(live&&token===revision)setTrashCount(entries.length);
      }).catch(()=>{if(live&&token===revision)setTrashCount(0);});
    };
    refresh();
    const unsubFiles=fileStore.subscribe(refresh);
    const unsubRuntime=sourceFilesystemRuntime.subscribe(refresh);
    return ()=>{live=false;revision++;unsubFiles();unsubRuntime();};
  },[]);

  // Explorer and Desktop share one file clipboard. The host OS clipboard is
  // intentionally untouched and unmounted data is never fabricated.
  useEffect(() => fileClipboard.subscribe(setClipboardState), []);

  useEffect(() => {
    const host = list.current;
    if (!host) return;
    const resize = () => {
      const rect = host.getBoundingClientRect();
      setArea({ width: rect.width, height: rect.height });
    };
    resize();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    observer?.observe(host);
    window.addEventListener("resize", resize);
    return () => { observer?.disconnect(); window.removeEventListener("resize", resize); };
  }, []);

  // Original main.js 6271: defaultShortcuts and file-backed shortcuts share
  // one desktop item list. Use only the mounted session.desktopPath.
  useEffect(() => {
    let active = true;
    let revision = 0;
    const load = () => {
      const current = ++revision;
      const runtime = sourceFilesystemRuntime.snapshot();
      if (!runtime) { setGuestFiles([]); return; }
      void listSourceDesktopFiles(fileStore, runtime.desktopPath).then(files => {
        if (active && current === revision) setGuestFiles(files);
      }).catch(cause => {
        if (active && current === revision) {
          setGuestFiles([]);
          setError(cause instanceof Error ? cause.message : "Cannot read Guest desktop");
        }
      });
    };
    load();
    const unsubscribeFiles = fileStore.subscribe(load);
    const unsubscribeRuntime = sourceFilesystemRuntime.subscribe(load);
    return () => {
      active = false; revision++;
      unsubscribeFiles(); unsubscribeRuntime();
    };
  }, []);

  const openGuestEntry=(entry:FileEntry)=>{
    const programId=entry.type==="directory"?"computer":
      /\.txt$/i.test(entry.name)?"notepad":
      sourceFileIconType(entry)==="photo"?"photo":
      sourceFileIconType(entry)==="media"?"player":null;
    const app=programId?appRegistry.get(programId):undefined;
    if(app)dispatch({type:"OPEN_APP",app,file:{path:entry.uri}});
    else setError("No original application association has been migrated for "+entry.name);
  };
  const openItem = (item: DesktopItem) => {
    if (item.app) {
      dispatch({ type: "OPEN_APP", app: item.app });
      return;
    }
    const file = item.file;
    if (!file) return;
    if(file.targetPath){
      // Source main.js SendToDesktop: resolve the Guest target, not the exe
      // hint in the JSON. Never open an unmounted, deleted or host path.
      void fileStore.stat(file.targetPath).then(target=>{
        if(!target||target.originalPath)
          throw new Error("Shortcut target no longer exists in the Guest filesystem.");
        openGuestEntry(target);
      }).catch(cause=>setError(cause instanceof Error?cause.message:
        "Cannot open Guest shortcut target"));
      return;
    }
    if (file.programId) {
      const app = appRegistry.get(file.programId);
      if (app) dispatch({ type: "OPEN_APP", app });
      else setError("The original " + file.label + " program is not yet migrated.");
    } else if (/\.lnk$/i.test(file.entry.name)) {
      setError("The original shortcut target cannot be opened safely.");
    } else {
      openGuestEntry(file.entry);
    }
  };

  // Pinned main.js DesktopItemMenu Send to > compressed-folder calls
  // compress(paths). Reuse Explorer's bounded, atomic Guest ZIP operation,
  // never a host filesystem adapter or a fake success notification.
  const compressDesktopSelection = (keys: readonly string[]) => {
    setMenu(null);
    const desktop = sourceFilesystemRuntime.snapshot()?.desktopPath;
    const paths = desktopSelectedFilePaths(items, keys);
    if (!desktop || !sourceCanCompressSelection(desktop, paths)) {
      setError("Select files from the mounted Guest Desktop to create a ZIP.");
      return;
    }
    void createSourceGuestArchive(fileStore, desktop, paths).then(uri => {
      setSelected(["file:" + uri]);
      anchor.current = "file:" + uri;
      setError(null);
    }).catch(cause => setError(cause instanceof Error ? cause.message :
      "Cannot compress Guest Desktop files"));
  };

  const prepareDesktopClipboard = (mode: "copy" | "cut", keys: readonly string[]) => {
    const paths = desktopSelectedFilePaths(items, keys);
    if (!paths.length) return;
    try {
      fileClipboard.prepare(paths, mode);
      setError(null);
      setMenu(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Desktop clipboard error");
    }
  };
  const pasteDesktopFiles = () => {
    setMenu(null);
    const desktopPath = sourceFilesystemRuntime.snapshot()?.desktopPath;
    if (!desktopPath) {
      setError("The original Guest Desktop is not mounted.");
      return;
    }
    void fileClipboard.paste(fileStore, desktopPath).then(created => {
      setSelected(created.map(entry => "file:" + entry.uri));
      setError(null);
    }).catch(cause =>
      setError(cause instanceof Error ? cause.message : "Cannot paste on desktop"));
  };
  const requestDesktopDelete = (keys: readonly string[]) => {
    setMenu(null);
    const paths = desktopSelectedFilePaths(items, keys);
    if (!paths.length) return;
    if (!sourceFilesystemRuntime.snapshot()?.trashPath) {
      setError("The original Recycle Bin is not mounted.");
      return;
    }
    setPendingDelete(paths);
    setError(null);
  };
  const confirmDesktopDelete = () => {
    const paths = pendingDelete;
    setPendingDelete(null);
    const trashPath = sourceFilesystemRuntime.snapshot()?.trashPath;
    if (!paths?.length || !trashPath) return;
    void fileStore.trashMany(paths, trashPath).then(() => {
      setSelected(previous => previous.filter(id =>
        !paths.includes(items.find(item => item.id === id)?.file?.entry.uri ?? "")));
      anchor.current = null;
      setError(null);
    }).catch(cause =>
      setError(cause instanceof Error ? cause.message : "Cannot delete desktop files"));
  };

  const beginRename = (file: SourceDesktopFile) => {
    const value = desktopEditableName(file.entry);
    renameRef.current = { id:file.id, value };
    setRenaming({id:file.id,value});
    setSelected([file.id]);
    anchor.current = file.id;
    setMenu(null);
    setError(null);
  };
  // The VFS publishes before the async create promise resolves. Observe both
  // createdId and the refreshed Guest file list so inline rename cannot race.
  useEffect(() => {
    if (!createdId) return;
    const file = guestFiles.find(item => item.id === createdId);
    if (!file) return;
    setCreatedId(null);
    beginRename(file);
  }, [createdId, guestFiles]);

  const newDesktopItem = (kind: DesktopNewItem) => {
    setMenu(null);
    const path = sourceFilesystemRuntime.snapshot()?.desktopPath;
    if (!path) { setError("The original Guest Desktop is not mounted."); return; }
    void createSourceDesktopItem(fileStore, path, kind).then(uri => {
      setCreatedId("file:" + uri);
      setError(null);
    }).catch(cause =>
      setError(cause instanceof Error ? cause.message : "Cannot create desktop item"));
  };

  const sendProgramToDesktop = (item:DesktopItem)=>{
    setMenu(null);
    const desktop=sourceFilesystemRuntime.snapshot()?.desktopPath;
    if(!desktop||!item.app||!sourceProgramsById.get(item.app.id)?.installPath){
      setError("The installed source program or Guest Desktop is unavailable.");
      return;
    }
    void createSourceDesktopShortcut(fileStore,desktop,item.app.id,item.label)
      .then(uri=>{setSelected(["file:"+uri]);setError(null);})
      .catch(cause=>setError(cause instanceof Error?
        cause.message:"Cannot create desktop shortcut"));
  };
  const downloadSourceFile=(item:DesktopItem)=>{
    setMenu(null);
    const entry=item.file?.entry;
    if(!entry||entry.type!=="file")return;
    void fileStore.readBytes(entry.uri).then(bytes=>{
      const blob=new Blob([new Uint8Array(bytes)],{type:"application/octet-stream"});
      const url=URL.createObjectURL(blob);
      const link=document.createElement("a");
      link.href=url;link.download=entry.name;
      document.body.append(link);link.click();link.remove();
      // Release after click navigation has had an opportunity to consume
      // the object URL; no data is uploaded to the host or another service.
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
      setError(null);
    }).catch(cause=>setError(cause instanceof Error?
      cause.message:"Cannot download desktop file"));
  };
  const requestEmptyBin=()=>{
    setMenu(null);
    if(trashCount>0&&sourceFilesystemRuntime.snapshot()?.trashPath)
      setPendingEmptyBin(true);
  };
  const confirmEmptyBin=()=>{
    setPendingEmptyBin(false);
    const path=sourceFilesystemRuntime.snapshot()?.trashPath;
    if(!path)return;
    void fileStore.emptyTrash(path).then(()=>setError(null))
      .catch(cause=>setError(cause instanceof Error?
        cause.message:"Could not empty Recycle Bin"));
  };

  const openShortcutWizard = () => {
    setMenu(null);
    const app = appRegistry.get("shortcut");
    if (!app) { setError("The original Shortcut Wizard is unavailable."); return; }
    dispatch({ type: "OPEN_APP", app });
    setError(null);
  };

  const changeRename = (id: string, value: string) => {
    if (renameRef.current?.id !== id) return;
    renameRef.current = {id,value};
    setRenaming({id,value});
  };
  const cancelRename = () => {
    renameRef.current = null;
    setRenaming(null);
  };
  const finishRename = (file: SourceDesktopFile) => {
    const edit = renameRef.current;
    if (!edit || edit.id !== file.id) return;
    renameRef.current = null;
    setRenaming(null);
    void renameSourceDesktopFile(fileStore,file.entry,edit.value).then(to => {
      if (to === file.entry.uri) return;
      const nextId = "file:" + to;
      try {
        layout.rekey(file.id,nextId);
        setOptions(layout.snapshot());
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Desktop icon position could not be saved");
      }
      setSelected(previous => previous.map(key => key === file.id ? nextId : key));
      if (anchor.current === file.id) anchor.current = nextId;
    }).catch(cause =>
      setError(cause instanceof Error ? cause.message : "Desktop file could not be renamed"));
  };

  const keyIndex = (key: string) => items.findIndex(item => item.id === key);
  const pick = (id: string, toggle: boolean, range: boolean): string[] => {
    let next: string[];
    if (range && anchor.current) {
      const a = keyIndex(anchor.current), b = keyIndex(id);
      next = a < 0 || b < 0 ? [id]
        : items.slice(Math.min(a, b), Math.max(a, b) + 1).map(item => item.id);
    } else if (toggle) {
      next = selected.includes(id) ? selected.filter(key => key !== id) : [...selected, id];
      anchor.current = id;
    } else {
      next = [id];
      anchor.current = id;
    }
    setSelected(next);
    return next;
  };
  const closePress = useCallback(() => {
    const token = press.current?.dragToken;
    if (token) fileDragSession.end(token);
    clearExplorerDropHighlight();
    press.current = null;
    setDrag(null);
    setOverBin(false);
  }, [clearExplorerDropHighlight]);
  const onRecycleBin = useCallback((clientX: number, clientY: number): boolean => {
    const bin = list.current?.querySelector<HTMLElement>('[data-test-desktop-icon="bin"]');
    if (!bin || !hitDesktopRecycleBin({ x: clientX, y: clientY }, bin.getBoundingClientRect())) {
      return false;
    }
    // A window covering the icon is not a desktop drop target.
    const top = document.elementFromPoint(clientX, clientY);
    return top === bin || !!(top instanceof Element && bin.contains(top));
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const current = press.current;
      if (!current) return;
      const raw = { x: event.clientX - current.startX, y: event.clientY - current.startY };
      if (!current.moved
        && Math.hypot(raw.x, raw.y) < SOURCE_DESKTOP_DRAG_THRESHOLD) return;
      current.moved = true;
      const allFileItems = current.keys.every(key =>
        items.some(item => item.id === key && !!item.file)
      );
      // A desktop pointer gesture cannot emit the native HTML drag event used
      // inside Explorer, so start the same shell drag token once the original
      // 4px selection/position threshold has been crossed.
      if (allFileItems && !current.dragToken) {
        const paths = desktopSelectedFilePaths(items, current.keys);
        if (paths.length) current.dragToken = fileDragSession.begin(paths);
      }
      const binTarget = allFileItems && onRecycleBin(event.clientX, event.clientY);
      setOverBin(binTarget);
      const folderTarget = allFileItems && !binTarget
        ? explorerDropTargetAt({x:event.clientX,y:event.clientY}) : null;
      showExplorerDropHighlight(folderTarget?.element ?? null);
      if (options.autoArrange) return;
      current.offset = boundedIconDrag(
        current.points, area, SOURCE_DESKTOP_ICON_SIZES[options.iconSize], raw
      );
      setDrag({ keys: current.keys, offset: current.offset });
    };
    const up = (event: PointerEvent) => {
      const current = press.current;
      if (!current) return;
      if (current.moved) {
        ignoreClick.current = true;
        if (current.id !== "bin" && onRecycleBin(event.clientX, event.clientY)) {
          const selectedFiles = current.keys.map(key =>
            items.find(item => item.id === key)?.file
          );
          const trashPath = sourceFilesystemRuntime.snapshot()?.trashPath;
          if (selectedFiles.some(file => !file)) {
            setError("System icons cannot be moved to Recycle Bin.");
          } else if (!trashPath) {
            setError("The original Recycle Bin is not mounted.");
          } else {
            void fileStore.trashMany(
              selectedFiles.map(file => file!.entry.uri), trashPath
            ).then(() => {
              setSelected([]);
              anchor.current = null;
              setError(null);
            }).catch(cause =>
              setError(cause instanceof Error ? cause.message : "Cannot recycle selected files")
            );
          }
          closePress();
          return;
        }
        const explorerTarget = explorerDropTargetAt({
          x: event.clientX, y: event.clientY
        });
        if (explorerTarget) {
          const allFiles = current.keys.every(key =>
            items.some(item => item.id === key && !!item.file));
          if (!allFiles || !current.dragToken) {
            setError("Only real Guest Desktop files can be moved into Explorer.");
          } else {
            // Ctrl/Meta drag is copy; normal drag moves. Reuse Explorer's own
            // token + transferFiles preflight, not clipboard state or host data.
            const mode = event.ctrlKey || event.metaKey ? "copy" : "move";
            void fileDragSession.drop(
              fileStore, current.dragToken, explorerTarget.directory, mode
            ).then(() => {
              if (mode === "move") {
                setSelected(previous => previous.filter(id => !current.keys.includes(id)));
                anchor.current = null;
              }
              setError(null);
            }).catch(cause => setError(
              cause instanceof Error ? cause.message : "Could not transfer desktop files"
            ));
          }
          closePress();
          return;
        }
        // Dragging over a window that is not an eligible Explorer directory
        // cannot reposition a desktop icon behind that window.
        if (document.elementFromPoint(event.clientX, event.clientY)
          ?.closest(".windows-window")) {
          closePress();
          return;
        }
        if (!options.autoArrange && (current.offset.x || current.offset.y)) {
          try {
            layout.move(current.indices, area, current.offset);
            setOptions(layout.snapshot());
            setError(null);
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Desktop position could not be saved");
          }
        }
      } else if (current.narrowTo) {
        setSelected([current.narrowTo]);
      }
      closePress();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", closePress);
    window.addEventListener("blur", closePress);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", closePress);
      window.removeEventListener("blur", closePress);
    };
  }, [options.autoArrange, options.iconSize, area, layout, closePress,
    items, onRecycleBin, showExplorerDropHighlight]);

  /** Source main.js: handlePointerDown falls back to startBand on desktop background. */
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const active = bandPress.current;
      const host = list.current;
      if (!active || !host) return;
      const bounds = host.getBoundingClientRect();
      const point = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top
      };
      if (!active.moved && Math.hypot(
        point.x - active.start.x, point.y - active.start.y
      ) < SOURCE_DESKTOP_DRAG_THRESHOLD) return;
      active.moved = true;
      const shape = desktopBand(active.start, point, area);
      setBand(shape);
      const targets = items.map((item, index) => ({ id: item.id, index }));
      setSelected(desktopBandSelection(
        active.previous, desktopBandHits(targets, shape, options, area),
        active.modifier
      ));
    };
    const up = () => {
      const active = bandPress.current;
      if (!active) return;
      if (active.moved) ignoreClick.current = true;
      bandPress.current = null;
      setBand(null);
    };
    const cancel = () => { bandPress.current = null; setBand(null); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", cancel);
    };
  }, [items, area, options]);

  const startBand = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !options.showIcons || press.current) return;
    const target = event.target as HTMLElement;
    if (target.closest(
      "[data-test-desktop-icon], [data-test-desktop-menu], [data-test-desktop-send-to-submenu], [data-test-desktop-create], [data-test-desktop-confirm], .windows-desktop__layout-error"
    )) return;
    const bounds = list.current?.getBoundingClientRect();
    if (!bounds) return;
    const modifier: DesktopBandModifier = event.ctrlKey || event.metaKey
      ? "toggle" : event.shiftKey ? "add" : "replace";
    bandPress.current = {
      start: { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
      previous: selected,
      modifier,
      moved: false
    };
    if (modifier === "replace") { setSelected([]); anchor.current = null; }
    setMenu(null);
  };

  useEffect(() => {
    if (!menu) return;
    const dismiss = (event: PointerEvent) => {
      if (!(event.target instanceof Element && event.target.closest(
        "[data-test-desktop-menu], [data-test-desktop-send-to-submenu]"))) {
        setMenu(null);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMenu(null);
      window.requestAnimationFrame(() => {
        const trigger = menuReturnFocus.current;
        if (trigger?.isConnected) trigger.focus({preventScroll:true});
        else list.current?.focus({preventScroll:true});
      });
    };
    window.addEventListener("pointerdown", dismiss);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", escape);
    };
  }, [menu]);

  const startPress = (event: ReactPointerEvent<HTMLButtonElement>, app: DesktopItem) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("input")) { event.stopPropagation(); return; }
    event.stopPropagation();
    const wasSelected = selected.includes(app.id);
    const modifier = event.ctrlKey || event.metaKey;
    const keys = modifier || event.shiftKey || !wasSelected
      ? pick(app.id, modifier, event.shiftKey)
      : selected;
    if (!keys.length) return;
    const indices = keys.map(id => ({ id, index: keyIndex(id) }))
      .filter(item => item.index >= 0);
    press.current = {
      id: app.id, startX: event.clientX, startY: event.clientY,
      keys, indices,
      points: indices.map(item => layout.placement(item.id, item.index, area)),
      moved: false, offset: { x: 0, y: 0 },
      dragToken: null,
      narrowTo: wasSelected && !modifier && !event.shiftKey && keys.length > 1 ? app.id : null
    };
    setMenu(null);
  };

  // Explorer produces source-compatible HTML file-drag tokens. Its reverse
  // drop onto empty Desktop space uses the same FileDragSession as folder
  // drag and the original source's external-file _parse(...,desktopPath).
  const acceptsNativeDesktopDrop = (event: import("react").DragEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest(
      "[data-test-desktop-icon], [data-test-desktop-menu], [data-test-desktop-send-to-submenu], [data-test-desktop-confirm], .windows-desktop__layout-error"
    )) return false;
    const types = Array.from(event.dataTransfer.types);
    return types.includes(SHELL_DRAG_TYPE) || types.includes("Files");
  };
  const overNativeDesktopDrop = (event: import("react").DragEvent<HTMLDivElement>) => {
    if (!acceptsNativeDesktopDrop(event)) {
      setNativeDesktopDropHover(false);
      return;
    }
    event.preventDefault(); event.stopPropagation();
    const internal = Array.from(event.dataTransfer.types).includes(SHELL_DRAG_TYPE);
    event.dataTransfer.dropEffect = !internal || event.ctrlKey || event.metaKey ? "copy" : "move";
    setNativeDesktopDropHover(true);
  };
  const dropNativeDesktopFiles = (event: import("react").DragEvent<HTMLDivElement>) => {
    setNativeDesktopDropHover(false);
    if (!acceptsNativeDesktopDrop(event)) return;
    event.preventDefault(); event.stopPropagation();
    const desktop = sourceFilesystemRuntime.snapshot()?.desktopPath;
    if (!desktop) { setError("The original Guest Desktop is not mounted."); return; }
    const token = event.dataTransfer.getData(SHELL_DRAG_TYPE);
    if (token) {
      const mode = event.ctrlKey || event.metaKey ? "copy" : "move";
      void fileDragSession.drop(fileStore, token, desktop, mode).then(created => {
        setSelected(created.map(entry => "file:" + entry.uri));
        setError(null);
      }).catch(cause => setError(
        cause instanceof Error ? cause.message : "Cannot drop Explorer files on Desktop"
      ));
    } else {
      const files = Array.from(event.dataTransfer.files);
      if (!files.length) return;
      void importDroppedFiles(fileStore, files, desktop).then(created => {
        setSelected(created.map(entry => "file:" + entry.uri));
        setError(null);
      }).catch(cause => setError(
        cause instanceof Error ? cause.message : "Cannot import desktop files"
      ));
    }
  };

  /** Native HTML Explorer drag destination on a real Desktop file-backed
   * folder, or on the original visible Bin system icon. Unlike background
   * File imports, recycling requires a trusted in-process drag token. */
  const overNativeIconDrop = (
    event: import("react").DragEvent<HTMLButtonElement>, item: DesktopItem
  ) => {
    event.stopPropagation();
    const target = nativeDesktopIconDropTarget(item,Array.from(event.dataTransfer.types));
    if (!target) {
      setNativeIconDropHover(null);
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = target.kind === "recycle" ? "move"
      : event.ctrlKey || event.metaKey
        || !Array.from(event.dataTransfer.types).includes(SHELL_DRAG_TYPE)
        ? "copy" : "move";
    setNativeDesktopDropHover(false);
    setNativeIconDropHover(item.id);
  };
  const dropNativeIconFiles = (
    event: import("react").DragEvent<HTMLButtonElement>, item: DesktopItem
  ) => {
    const types = Array.from(event.dataTransfer.types);
    setNativeIconDropHover(null);
    if (!types.includes(SHELL_DRAG_TYPE) && !types.includes("Files")) return;
    event.preventDefault(); event.stopPropagation();
    const target = nativeDesktopIconDropTarget(item,types);
    if (!target) return;
    const token = event.dataTransfer.getData(SHELL_DRAG_TYPE);
    if (target.kind === "recycle") {
      // Untrusted File objects are never installed as fake Recycle Bin files.
      const paths = token ? fileDragSession.snapshot(token) : null;
      const trashPath = sourceFilesystemRuntime.snapshot()?.trashPath;
      if (!paths?.length || !trashPath) {
        setError("Cannot recycle this drag without a mounted source Recycle Bin.");
        return;
      }
      void fileStore.trashMany(paths,trashPath).then(() => {
        setError(null);
      }).catch(cause => setError(
        cause instanceof Error ? cause.message : "Cannot recycle Explorer files"
      ));
      return;
    }
    if (token) {
      const mode = event.ctrlKey || event.metaKey ? "copy" : "move";
      void fileDragSession.drop(fileStore,token,target.directory,mode).then(() => {
        setError(null);
      }).catch(cause => setError(
        cause instanceof Error ? cause.message : "Cannot transfer files into Desktop folder"
      ));
    } else {
      const incoming = Array.from(event.dataTransfer.files);
      if (!incoming.length) return;
      void importDroppedFiles(fileStore,incoming,target.directory).then(() => {
        setError(null);
      }).catch(cause => setError(
        cause instanceof Error ? cause.message : "Cannot import files into Desktop folder"
      ));
    }
  };

  const contextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const item = (event.target as HTMLElement).closest<HTMLElement>("[data-test-desktop-icon]");
    const id = item?.dataset.testDesktopIcon ?? null;
    menuReturnFocus.current = item instanceof HTMLButtonElement ? item : list.current;
    if (id && !selected.includes(id)) pick(id, false, false);
    const bounds = list.current?.getBoundingClientRect();
    const x=event.clientX-(bounds?.left??0);
    const y=event.clientY-(bounds?.top??0);
    // The source measures the real popup before deciding its edge flip.
    // Initial anchor is corrected in a layout effect after mount.
    setMenu({id,view:false,sortOpen:false,newOpen:false,anchorX:x,anchorY:y,x,y});
  };
  // The source menu supports roving arrow focus, but a right-click
  // does not focus the popup automatically in Chromium. Focus its first
  // enabled action only when the anchor changes, never on submenu
  // re-render or viewport position correction.
  useLayoutEffect(()=>{
    if(!menu||!menuHost.current)return;
    menuHost.current.querySelector<HTMLButtonElement>(
      'button[role="menuitem"]:not(:disabled)'
    )?.focus({preventScroll:true});
  },[menu?.id,menu?.anchorX,menu?.anchorY]);
  useLayoutEffect(()=>{
    const element=menuHost.current;
    if(!element||!menu)return;
    const position=sourceDesktopMenuPosition(
      {x:menu.anchorX,y:menu.anchorY},
      {width:element.offsetWidth,height:element.offsetHeight},area);
    if(menu.x===position.x&&menu.y===position.y)return;
    setMenu(current=>current?{...current,x:position.x,y:position.y}:current);
  },[menu,area]);
  // Pinned main.js DesktopMenu: Copy path and Upload here operate on
  // the source-mounted Guest desktop, never on the host filesystem.
  const copyDesktopPath = () => {
    setMenu(null);
    const path = sourceFilesystemRuntime.snapshot()?.desktopPath;
    if (!path) { setError("The original Guest Desktop is not mounted."); return; }
    if (!navigator.clipboard?.writeText) {
      setError("Clipboard permission is unavailable.");
      return;
    }
    void navigator.clipboard.writeText(path).then(() => {
      setError(null);
    }).catch(cause => {
      setError(cause instanceof Error ? cause.message : "Cannot copy Desktop path");
    });
  };
  const importDesktopUploads = (files: FileList | null) => {
    const batch=Array.from(files ?? []);
    if (!batch.length) return;
    const desktop=sourceFilesystemRuntime.snapshot()?.desktopPath;
    if (!desktop) {setError("The original Guest Desktop is not mounted."); return;}
    void importDroppedFiles(fileStore,batch,desktop).then(created => {
      setSelected(created.map(entry => "file:" + entry.uri));
      setError(null);
    }).catch(cause => setError(
      cause instanceof Error ? cause.message : "Cannot import desktop files"
    ));
  };
  const openDisplaySettings = () => {
    setMenu(null);
    const panel=appRegistry.get("cpanel");
    if (!panel) {setError("The original Display settings are not yet available.");return;}
    dispatch({type:"OPEN_APP",app:panel,file:{path:"display"}});
    setError(null);
  };

  const openPersonalization = () => {
    setMenu(null);
    const app=appRegistry.get("personalize");
    if(!app){setError("The original Personalization program is unavailable.");return;}
    dispatch({type:"OPEN_APP",app});
    setError(null);
  };

  const changeSettings = (update: () => void) => {
    try {
      update();
      setOptions(layout.snapshot());
      setMenu(null);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Desktop preferences could not be saved");
    }
  };
  /** Source DesktopMenu B.sortDesktop/setDesktopSortDirection.
   * Changes the Guest VFS icon positions, not the host filesystem. */
  const applyDesktopSort=(key:SourceDesktopSortKey,asc?:boolean)=>{
    const next=asc===undefined
      ?sourceNextDesktopSort(sortChoice,key):{key,asc};
    const sorted=sourceSortDesktopItems(items.map(item=>({
      id:item.id,label:item.label,
      type:item.file?.entry.type??item.app?.kind??"",
      size:item.file?.entry.size??0,
      mtime:item.file?.entry.mtime??0
    })),next);
    changeSettings(()=>layout.arrange(sorted.map(item=>item.id),area));
    setSortChoice(next);
  };

  const size = SOURCE_DESKTOP_ICON_SIZES[options.iconSize];
  const contextItem=items.find(item=>item.id===menu?.id);
  const contextKeys=menu?.id&&selected.includes(menu.id)?selected:
    menu?.id?[menu.id]:[];
  const desktopPath=sourceFilesystemRuntime.snapshot()?.desktopPath;
  const contextPaths=desktopSelectedFilePaths(items,contextKeys);
  const canCompressGuest=Boolean(contextItem?.file&&desktopPath&&
    sourceCanCompressSelection(desktopPath,contextPaths));
  const itemActions=contextItem?sourceDesktopItemMenu({
    id:contextItem.id,
    isFile:Boolean(contextItem.file),
    fileName:contextItem.file?.entry.name,
    fileType:contextItem.file?.entry.type,
    programInstalled:Boolean(
      contextItem.app&&sourceProgramsById.get(contextItem.app.id)?.installPath),
    multiple:contextKeys.length>1,
    canPin:Boolean(contextItem.app && appRegistry.get(contextItem.id)),
    canCompressGuest,
    pinned:pinned.includes(contextItem.id),
    trashCount
  }):[];
  // The child is a separate popup so the root menu's source scroll clamp
  // cannot clip it. Flip left near the screen edge as the original does.
  const submenuWidth=194;
  const menuWidth=menuHost.current?.offsetWidth??submenuWidth;
  const rightSpace=menu?area.width-(menu.x+menuWidth):0;
  const leftSpace=menu?.x??0;
  const sendToX=!menu?0:rightSpace>=submenuWidth
    ?menu.x+menuWidth:leftSpace>=submenuWidth
    ?menu.x-submenuWidth:rightSpace>=leftSpace
    ?Math.max(0,area.width-submenuWidth):0;
  const sendToY=menu ? Math.max(0,Math.min(
    menu.y+4+Math.max(0,itemActions.findIndex(action=>action.id==="send-to"))*27,
    area.height-42)) : 0;
  const focusSendTo=()=>window.requestAnimationFrame(()=>
    sendToMenuHost.current?.querySelector<HTMLButtonElement>(
      '[data-test-desktop-send-to-kind="compress"]')?.focus({preventScroll:true}));
  const runItemAction=(action:SourceDesktopItemMenuAction,item:DesktopItem)=>{
    switch(action){
      case "open":
        setMenu(null);openItem(item);break;
      case "empty-bin":requestEmptyBin();break;
      case "send-desktop":sendProgramToDesktop(item);break;
      case "download":downloadSourceFile(item);break;
      case "cut":prepareDesktopClipboard("cut",contextKeys);break;
      case "copy":prepareDesktopClipboard("copy",contextKeys);break;
      case "delete":requestDesktopDelete(contextKeys);break;
      case "rename":if(item.file)beginRename(item.file);break;
      case "pin":
        if(item.app&&appRegistry.get(item.app.id)){
          taskbarPins.toggle(item.app.id);
          setMenu(null);
        }
        break;
      // The parent opens a real submenu. Properties remains unimplemented.
      case "send-to":break;
      case "properties":break;
    }
  };

  return <div id="desktop-icons" ref={list}
    className={"desktop__icon-list windows-desktop__icons" +
      (nativeDesktopDropHover ? " is-native-drop-target" : "")} tabIndex={0}
    aria-label="Desktop icons"
    data-test-desktop-layout={options.autoArrange ? "auto" : "free"}
    onContextMenu={contextMenu}
    onDragOver={overNativeDesktopDrop}
    onDragLeave={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
        setNativeDesktopDropHover(false);
      }
    }}
    onDrop={dropNativeDesktopFiles}
    onPointerDown={startBand}
    onClick={event => {
      if (ignoreClick.current) {ignoreClick.current=false;return;}
      if ((event.target as HTMLElement).closest("[data-test-desktop-menu], [data-test-desktop-send-to-submenu], [data-test-desktop-create], [data-test-desktop-confirm]")) return;
      if ((event.target as HTMLElement).closest("[data-test-desktop-icon]")) return;
      setSelected([]);anchor.current=null;dispatch({ type:"SELECT_ICON", id:null });
    }}
    onKeyDown={event => {
      const target = event.target as HTMLElement;
      // Desktop keyboard scope is its focused background/icons only, never a
      // rename field, shortcut wizard, menu, modal or another application's UI.
      if (target.closest("input,textarea,select,[contenteditable='true'],[role='dialog'],[data-test-desktop-menu]")) return;
      if (target !== event.currentTarget && !target.closest("[data-test-desktop-icon]")) return;
      const key = event.key.toLowerCase();
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && !event.altKey) {
        if (key === "a") {
          event.preventDefault(); setSelected(items.map(item => item.id));
        } else if (key === "c" || key === "x") {
          const paths = desktopSelectedFilePaths(items, selected);
          if (paths.length) {
            event.preventDefault();
            prepareDesktopClipboard(key === "c" ? "copy" : "cut", selected);
          }
        } else if (key === "v" && clipboardState.paths.length) {
          event.preventDefault(); pasteDesktopFiles();
        }
      } else if (event.key === "Delete" && !event.altKey && !event.shiftKey) {
        if (desktopSelectedFilePaths(items, selected).length) {
          event.preventDefault(); requestDesktopDelete(selected);
        }
      } else if (event.key === "Escape") {
        setSelected([]); setMenu(null);
      }
    }}>
    {options.showIcons && items.map((app,index) => {
      const position = layout.placement(app.id, index, area);
      const offset = drag?.keys.includes(app.id) ? drag.offset : null;
      const fileArtwork=app.file?sourceDesktopFileArtwork(app.file,theme):null;
      const artwork=fileArtwork?.icon??(
        (!app.file && (app.id === "computer"
          ? sourceShellAsset(theme, "computer")
          : app.id === "bin" ? sourceShellAsset(theme, trashCount > 0 ? "binFull" : "bin")
          : sourceThemeProgramArt(theme,app.id))) || app.icon);
      return <button type="button" key={app.id} data-test-desktop-icon={app.id}
        data-test-desktop-file={app.file?.entry.uri}
        data-source-desktop-icon-type={app.file?.iconType}
        data-source-desktop-icon-override={app.file?.iconOverride??undefined}
        data-source-desktop-artwork={fileArtwork?.artwork}
        data-test-desktop-x={position.x} data-test-desktop-y={position.y}
        data-test-desktop-selected={selected.includes(app.id)}
        className={"desktop__icon-item windows-desktop__shortcut" +
          (selected.includes(app.id) ? " is-active" : "") +
          (offset ? " is-dragging" : "") +
          (app.id === "bin" && overBin ? " is-drop-target" : "") +
          (nativeIconDropHover === app.id ? " is-native-icon-drop-target" : "")}
        style={{
          width: size, height: size,
          transform: "translate(" + position.x + "px, " + position.y + "px)"
        }}
        data-test-native-icon-drop-target={nativeIconDropHover === app.id ? "true" : undefined}
        onDragOver={event => overNativeIconDrop(event,app)}
        onDragLeave={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setNativeIconDropHover(null);
          }
        }}
        onDrop={event => dropNativeIconFiles(event,app)}
        onPointerDown={event => startPress(event,app)}
        onClick={event => {
          event.stopPropagation();
          if ((event.target as HTMLElement).closest("input")) return;
          if (ignoreClick.current) {ignoreClick.current=false;return;}
          if (!(event.ctrlKey || event.metaKey || event.shiftKey)) {
            setSelected([app.id]);anchor.current=app.id;
          }
          dispatch({ type:"SELECT_ICON", id:app.id });
        }}
        onDoubleClick={event => {
          event.stopPropagation();
          if ((event.target as HTMLElement).closest("input")) return;
          if (ignoreClick.current) {ignoreClick.current=false;return;}
          openItem(app);
        }}
        onKeyDown={event => {
          if (event.key === "F2" && app.file && !renaming) {
            event.preventDefault();
            event.stopPropagation();
            beginRename(app.file);
          }
        }}
        aria-label={app.label} title={app.label}>
        <span className="desktop__icon-box"><img className="desktop__icon-icon"
          src={artwork} draggable={false} alt="" /></span>
        <span className="desktop__icon-name">
          {app.file && renaming?.id === app.id
            ? <input className="windows-desktop__rename-input" autoFocus
                data-test-desktop-rename=""
                aria-label={"Rename " + app.file.label} maxLength={30}
                value={renaming.value}
                onFocus={event => event.currentTarget.select()}
                onPointerDown={event => event.stopPropagation()}
                onChange={event => changeRename(app.id,event.target.value)}
                onKeyDown={event => {
                  event.stopPropagation();
                  if (event.key === "Enter") {
                    event.preventDefault(); finishRename(app.file!);
                  } else if (event.key === "Escape") {
                    event.preventDefault(); cancelRename();
                  }
                }}
                onBlur={() => finishRename(app.file!)} />
            : app.label}
        </span>
        {offset && <span data-test-desktop-ghost=""
          className="desktop__icon-ghost" style={{
            transform: "translate(" + offset.x + "px," + offset.y + "px)"
          }}>
          <span className="desktop__icon-box"><img className="desktop__icon-icon"
            src={artwork} draggable={false} alt="" /></span>
          <span className="desktop__icon-name">{app.label}</span>
        </span>}
      </button>;
    })}
    {band && <div data-test-desktop-band="" className="desktop__icon-band windows-desktop__band"
      style={{ left: band.left, top: band.top, width: band.width, height: band.height }}
      aria-hidden="true" />}
    {menu && <div ref={menuHost} role="menu" className="windows-desktop__menu"
      data-test-desktop-menu="" style={{ left: menu.x, top: menu.y }}
      onKeyDown={event=>{
        if(sourceMenuArrowFocus(menuHost.current,event.target,event.key)){
          event.preventDefault();return;
        }
        if(event.key==="ArrowLeft"&&(menu.view||menu.sortOpen||menu.newOpen)){
          event.preventDefault();
          const parent=menu.view?"[data-test-desktop-view]":menu.sortOpen?"[data-test-desktop-sort]":"[data-test-desktop-new]";
          setMenu(current=>current?{...current,view:false,sortOpen:false,newOpen:false}:current);
          window.requestAnimationFrame(()=>menuHost.current
            ?.querySelector<HTMLButtonElement>(parent)?.focus({preventScroll:true}));
        }
      }}>
      {menu.id ? <>
        {contextItem&&itemActions.map(action=>
          <button key={action.id} role="menuitem"
            data-test-desktop-item-action={action.id}
            aria-haspopup={action.id==="send-to"?"menu":undefined}
            aria-expanded={action.id==="send-to"?Boolean(menu.sendToOpen):undefined}
            disabled={action.disabled}
            title={action.disabled?"Original action not yet migrated or unavailable":undefined}
            onPointerEnter={()=>setMenu(current=>current?.id===contextItem.id
              ?{...current,sendToOpen:action.id==="send-to"&&!action.disabled}:current)}
            onFocus={()=>{
              if(action.id!=="send-to"&&menu.sendToOpen)
                setMenu(current=>current?{...current,sendToOpen:false}:current);
            }}
            onKeyDown={event=>{
              if(action.id==="send-to"&&!action.disabled&&event.key==="ArrowRight"){
                event.preventDefault();
                setMenu(current=>current?{...current,sendToOpen:true}:current);
                focusSendTo();
              }
            }}
            onClick={()=>{
              if(action.id==="send-to"){
                setMenu(current=>current?{...current,sendToOpen:!current.sendToOpen}:current);
                focusSendTo();
              }else runItemAction(action.id,contextItem);
            }}>
            {action.label}
          </button>)}
      </> : <>
        <button role="menuitem" aria-expanded={menu.view}
          aria-haspopup="menu" data-test-desktop-view=""
          onPointerEnter={() => setMenu(current => current && !current.view
            ? {...current,view:true,sortOpen:false,newOpen:false} : current)}
          onKeyDown={event => {
            if(event.key==="ArrowRight"){
              event.preventDefault();
              setMenu(current => current?{...current,view:true,sortOpen:false,newOpen:false}:current);
              window.requestAnimationFrame(()=>menuHost.current
                ?.querySelector<HTMLButtonElement>('[role="menuitemradio"]')
                ?.focus({preventScroll:true}));
            }
          }}
          onClick={() => setMenu(current => current
            ? {...current,view:true,sortOpen:false,newOpen:false}:current)}>View ▸</button>
        {menu.view && <>
          {([["lg","Large icons"],["md","Medium icons"],["sm","Small icons"]] as const)
            .map(([value,label]) => <button key={value} role="menuitemradio"
              aria-checked={options.iconSize === value}
              onClick={() => changeSettings(() => layout.setIconSize(value as DesktopIconSize))}>
              {options.iconSize === value ? "✓ " : "　"}{label}</button>)}
          <button role="menuitemcheckbox" aria-checked={options.autoArrange}
            onClick={() => changeSettings(() => layout.setAutoArrange(!options.autoArrange))}>
            {options.autoArrange ? "✓ " : "　"}Auto arrange icons</button>
          <button role="menuitemcheckbox" aria-checked={options.showIcons}
            onClick={() => changeSettings(() => layout.setShowIcons(!options.showIcons))}>
            {options.showIcons ? "✓ " : "　"}Show desktop icons</button>
        </>}
        <button role="menuitem" aria-expanded={menu.sortOpen}
          aria-haspopup="menu" data-test-desktop-sort=""
          onPointerEnter={() => setMenu(current=>current&&!current.sortOpen
            ?{...current,sortOpen:true,view:false,newOpen:false}:current)}
          onKeyDown={event=>{
            if(event.key==="ArrowRight"){
              event.preventDefault();
              setMenu(current=>current?{...current,sortOpen:true,view:false,newOpen:false}:current);
              window.requestAnimationFrame(()=>menuHost.current
                ?.querySelector<HTMLButtonElement>('[data-test-desktop-sort-name]')
                ?.focus({preventScroll:true}));
            }
          }}
          onClick={()=>setMenu(current=>current
            ?{...current,sortOpen:true,view:false,newOpen:false}:current)}>Sort by ▸</button>
        {menu.sortOpen&&<>
          {([
            ["name","Name"],["size","Size"],["type","Item type"],["date","Date modified"]
          ] as const).map(([key,label])=>
            <button key={key} role="menuitemradio"
              data-test-desktop-sort-name={key==="name"?"":undefined}
              data-test-desktop-sort-key={key}
              aria-checked={sortChoice.key===key}
              onClick={()=>applyDesktopSort(key)}>
              {sortChoice.key===key?"✓ ":"　"}{label}</button>)}
          {([["asc","Ascending"],["desc","Descending"]] as const)
            .map(([direction,label])=><button key={direction}
              role="menuitemradio" data-test-desktop-sort-direction={direction}
              aria-checked={sortChoice.asc===(direction==="asc")}
              onClick={()=>applyDesktopSort(sortChoice.key,direction==="asc")}>
              {sortChoice.asc===(direction==="asc")?"✓ ":"　"}{label}</button>)}
        </>}
        <button role="menuitem" onClick={() => {setMenu(null);setOptions(layout.snapshot());}}>
          Refresh</button>
        <button role="menuitem" disabled={!clipboardState.paths.length}
          onClick={pasteDesktopFiles}>Paste</button>
        {SOURCE_FINAL_DESKTOP_MENU_FLAGS.showMenuCopyPath&&
          <button role="menuitem" data-test-desktop-copy-path=""
            onClick={copyDesktopPath}>Copy Path</button>}
        {SOURCE_FINAL_DESKTOP_MENU_FLAGS.showUploadFiles&&
          <button role="menuitem" data-test-desktop-upload-here=""
            onClick={() => {setMenu(null);uploadInput.current?.click();}}>
            Upload Files</button>}
        {SOURCE_FINAL_DESKTOP_MENU_FLAGS.showMapDirectory&&
          <button role="menuitem" data-test-desktop-map-directory=""
            disabled title="Mapped directory host-permission adapter is not yet migrated">
            Map Directory</button>}
        <button role="menuitem" aria-expanded={menu.newOpen}
          aria-haspopup="menu" data-test-desktop-new=""
          onPointerEnter={() => setMenu(current => current && !current.newOpen
            ? {...current,newOpen:true,view:false,sortOpen:false}:current)}
          onKeyDown={event => {
            if(event.key==="ArrowRight"){
              event.preventDefault();
              setMenu(current => current?{...current,newOpen:true,view:false,sortOpen:false}:current);
              window.requestAnimationFrame(()=>menuHost.current
                ?.querySelector<HTMLButtonElement>('[data-test-desktop-new-folder]')
                ?.focus({preventScroll:true}));
            }
          }}
          onClick={() => setMenu(current => current
            ? {...current,newOpen:true,view:false,sortOpen:false}:current)}>
          New ▸</button>
        {menu.newOpen && <>
          <button role="menuitem" data-test-desktop-new-folder=""
            onClick={() => newDesktopItem("folder")}>Folder</button>
          <button role="menuitem" data-test-desktop-new-shortcut=""
            onClick={openShortcutWizard}>Shortcut</button>
          <button role="menuitem" data-test-desktop-new-richtext=""
            onClick={() => newDesktopItem("richtext")}>Rich Text Document</button>
          <button role="menuitem" data-test-desktop-new-text=""
            onClick={() => newDesktopItem("text")}>Text Document</button>
        </>}
        <button role="menuitem" data-test-desktop-display=""
          onClick={openDisplaySettings}>Display</button>
        <button role="menuitem" disabled data-test-desktop-gadgets=""
          title="Original Gadgets application is not yet migrated">Gadgets</button>
        <button role="menuitem" data-test-desktop-personalize=""
          onClick={openPersonalization}>Personalize</button>
      </>}
    </div>}
    <input type="file" multiple hidden ref={uploadInput}
      aria-label="Upload files to Desktop" data-test-desktop-upload-input=""
      onChange={event=>{
        importDesktopUploads(event.currentTarget.files);
        event.currentTarget.value="";
      }}/>
    {pendingEmptyBin&&<div className="windows-desktop__create-backdrop"
      data-test-desktop-empty-bin="" role="alertdialog" aria-modal="true"
      aria-label="Confirm empty Recycle Bin"
      onPointerDown={event=>event.stopPropagation()}
      onClick={event=>event.stopPropagation()}
      onContextMenu={event=>event.stopPropagation()}
      onKeyDown={event=>{
        if(event.key==="Escape"){event.preventDefault();setPendingEmptyBin(false);}
      }}>
      <div className="windows-desktop__create-dialog">
        <h3>Empty Recycle Bin</h3>
        <p>Permanently delete all {trashCount} item{trashCount===1?"":"s"} in
          the Recycle Bin?</p>
        <div className="windows-desktop__create-actions">
          <button autoFocus type="button"
            onClick={()=>setPendingEmptyBin(false)}>No</button>
          <button type="button" onClick={confirmEmptyBin}>Yes</button>
        </div>
      </div>
    </div>}
    {menu?.id&&menu.sendToOpen&&canCompressGuest&&
      <div ref={sendToMenuHost} role="menu"
        className="windows-desktop__menu windows-desktop__send-to-menu"
        data-test-desktop-send-to-submenu=""
        aria-label="Send to"
        style={{left:sendToX,top:sendToY}}
        onContextMenu={event=>{event.preventDefault();event.stopPropagation();}}
        onKeyDown={event=>{
          if(sourceMenuArrowFocus(sendToMenuHost.current,event.target,event.key)){
            event.preventDefault();event.stopPropagation();return;
          }
          if(event.key==="ArrowLeft"){
            event.preventDefault();event.stopPropagation();
            setMenu(current=>current?{...current,sendToOpen:false}:current);
            window.requestAnimationFrame(()=>menuHost.current
              ?.querySelector<HTMLButtonElement>(
                '[data-test-desktop-item-action="send-to"]')
              ?.focus({preventScroll:true}));
          }
        }}>
        <button role="menuitem" data-test-desktop-send-to-kind="compress"
          onClick={()=>compressDesktopSelection(contextKeys)}>
          Compressed (zipped) folder
        </button>
      </div>}
    {pendingDelete && <div className="windows-desktop__create-backdrop"
      data-test-desktop-confirm="" role="alertdialog" aria-modal="true"
      aria-label="Confirm desktop deletion"
      onPointerDown={event => event.stopPropagation()}
      onClick={event => event.stopPropagation()}
      onContextMenu={event => event.stopPropagation()}
      onKeyDown={event => {
        if (event.key === "Escape") {
          event.preventDefault(); event.stopPropagation(); setPendingDelete(null);
        }
      }}>
      <div className="windows-desktop__create-dialog">
        <h3>Move to Recycle Bin</h3>
        <p>Move {pendingDelete.length} selected item{pendingDelete.length === 1 ? "" : "s"} to the Recycle Bin?</p>
        <div className="windows-desktop__create-actions">
          <button autoFocus type="button" onClick={() => setPendingDelete(null)}>No</button>
          <button type="button" onClick={confirmDesktopDelete}>Yes</button>
        </div>
      </div>
    </div>}
    {error && <div className="windows-desktop__layout-error" role="alert">
      {error}<button onClick={() => setError(null)}>×</button>
    </div>}
  </div>;
}
