# Original Shortcut Wizard — source investigation (not yet migrated)

**Canonical source:** \`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187\`, \`src/modules/shell/shortcutwiz.js\`, webpack module \`a8a1\`; desktop launch from \`src/modules/system/main.js\` \`makeShortcut() -> OpenWindow("shortcut")\`.

## Observed source behavior

1. Source launches a real non-resizable, centered \`window-main\` named \`window-shortcut\` at **550 × 400**, with a titlebar, instructional text, editable \`item.lbl\` textbox, a \`Browse\` button, and **Finish** / **Cancel** footer controls.
2. \`Browse\` opens a **second window-main** with a scrollable \`listview-view-details\` of \`allProgramItems\`. Clicking a row changes \`selection\`, double-clicking a row selects it immediately; **OK** is disabled until a program is selected; **Cancel** closes only the Browse window.
3. \`select()\` copies the chosen program's complete item data, chooses the source icon fallback, and closes Browse. **Finish** is disabled unless an item has both a program key and label. The source has a special Control Panel (\`cpanel\`) case.
4. \`finish()\` appends \`.lnk\`, picks an available name using source \`4cca\` collision logic, dispatches \`ShortcutAdd\` with the original program metadata and a JSON content object with **\`{exe: item.key, icon: item.icon}\`**, and closes the wizard. **Cancel** closes without creating a shortcut.
5. The source uses its real \`allProgramItems\` selection list, rather than a fabricated HTML \`select\` of migrated apps. Entries whose React app implementations are pending must remain visibly pending instead of secretly launching other programs.

## Migration plan

- Extract a reusable \`ShortcutWizard\` React component with two staged native source-style windows and the existing window-manager app lifecycle; register \`shortcut\` only after a real working UI exists. Keep the original 550×400 layout and source CSS assets, using the pinned importer and visual screenshot comparison.
- Reuse \`packages/filesystem/src/sourcePrograms.ts\` and persisted Guest \`desktopPath\`. Preserve \`{exe,icon}\` \`.lnk\` content, source name conflict behavior and Win7 keyboard/focus/cancel semantics. Source's program manifest is already pinned in \`sourceProgramManifest.json\`.
- Verify first with unit tests for selection, invalid or uninstalled target handling, duplicate suffixes, no-overwrite and cancellation, then desktop/mobile browser tests for Browse, OK, double-click, Finish and close/reopen state. Do not report the original wizard complete before these interactions and its source imagery pass.

**Current target limitation:** \`DesktopIcons.tsx\` uses an interim inline chooser for installed, currently migrated React programs. It already writes source JSON \`.lnk\` files safely, but this **is not** the original two-window wizard. This research document is a coding blueprint, not a feature completion claim. The original source module remains pending in \`migration/module-tracker.json\`.
