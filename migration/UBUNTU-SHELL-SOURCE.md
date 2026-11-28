# Ubuntu shell source slice

Frozen reference: `4e63290d783009e1293433c6ccf252abba9c1187`.
- `src/modules/shell/dock-ubuntu.js` e5fe: first three recent programs plus all open window app IDs, insertion-order deduplication, running state and separate Start icon.
- `src/styles/shell/dock-ubuntu.css`: 36px artwork, 3px gaps, 6px accent indicator, Bin separator.
- `src/modules/shell/taskbar-ubuntu.js` c56e and `src/styles/shell/taskbar-ubuntu.css`: 32px #131313 top bar, Activities, active title, central clock and 40px tray slots.
- `src/modules/themes/theme-ubuntu-scss.js` 709b: 64px dock reserve; maximized windows now respect top/left shell bounds.

Real Guest recent store, registry, window focus and source art are retained. The Activities and dock Start buttons temporarily open the existing shared launcher; original overview, launcher, date/calendar, tray/system popups, nonmaximized window clamping, window chrome, RTL dock placement and screenshot parity remain pending. Mobile tray and clock use an explicit compact adaptation. No host actions added.

Tests authored: sourceUbuntuDockItems.test.ts and source-ubuntu-shell.spec.ts. Not executed yet. Previous focused ChromeOS CI #45405625966 passed on f162811; no redundant CI trigger.
