import {
  useCallback, useEffect, useMemo, useRef, useState,
  type FormEvent
} from "react";
import type { KeyBinding } from "@codemirror/view";
import { fileStore } from "@windows-os/sdk";
import { VirtualFileDialog } from "@windows-os/apps/shared";
import { NotepadDocument, formatNotepadDateTime, type NotepadFont } from "./document";
import { NotepadEditor, type NotepadEditorHandle } from "./NotepadEditor";
import "./NotepadApp.css";

interface NotepadAppProps {
  onClose(): void;
  onTitleChange(title: string): void;
  onRegisterClose(handler: () => void): () => void;
}

type ActiveDialog = "open" | "save" | "font" | "confirm" | null;
type MenuId = "File" | "Edit" | "Format" | "View" | null;

/** Source-style Notepad menus, using the shared native editor and document SDK. */
export function NotepadApp({ onClose, onTitleChange, onRegisterClose }: NotepadAppProps) {
  // Per-window model; all windows share only the virtual file store.
  const document = useMemo(() => new NotepadDocument(fileStore), []);
  const [snapshot, setSnapshot] = useState(() => document.snapshot());
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [menu, setMenu] = useState<MenuId>(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [fontDraft, setFontDraft] = useState<NotepadFont>(snapshot.font);
  const editor = useRef<NotepadEditorHandle>(null);
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => document.subscribe(setSnapshot), [document]);
  useEffect(() => { onTitleChange(document.title()); }, [document, snapshot.fileName, snapshot.isChanged, onTitleChange]);

  const guard = useCallback((after: () => void) => {
    if (document.requestClose() === "confirm-save") {
      pending.current = after;
      setDialog("confirm");
    } else after();
  }, [document]);

  const requestClose = useCallback(() => guard(onClose), [guard, onClose]);
  useEffect(() => onRegisterClose(requestClose), [onRegisterClose, requestClose]);

  const newDocument = useCallback(() => guard(() => {
    document.create();
    editor.current?.focus();
  }), [document, guard]);

  const openDocument = useCallback(() => guard(() => setDialog("open")), [guard]);

  const save = useCallback(async (after?: () => void) => {
    setError("");
    setWorking(true);
    try {
      const status = await document.save();
      if (status === "save-as-required") {
        if (after) pending.current = after;
        setDialog("save");
      } else {
        after?.();
        editor.current?.focus();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Save failed");
    } finally { setWorking(false); }
  }, [document]);

  const saveAs = () => { setError(""); setDialog("save"); };
  const cancelDialog = () => { setDialog(null); pending.current = null; editor.current?.focus(); };
  const runPending = () => {
    const after = pending.current;
    pending.current = null;
    after?.();
  };

  const onFileSelected = async (path: string) => {
    if (dialog === "open") await document.open(path);
    else await document.saveAs(path);
    setDialog(null);
    setError("");
    runPending();
    editor.current?.focus();
  };

  const insertTime = () => editor.current?.insert(formatNotepadDateTime(new Date()));

  // Source hotkeys: Alt+N, Alt+O, Alt+S, Alt+Shift+S, Alt+4.
  const actions = useRef({ newDocument, openDocument, save, saveAs, requestClose });
  actions.current = { newDocument, openDocument, save, saveAs, requestClose };
  useEffect(() => {
    const bindings: KeyBinding[] = [
      { key: "Alt-n", preventDefault: true, run: () => { actions.current.newDocument(); return true; } },
      { key: "Alt-o", preventDefault: true, run: () => { actions.current.openDocument(); return true; } },
      { key: "Alt-s", preventDefault: true, run: () => { void actions.current.save(); return true; } },
      { key: "Alt-Shift-s", preventDefault: true, run: () => { actions.current.saveAs(); return true; } },
      { key: "Alt-4", preventDefault: true, run: () => { actions.current.requestClose(); return true; } }
    ];
    editor.current?.setKeyBindings(bindings);
  }, []);

  const execute = (action: () => void) => { setMenu(null); action(); };
  const fontChange = (event: FormEvent) => {
    event.preventDefault();
    document.setFont(fontDraft);
    setDialog(null);
    editor.current?.focus();
  };

  return <div className="notepad-stage" data-test-notepad="">
    <nav className="notepad-menu" aria-label="Notepad menu bar">
      {(["File", "Edit", "Format", "View"] as const).map(label =>
        <div key={label} className="notepad-menu__section">
          <button type="button" aria-expanded={menu === label}
            onClick={() => setMenu(menu === label ? null : label)}>{label}</button>
          {menu === label && <div className="notepad-menu__dropdown">
            {label === "File" && <>
              <button onClick={() => execute(newDocument)}>New <kbd>Alt+N</kbd></button>
              <button onClick={() => execute(openDocument)}>Open... <kbd>Alt+O</kbd></button>
              <button onClick={() => execute(() => { void save(); })}>Save <kbd>Alt+S</kbd></button>
              <button onClick={() => execute(saveAs)}>Save As... <kbd>Alt+Shift+S</kbd></button>
              <hr />
              <button onClick={() => execute(requestClose)}>Exit <kbd>Alt+4</kbd></button>
            </>}
            {label === "Edit" && <>
              <button onClick={() => execute(() => editor.current?.selectAll())}>Select All</button>
              <button onClick={() => execute(insertTime)}>Time/Date</button>
            </>}
            {label === "Format" && <>
              <button onClick={() => execute(() => document.setWordWrap(!snapshot.isWrapped))}>
                {snapshot.isWrapped ? "✓ " : ""}Word Wrap
              </button>
              <button onClick={() => execute(() => { setFontDraft(snapshot.font); setDialog("font"); })}>Font...</button>
            </>}
            {label === "View" && <button onClick={() => execute(
              () => document.setStatusVisible(!snapshot.isStatusVisible)
            )}>{snapshot.isStatusVisible ? "✓ " : ""}Status Bar</button>}
          </div>}
        </div>
      )}
      <button type="button" disabled className="notepad-menu__help">Help</button>
    </nav>
    <div className="notepad-editor">
      <NotepadEditor ref={editor} value={snapshot.content}
        wrap={snapshot.isWrapped} font={snapshot.font}
        onChange={value => document.changeContent(value)}
        onCursor={(line, column) => document.changeCursor(line, column)} />
    </div>
    {snapshot.isStatusVisible && <footer className="notepad-status">
      <span aria-label="Editor status">{snapshot.isChanged ? "Modified" : ""}</span>
      <span data-test-cursor-position="">Ln {snapshot.cursor[0]}, Col {snapshot.cursor[1]}</span>
    </footer>}
    {error && <div className="notepad-error" role="alert">{error}</div>}
    {(dialog === "open" || dialog === "save") && <VirtualFileDialog
      fileStore={fileStore} mode={dialog}
      initialDirectory={dialog === "save" ? document.saveAsLocation() : "/"}
      suggestedName={dialog === "save" ? snapshot.fileName : ""}
      onCancel={cancelDialog} onSelected={onFileSelected} />}
    {dialog === "confirm" && <div className="notepad-modal__backdrop">
      <div className="notepad-modal" role="alertdialog" aria-modal="true" aria-label="Save changes">
        <h2>Notepad</h2>
        <p>Do you want to save changes to {snapshot.fileName}?</p>
        <div className="notepad-modal__buttons">
          <button disabled={working} onClick={() => {
            const after = pending.current;
            pending.current = null;
            setDialog(null);
            void save(after || undefined);
          }}>Yes</button>
          <button disabled={working} onClick={() => { setDialog(null); runPending(); }}>No</button>
          <button disabled={working} onClick={cancelDialog}>Cancel</button>
        </div>
      </div>
    </div>}
    {dialog === "font" && <div className="notepad-modal__backdrop">
      <form className="notepad-modal" onSubmit={fontChange} role="dialog"
        aria-modal="true" aria-label="Font">
        <h2>Font</h2>
        <label>Font family
          <input aria-label="Font family" value={fontDraft.font}
            onChange={event => setFontDraft(prev => ({ ...prev, font: event.target.value }))} />
        </label>
        <label>Font style
          <select aria-label="Font style" value={fontDraft.style}
            onChange={event => setFontDraft(prev => ({ ...prev, style: event.target.value }))}>
            <option value="normal,normal">Regular</option>
            <option value="italic,normal">Italic</option>
            <option value="normal,bold">Bold</option>
            <option value="italic,bold">Bold Italic</option>
          </select>
        </label>
        <label>Size (pt)
          <input type="number" min={6} max={72} aria-label="Font size" value={fontDraft.size}
            onChange={event => setFontDraft(prev => ({ ...prev, size: Number(event.target.value) }))} />
        </label>
        <div className="notepad-modal__buttons">
          <button type="submit">OK</button>
          <button type="button" onClick={cancelDialog}>Cancel</button>
        </div>
      </form>
    </div>}
  </div>;
}
