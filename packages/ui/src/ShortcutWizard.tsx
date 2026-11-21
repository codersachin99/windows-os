import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { legacyArt } from "@windows-os/assets";
import { appRegistry, fileStore, sourceFilesystemRuntime } from "@windows-os/sdk";
import { createSourceDesktopShortcut } from "./desktopCreate";
import {
  canFinishSourceShortcut, sourceWizardChoice, sourceWizardPrograms
} from "./shortcutWizardModel";
import "./ShortcutWizard.css";

interface ShortcutWizardProps {
  onClose(): void;
  onRegisterClose(handler: () => void): () => void;
}

/**
 * Native React rebuild of source src/modules/shell/shortcutwiz.js (module a8a1):
 * a centered 550x400 shell window and a separate Browse window listing the
 * original installed programs. Selection never executes a program; Finish
 * creates the original {exe,icon} .lnk in Guest Desktop.
 */
export function ShortcutWizard({ onClose, onRegisterClose }: ShortcutWizardProps) {
  const [programId, setProgramId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [browsing, setBrowsing] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const closeCurrent = useCallback(() => {
    if (browsing) setBrowsing(false);
    else onClose();
  }, [browsing, onClose]);
  // Titlebar X and Alt+F4 close only Browse while it owns focus.
  useEffect(() => onRegisterClose(closeCurrent), [closeCurrent, onRegisterClose]);

  const openBrowse = () => {
    if (saving) return;
    setHighlight(programId);
    setError("");
    setBrowsing(true);
  };
  const choose = (id: string | null) => {
    const selected = id && sourceWizardChoice(id);
    if (!selected) return;
    setProgramId(selected.id);
    setName(selected.name);
    setBrowsing(false);
    setError("");
  };
  const finish = () => {
    if (saving || !canFinishSourceShortcut(programId, name)) return;
    const desktop = sourceFilesystemRuntime.snapshot()?.desktopPath;
    if (!desktop || !programId) {
      setError("The original Guest Desktop is not mounted.");
      return;
    }
    setSaving(true);
    void createSourceDesktopShortcut(fileStore, desktop, programId, name).then(() => {
      setError("");
      onClose();
    }).catch(cause =>
      setError(cause instanceof Error ? cause.message : "Could not create shortcut")
    ).finally(() => setSaving(false));
  };

  const desktop = typeof document === "undefined"
    ? null : document.querySelector(".windows-desktop");
  const browse = browsing && desktop ? createPortal(
    <div className="windows-shortcut__browse-overlay"
      data-test-shortcut-browse-overlay=""
      onPointerDown={event => event.stopPropagation()}
      onClick={event => event.stopPropagation()}>
      <section className="windows-window windows-shortcut__browse-window"
        data-test-shortcut-browse="" role="dialog" aria-modal="true"
        aria-label="Browse" onKeyDown={event => {
          if (event.key === "Escape") {
            event.preventDefault(); event.stopPropagation(); setBrowsing(false);
          } else if (event.key === "Enter" && highlight) {
            event.preventDefault(); event.stopPropagation(); choose(highlight);
          } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            const index = sourceWizardPrograms.findIndex(program => program.id === highlight);
            const next = event.key === "ArrowDown"
              ? Math.min(sourceWizardPrograms.length - 1, index + 1)
              : Math.max(0, index < 0 ? 0 : index - 1);
            setHighlight(sourceWizardPrograms[next]?.id ?? null);
          }
        }}>
        <header className="windows-window__titlebar windows-shortcut__browse-titlebar">
          <span className="windows-window__title">Browse</span>
          <div className="windows-window__buttons">
            <button type="button" className="windows-window__close"
              aria-label="Close Browse" onClick={() => setBrowsing(false)}>×</button>
          </div>
        </header>
        <div className="windows-shortcut__browse-body">
          <div className="windows-shortcut__browse-scroll" role="listbox" aria-label="Installed programs">
            {sourceWizardPrograms.map((program,index) => {
              const migrated = Boolean(appRegistry.get(program.id));
              return <button key={program.id} type="button" role="option"
                autoFocus={index === 0} aria-selected={highlight === program.id}
                data-test-shortcut-program={program.id}
                className={"windows-shortcut__program" +
                  (highlight === program.id ? " is-selected" : "")}
                onClick={() => setHighlight(program.id)}
                onDoubleClick={() => choose(program.id)}>
                <img src={appRegistry.get(program.id)?.icon ??
                  (program.id === "paint" ? legacyArt.paint : legacyArt.file)}
                  alt="" width={28} height={28} draggable={false} />
                <span className="windows-shortcut__program-name">{program.name}</span>
                {!migrated && <span className="windows-shortcut__program-pending">Migration pending</span>}
              </button>;
            })}
          </div>
          <footer className="windows-shortcut__actions">
            <button type="button" className="windows-shortcut__default" disabled={!highlight}
              onClick={() => choose(highlight)}>OK</button>
            <button type="button" onClick={() => setBrowsing(false)}>Cancel</button>
          </footer>
        </div>
      </section>
    </div>,
    desktop
  ) : null;

  return <div className="windows-shortcut" data-test-shortcut-wizard="">
    <div className="windows-shortcut__main">
      <h2>Create Shortcut</h2>
      <p>This wizard helps you create a shortcut to a program on your desktop.</p>
      <label htmlFor="source-shortcut-name">Type a name for this shortcut:</label>
      <div className="windows-shortcut__selection">
        <input id="source-shortcut-name" aria-label="Shortcut name" maxLength={30}
          value={name} disabled={saving || browsing}
          onChange={event => setName(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") { event.preventDefault(); finish(); }
          }} />
        <button type="button" onClick={openBrowse} disabled={saving}>Browse...</button>
      </div>
      <p>Click Finish to create the shortcut.</p>
      {programId && <p className="windows-shortcut__chosen"
        data-test-shortcut-choice="">Selected: {sourceWizardChoice(programId)?.name}</p>}
      {error && <p className="windows-shortcut__error" role="alert">{error}</p>}
    </div>
    <footer className="windows-shortcut__footer">
      <button type="button" className="windows-shortcut__default"
        disabled={saving || !canFinishSourceShortcut(programId, name)}
        onClick={finish}>Finish</button>
      <button type="button" disabled={saving} onClick={onClose}>Cancel</button>
    </footer>
    {browse}
  </div>;
}
