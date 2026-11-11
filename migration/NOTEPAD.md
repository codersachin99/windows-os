# Native React Notepad — source document model checkpoint

Canonical legacy reference: src/modules/apps/notepad.js at 4e63290d783009e1293433c6ccf252abba9c1187.

This checkpoint implements a source-mapped, UI-independent Notepad document engine in packages/apps/notepad/src/document.ts.

Preserved from original Vue component:
- Initial "Untitled - Notepad", empty document, cursor Ln 1 Col 1, font "'lucida console',monospace" 10 pt normal,normal, wrap off and status on.
- Dirty marker and exit confirmation based on comparison to last saved content.
- Source New/Open/Save/Save As state transitions with the shared virtual filesystem and source text-file behavior.
- Save As initial location, font/wrap/status toggles, cursor updates and original time/date insertion text.
- Source quirk: New resets content/name but retains the previous file path. Documented and unit tested rather than silently changing legacy semantics.

This is **not a complete Notepad port**. Full UI still requires CodeMirror editor extensions and shortcuts, menubar, source font/open/save dialogs, overwrite confirmations, theme-specific CSS, and desktop/mobile visual/interaction parity. Do not mark source notepad.js verified.

## CodeMirror editor adapter

The native `packages/apps/notepad/src/NotepadEditor.tsx` now uses real CodeMirror 6, with source-equivalent `set`, `insert`, `focus`, `selectAll`, wrap, cursor notifications, configurable fonts and original Alt-command key binding support. The 424-byte original `src/styles/apps/notepad.css` was ported verbatim into `source.css`; `editor.css` adds only container sizing.

The editor remains a reusable component and has **not yet been wired into the desktop window, menu, dialogs or source Close lifecycle**. Its dependency versions are pinned, and the source-model/editor commit passed the opt-in TypeScript, unit, production-build and existing Chromium suite in [GitHub Actions run 43094398373](https://github.com/codersachin99/windows-os/actions/runs/43094398373). That suite does not yet exercise a mounted Notepad window. The full original Notepad application is still pending.
