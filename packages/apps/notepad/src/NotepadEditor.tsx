import {
  forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties
} from "react";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, keymap, type KeyBinding } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, selectAll } from "@codemirror/commands";
import type { NotepadFont } from "./document";
import "./source.css";
import "./editor.css";

/**
 * Real CodeMirror 6 editor adapter for original notepad-editor's
 * set, insert, focus, selectAll, cursor and key-binding contracts.
 * Source reference: src/modules/apps/notepad.js + plugin-codemirror.js.
 */
export interface NotepadEditorHandle {
  focus(): void;
  set(value: string): void;
  selectAll(): void;
  insert(text: string): void;
  setKeyBindings(bindings: readonly KeyBinding[]): void;
}

export interface NotepadEditorProps {
  value: string;
  wrap: boolean;
  font: NotepadFont;
  onChange(value: string): void;
  onCursor(line: number, column: number): void;
}

export const NotepadEditor = forwardRef<NotepadEditorHandle, NotepadEditorProps>(
  function NotepadEditor({ value, wrap, font, onChange, onCursor }, ref) {
    const mount = useRef<HTMLDivElement>(null);
    const view = useRef<EditorView | null>(null);
    const callbacks = useRef({ onChange, onCursor });
    callbacks.current = { onChange, onCursor };

    const wrapping = useRef(new Compartment());
    const shortcuts = useRef(new Compartment());

    useImperativeHandle(ref, () => ({
      focus() { view.current?.focus(); },
      set(text: string) {
        const editor = view.current;
        if (!editor) return;
        editor.dispatch({
          changes: { from: 0, to: editor.state.doc.length, insert: text }
        });
      },
      selectAll() {
        if (view.current) selectAll(view.current);
      },
      insert(text: string) {
        const editor = view.current;
        if (!editor) return;
        const selection = editor.state.selection.main;
        editor.dispatch({
          changes: { from: selection.from, to: selection.to, insert: text },
          selection: { anchor: selection.from + text.length }
        });
        editor.focus();
      },
      setKeyBindings(bindings: readonly KeyBinding[]) {
        view.current?.dispatch({
          effects: shortcuts.current.reconfigure(keymap.of([...bindings]))
        });
      }
    }), []);

    useEffect(() => {
      if (!mount.current) return;
      const editor = new EditorView({
        parent: mount.current,
        state: EditorState.create({
          doc: value,
          extensions: [
            history(),
            keymap.of([...defaultKeymap, ...historyKeymap]),
            shortcuts.current.of(keymap.of([])),
            wrapping.current.of(wrap ? EditorView.lineWrapping : []),
            EditorView.updateListener.of(update => {
              if (update.docChanged) {
                callbacks.current.onChange(update.state.doc.toString());
              }
              if (update.docChanged || update.selectionSet) {
                const head = update.state.selection.main.head;
                const line = update.state.doc.lineAt(head);
                callbacks.current.onCursor(line.number, head - line.from + 1);
              }
            })
          ]
        })
      });
      view.current = editor;
      editor.focus();
      return () => {
        view.current = null;
        editor.destroy();
      };
      // Created once. Controlled changes are dispatched by the effects below.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const editor = view.current;
      if (!editor) return;
      const current = editor.state.doc.toString();
      if (current !== value) {
        editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } });
      }
    }, [value]);

    useEffect(() => {
      view.current?.dispatch({
        effects: wrapping.current.reconfigure(wrap ? EditorView.lineWrapping : [])
      });
    }, [wrap]);

    const fontStyle = {
      "--font-family": font.font,
      "--font-size": font.size + "pt",
      "--font-style": font.style.split(",")[0] || "normal",
      "--font-weight": font.style.split(",")[1] || "normal"
    } as CSSProperties;

    return <div className="notepad-editor-host" data-test-notepad-editor="" data-v-8595302e=""
      style={fontStyle} ref={mount} />;
  }
);
