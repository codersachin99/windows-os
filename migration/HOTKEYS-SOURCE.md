# Pinned original desktop shell hotkeys — first source-backed slice

Source is `legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`:
`src/modules/system/main.js` lines 1246–1281 registers hotkeys with
`src/modules/shell/hotkey.js` module 2ea7. The base source mappings are
`Alt+D` → MinimizeAll/show desktop, `Alt+W` → toggle Start,
`Alt+E` → open Computer, `Alt+R` → open Run,
`Alt+L` → changeView({view:"Switch"}), and `Shift+Tab` → a no-op.
The hotkey library's `x(event)` filter ignores input, textarea, select
and contenteditable events unless an element is read-only.

React's `sourceDesktopShortcut` maps the four unambiguous, functional
actions through the existing `DesktopShell` reducer/AppRegistry.
`MinimizeAll` dispatches `MINIMIZE_WINDOW` for all unminimized windows,
the existing shell focus and taskbar restoration remain authoritative.
All handlers are desktop-session only. The editable-filter is a pure
utility with unit tests; Playwright checks Start toggle, Computer, desktop
minimize, Run and editable input. The E2E dispatches synthetic document
keyboard events for Chromium's browser-reserved Alt+D and to consistently
exercise the in-app source listener.

**Not yet ported:** `Alt+L` switch-user view is distinct from logging off,
so do not substitute `LOG_OFF` for it. `Shift+Tab` is a source-registered
no-op and should not steal browser focus. The full hotkey.js library has
scoping, bind/unbind and modifier state beyond this slice. Module status
is **in-progress**, not complete or fully visually accepted.
