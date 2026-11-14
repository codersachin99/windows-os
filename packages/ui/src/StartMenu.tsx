import { useEffect, useState, type Dispatch } from "react";
import type { DesktopAction } from "@windows-os/contracts";
import { legacyArt } from "@windows-os/assets";
import {
  parseSourceShortcut, SOURCE_START_MENU_PROGRAMS,
  sourceProgramsById, type FileEntry
} from "@windows-os/filesystem";
import { appRegistry, fileStore } from "@windows-os/sdk";

interface StartMenuProps {
  dispatch: Dispatch<DesktopAction>;
}
interface InstalledShortcut {
  path: string;
  programId: string;
  name: string;
}
async function readShortcuts(entries: FileEntry[]): Promise<InstalledShortcut[]> {
  const files = entries.filter(entry => entry.type === "file" && /\.lnk$/i.test(entry.name));
  const shortcuts = await Promise.all(files.map(async entry => {
    try {
      const data = parseSourceShortcut(await fileStore.read(entry.uri));
      const source = data && sourceProgramsById.get(data.exe);
      return data && source
        ? { path: entry.uri, programId: data.exe, name: source.name }
        : null;
    } catch { return null; }
  }));
  return shortcuts.filter((x): x is InstalledShortcut => x !== null);
}

/** The original All Programs tree is populated from installed .lnk files. */
export function StartMenu({ dispatch }: StartMenuProps) {
  const [query, setQuery] = useState("");
  const [allPrograms, setAllPrograms] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<FileEntry[]>([]);
  const [installed, setInstalled] = useState<InstalledShortcut[]>([]);
  const [loadError, setLoadError] = useState("");
  const programs = appRegistry.startMenu().filter(app =>
    app.label.toLowerCase().includes(query.toLowerCase())
  );
  useEffect(() => {
    if (!allPrograms) return;
    let active = true;
    const load = async () => {
      try {
        const path = activeFolder ?? SOURCE_START_MENU_PROGRAMS;
        const entries = await fileStore.list(path);
        const shortcuts = await readShortcuts(entries);
        if (!active) return;
        setFolders(entries.filter(entry => entry.type === "directory"));
        setInstalled(shortcuts);
        setLoadError("");
      } catch (error) {
        if (!active) return;
        setFolders([]);
        setInstalled([]);
        setLoadError(error instanceof Error ? error.message : "Cannot list programs");
      }
    };
    void load();
    const unsubscribe = fileStore.subscribe(() => { void load(); });
    return () => { active = false; unsubscribe(); };
  }, [allPrograms, activeFolder]);

  const openApp = (appId: string) => {
    const app = appRegistry.get(appId);
    if (app) dispatch({ type: "OPEN_APP", app });
  };
  return (
    <nav className="windows-startmenu" id="start-menu" data-test-start-menu="" aria-label="Start menu">
      <div className="windows-startmenu__left">
        <div className="windows-startmenu__programs">
          {allPrograms && !query ? <>
            <button type="button" className="windows-startmenu__program"
              onClick={() => activeFolder ? setActiveFolder(null) : setAllPrograms(false)}
              data-test-all-programs-back="">
              <span aria-hidden="true">◀</span>
              {activeFolder ? "Back to All Programs" : "Back"}
            </button>
            {folders.map(folder => <button key={folder.uri}
              type="button" data-test-source-program-folder={folder.name}
              className="windows-startmenu__program"
              onClick={() => setActiveFolder(folder.uri)}>
              <img src={legacyArt.folder} width={30} height={30} alt="" />
              <span>{folder.name}</span>
              <span className="windows-startmenu__chevron" aria-hidden="true">▸</span>
            </button>)}
            {installed.map(shortcut => {
              const app = appRegistry.get(shortcut.programId);
              return <button type="button" key={shortcut.path}
                data-test-source-program={shortcut.programId}
                className="windows-startmenu__program"
                disabled={!app}
                title={app ? shortcut.name : shortcut.name + " — migration pending"}
                onClick={() => openApp(shortcut.programId)}>
                <img src={app?.icon ?? legacyArt.file} width={30} height={30} alt="" />
                <span>{shortcut.name}</span>
              </button>;
            })}
            {loadError && <p role="alert" className="windows-startmenu__empty">{loadError}</p>}
            {!loadError && !folders.length && !installed.length &&
              <p className="windows-startmenu__empty">No installed programs in this folder.</p>}
          </> : <>
            {programs.map(app => (
              <button key={app.id} data-test-program={app.id}
                className="windows-startmenu__program" onClick={() => dispatch({ type: "OPEN_APP", app })}>
                <img src={app.icon} width={30} height={30} alt="" />
                <span>{app.label}</span>
              </button>
            ))}
            {!programs.length && <p className="windows-startmenu__empty">No items match your search.</p>}
          </>}
        </div>
        {!query && <button type="button" className="windows-startmenu__all-programs"
          data-test-all-programs=""
          onClick={() => { setAllPrograms(!allPrograms); setActiveFolder(null); }}>
          {allPrograms ? "‹ Back" : "All Programs ▸"}
        </button>}
        <label className="windows-startmenu__search">
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search programs and files" aria-label="Search programs and files" autoFocus />
          <span>⌕</span>
        </label>
      </div>
      <div className="windows-startmenu__right">
        <img src={legacyArt.guestAvatar} alt="Guest" className="windows-startmenu__avatar" />
        <strong>Guest</strong>
        <hr />
        <button onClick={() => dispatch({ type: "OPEN_APP", app: appRegistry.get("computer")! })}>Computer</button>
        <button onClick={() => dispatch({ type: "OPEN_APP", app: appRegistry.get("web_contacts")! })}>Contacts</button>
        <hr />
        <button onClick={() => dispatch({ type: "LOG_OFF" })}>Log off</button>
        <button className="windows-startmenu__power" onClick={() => dispatch({ type: "SHUTDOWN" })}>Shut down</button>
      </div>
    </nav>
  );
}
