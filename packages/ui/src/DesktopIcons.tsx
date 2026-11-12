import {
  useCallback, useEffect, useMemo, useRef, useState,
  type Dispatch, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent
} from "react";
import type { AppDefinition, DesktopAction } from "@windows-os/contracts";
import {
  desktopBand, desktopBandHits, desktopBandSelection,
  type DesktopBand, type DesktopBandModifier
} from "./desktopSelection";
import { appRegistry, browserStorage, fileStore, sourceFilesystemRuntime } from "@windows-os/sdk";
import { listSourceDesktopFiles, type SourceDesktopFile } from "./desktopFiles";
import { desktopEditableName, renameSourceDesktopFile } from "./desktopRename";
import {
  createSourceDesktopItem, createSourceDesktopShortcut, type DesktopNewItem
} from "./desktopCreate";
import { sourcePrograms } from "@windows-os/filesystem";
import { hitDesktopRecycleBin } from "./desktopDrop";
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
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [shortcutDraft, setShortcutDraft] = useState<{ programId: string; name: string } | null>(null);
  const [creatingShortcut, setCreatingShortcut] = useState(false);
  const shortcutTargets = useMemo(() => sourcePrograms.filter(program =>
    program.installPath && appRegistry.get(program.id)
  ), []);
  const [renaming, setRenaming] = useState<{id:string;value:string} | null>(null);
  const renameRef = useRef<{id:string;value:string} | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const press = useRef<ActivePress | null>(null);
  const bandPress = useRef<ActiveBand | null>(null);
  const anchor = useRef<string | null>(null);
  const ignoreClick = useRef(false);

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

  const deleteFile = (file: SourceDesktopFile) => {
    const trashPath = sourceFilesystemRuntime.snapshot()?.trashPath;
    if (!trashPath) {
      setError("The original Recycle Bin is not mounted.");
      return;
    }
    void fileStore.trash(file.entry.uri, trashPath).catch(cause =>
      setError(cause instanceof Error ? cause.message : "Cannot delete desktop file"));
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
    const first = shortcutTargets[0];
    if (!first) { setError("No migrated source programs are available for shortcuts."); return; }
    setShortcutDraft({
      programId: first.id,
      name: (appRegistry.get(first.id)?.label ?? first.name) + " - Shortcut"
    });
    setError(null);
  };
  const submitShortcut = () => {
    if (!shortcutDraft || creatingShortcut) return;
    const path = sourceFilesystemRuntime.snapshot()?.desktopPath;
    if (!path) { setError("The original Guest Desktop is not mounted."); return; }
    setCreatingShortcut(true);
    void createSourceDesktopShortcut(
      fileStore, path, shortcutDraft.programId, shortcutDraft.name
    ).then(uri => {
      const id = "file:" + uri;
      setShortcutDraft(null);
      setSelected([id]);
      anchor.current = id;
      setError(null);
    }).catch(cause =>
      setError(cause instanceof Error ? cause.message : "Cannot create shortcut")
    ).finally(() => setCreatingShortcut(false));
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
    press.current = null;
    setDrag(null);
    setOverBin(false);
  }, []);
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
      setOverBin(allFileItems && onRecycleBin(event.clientX, event.clientY));
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
  }, [options.autoArrange, options.iconSize, area, layout, closePress, items, onRecycleBin]);

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
      "[data-test-desktop-icon], [data-test-desktop-menu], [data-test-desktop-create], .windows-desktop__layout-error"
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
      if ((event.target as HTMLElement).closest("[data-test-desktop-menu], [data-test-desktop-create]")) return;
      if ((event.target as HTMLElement).closest("[data-test-desktop-icon]")) return;
      setSelected([]);anchor.current=null;dispatch({ type:"SELECT_ICON", id:null });
    }}
    onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
        event.preventDefault();setSelected(items.map(item=>item.id));
      } else if (event.key === "Escape") {
        setSelected([]);setMenu(null);
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
            const file = items.find(item => item.id === menu.id)?.file;
            setMenu(null);
            if (file) beginRename(file);
          }}>Rename</button>
          <button role="menuitem" onClick={() => {
            const file = items.find(item => item.id === menu.id)?.file;
            setMenu(null);
            if (file) deleteFile(file);
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
    {shortcutDraft && <div className="windows-desktop__create-backdrop"
      data-test-desktop-create="" role="dialog" aria-modal="true"
      aria-label="Create desktop shortcut"
      onPointerDown={event => event.stopPropagation()}
      onClick={event => event.stopPropagation()}
      onContextMenu={event => event.stopPropagation()}
      onKeyDown={event => {
        if (event.key === "Escape") {
          event.preventDefault(); event.stopPropagation(); setShortcutDraft(null);
        }
      }}>
      <form className="windows-desktop__create-dialog" onSubmit={event => {
        event.preventDefault(); submitShortcut();
      }}>
        <h3>Create Shortcut</h3>
        <p>Select a migrated source program. The shortcut is stored in your Guest Desktop.</p>
        <label htmlFor="desktop-shortcut-target">Program</label>
        <select id="desktop-shortcut-target" aria-label="Shortcut program"
          value={shortcutDraft.programId} disabled={creatingShortcut}
          onChange={event => {
            const programId = event.target.value;
            const target = shortcutTargets.find(item => item.id === programId);
            if (target) setShortcutDraft({
              programId, name: (appRegistry.get(programId)?.label ?? target.name) + " - Shortcut"
            });
          }}>
          {shortcutTargets.map(program => <option key={program.id} value={program.id}>
            {appRegistry.get(program.id)?.label ?? program.name}
          </option>)}
        </select>
        <label htmlFor="desktop-shortcut-name">Name</label>
        <input id="desktop-shortcut-name" aria-label="Shortcut name" maxLength={30}
          autoFocus value={shortcutDraft.name} disabled={creatingShortcut}
          onChange={event => setShortcutDraft({ ...shortcutDraft, name: event.target.value })} />
        <div className="windows-desktop__create-actions">
          <button type="button" onClick={() => setShortcutDraft(null)}
            disabled={creatingShortcut}>Cancel</button>
          <button type="submit" disabled={creatingShortcut}>Create</button>
        </div>
      </form>
    </div>}
    {error && <div className="windows-desktop__layout-error" role="alert">
      {error}<button onClick={() => setError(null)}>×</button>
    </div>}
  </div>;
}
