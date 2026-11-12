import {
  useCallback, useEffect, useMemo, useRef, useState,
  type Dispatch, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent
} from "react";
import type { AppDefinition, DesktopAction } from "@windows-os/contracts";
import {
  desktopBand, desktopBandHits, desktopBandSelection,
  type DesktopBand, type DesktopBandModifier
} from "./desktopSelection";
import { appRegistry, browserStorage, fileClipboard, fileDragSession, fileStore, sourceFilesystemRuntime } from "@windows-os/sdk";
import { listSourceDesktopFiles, type SourceDesktopFile } from "./desktopFiles";
import { desktopEditableName, renameSourceDesktopFile } from "./desktopRename";
import {
  createSourceDesktopItem, type DesktopNewItem
} from "./desktopCreate";
import { hitDesktopRecycleBin } from "./desktopDrop";
import { desktopSelectedFilePaths } from "./desktopFileActions";
import { explorerDropTargetAt } from "./desktopExplorerDrop";
import {
  DesktopPositionStore, SOURCE_DESKTOP_DRAG_THRESHOLD, SOURCE_DESKTOP_ICON_SIZES,
  boundedIconDrag, type DesktopArea, type DesktopIconSize, type DesktopPoint
} from "./desktopPositions";

interface DesktopIconsProps {
  apps: readonly AppDefinition[];
  dispatch: Dispatch<DesktopAction>;
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
type DesktopMenu = { x: number; y: number; id: string | null; view: boolean; newOpen: boolean };
interface ActiveBand {
  start: DesktopPoint;
  previous: string[];
  modifier: DesktopBandModifier;
  moved: boolean;
}

export function DesktopIcons({ apps, dispatch }: DesktopIconsProps) {
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
      icon: file.programId ? appRegistry.get(file.programId)?.icon ?? file.icon : file.icon,
      file
    }))
  ], [apps, guestFiles]);
  const [drag, setDrag] = useState<{ keys: string[]; offset: DesktopPoint } | null>(null);
  const [overBin, setOverBin] = useState(false);
  const [band, setBand] = useState<DesktopBand | null>(null);
  const [menu, setMenu] = useState<DesktopMenu | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clipboardState, setClipboardState] = useState(() => fileClipboard.snapshot());
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{id:string;value:string} | null>(null);
  const renameRef = useRef<{id:string;value:string} | null>(null);
  const list = useRef<HTMLDivElement>(null);
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

  const openItem = (item: DesktopItem) => {
    if (item.app) {
      dispatch({ type: "OPEN_APP", app: item.app });
      return;
    }
    const file = item.file;
    if (!file) return;
    const computer = appRegistry.get("computer");
    if (file.entry.type === "directory" && computer) {
      dispatch({ type: "OPEN_APP", app: computer, file: { path: file.entry.uri } });
    } else if (file.programId) {
      const app = appRegistry.get(file.programId);
      if (app) dispatch({ type: "OPEN_APP", app });
      else setError("The original " + file.label + " program is not yet migrated.");
    } else if (/\.txt$/i.test(file.entry.name)) {
      const notepad = appRegistry.get("notepad");
      if (notepad) dispatch({
        type: "OPEN_APP", app: notepad, file: { path: file.entry.uri }
      });
    } else {
      setError("No original application association has been migrated for " + file.entry.name);
    }
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
      "[data-test-desktop-icon], [data-test-desktop-menu], [data-test-desktop-create], [data-test-desktop-confirm], .windows-desktop__layout-error"
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
      if (!(event.target instanceof Element && event.target.closest("[data-test-desktop-menu]"))) {
        setMenu(null);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
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

  const contextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const item = (event.target as HTMLElement).closest<HTMLElement>("[data-test-desktop-icon]");
    const id = item?.dataset.testDesktopIcon ?? null;
    if (id && !selected.includes(id)) pick(id, false, false);
    const bounds = list.current?.getBoundingClientRect();
    setMenu({
      id, view: false, newOpen: false,
      x: Math.max(0, Math.min(event.clientX - (bounds?.left ?? 0), Math.max(0, area.width - 196))),
      y: Math.max(0, Math.min(event.clientY - (bounds?.top ?? 0), Math.max(0, area.height - 270)))
    });
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
  const size = SOURCE_DESKTOP_ICON_SIZES[options.iconSize];

  return <div id="desktop-icons" ref={list}
    className="desktop__icon-list windows-desktop__icons" tabIndex={0}
    aria-label="Desktop icons"
    data-test-desktop-layout={options.autoArrange ? "auto" : "free"}
    onContextMenu={contextMenu}
    onPointerDown={startBand}
    onClick={event => {
      if (ignoreClick.current) {ignoreClick.current=false;return;}
      if ((event.target as HTMLElement).closest("[data-test-desktop-menu], [data-test-desktop-create], [data-test-desktop-confirm]")) return;
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
      return <button type="button" key={app.id} data-test-desktop-icon={app.id}
        data-test-desktop-file={app.file?.entry.uri}
        data-test-desktop-x={position.x} data-test-desktop-y={position.y}
        data-test-desktop-selected={selected.includes(app.id)}
        className={"desktop__icon-item windows-desktop__shortcut" +
          (selected.includes(app.id) ? " is-active" : "") +
          (offset ? " is-dragging" : "") +
          (app.id === "bin" && overBin ? " is-drop-target" : "")}
        style={{
          width: size, height: size,
          transform: "translate(" + position.x + "px, " + position.y + "px)"
        }}
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
          src={app.icon} draggable={false} alt="" /></span>
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
            src={app.icon} draggable={false} alt="" /></span>
          <span className="desktop__icon-name">{app.label}</span>
        </span>}
      </button>;
    })}
    {band && <div data-test-desktop-band="" className="desktop__icon-band windows-desktop__band"
      style={{ left: band.left, top: band.top, width: band.width, height: band.height }}
      aria-hidden="true" />}
    {menu && <div role="menu" className="windows-desktop__menu"
      data-test-desktop-menu="" style={{ left: menu.x, top: menu.y }}>
      {menu.id ? <>
        <button role="menuitem" onClick={() => {
          const app = items.find(item => item.id === menu.id);
          setMenu(null);
          if (app) openItem(app);
        }}>Open</button>
        {items.find(item => item.id === menu.id)?.file && <>
          <button role="menuitem" onClick={() => {
            prepareDesktopClipboard("cut", selected.includes(menu.id!) ? selected : [menu.id!]);
          }}>Cut</button>
          <button role="menuitem" onClick={() => {
            prepareDesktopClipboard("copy", selected.includes(menu.id!) ? selected : [menu.id!]);
          }}>Copy</button>
          <button role="menuitem" onClick={() => {
            const file = items.find(item => item.id === menu.id)?.file;
            setMenu(null);
            if (file) beginRename(file);
          }}>Rename</button>
          <button role="menuitem" onClick={() => {
            requestDesktopDelete(selected.includes(menu.id!) ? selected : [menu.id!]);
          }}>Delete</button>
        </>}
        <button role="menuitem" disabled title="Original shortcut properties are pending">Properties</button>
      </> : <>
        <button role="menuitem" aria-expanded={menu.view}
          onClick={() => setMenu({ ...menu, view: !menu.view, newOpen: false })}>View ▸</button>
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
        <button role="menuitem" onClick={() => {setMenu(null);setOptions(layout.snapshot());}}>
          Refresh</button>
        <button role="menuitem" disabled={!clipboardState.paths.length}
          onClick={pasteDesktopFiles}>Paste</button>
        <button role="menuitem" aria-expanded={menu.newOpen}
          data-test-desktop-new=""
          onClick={() => setMenu({ ...menu, newOpen: !menu.newOpen, view: false })}>
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
      </>}
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
