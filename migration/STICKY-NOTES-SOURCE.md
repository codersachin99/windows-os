# Original Sticky Notes source → modular React migration

**Pinned source:** codersachin99/legacy-win7 commit 4e63290d783009e1293433c6ccf252abba9c1187. Exact original contracts in src/modules/apps/stickynotes.js (webpack module eee5 / Vuex c19f), src/styles/apps/stickynotes.css and color array export "b" in src/modules/system/testmode.js (webpack module 2299).

## Source-faithful behavior

- The source renders a **frameless fragment** with id window-sticky, containing a separate third-party draggable/resizable sticky-note component for every note. It does **not** display all notes inside one normal WindowMain. The source shell still associates them with a single app id "sticky", uses the shared window index for z-order, v-show on minimized, and closes the app when the last note is deleted.
- An empty source "sticky" Guest config opens one initial **yellow, 200×200** note at the center of the viewport. Each record contains exactly {x, y, w, h, color, content}. Note controls are a 20×20 add and close icon; new note color is chosen randomly from the source order blue, green, pink, purple, white, yellow. New notes use the centered default geometry. On focus the source moves the selected note to the end of the note list for topmost stacking order.
- The source's 8-direction resizable note has min width 150 and min height 100; toolbar acts as the drag handle. The original CSS uses a shadow 0 10px 20px rgba(0,0,0,.4), Segoe Print 20px/32px textarea, transparent resize handles, and a dynamic --note-color background. For narrow screens, the migrated adapter keeps these dimensions and notes within available viewport instead of letting the entire desktop scroll out of view.
- **Exact palette** taken from source testmode.js module 2299 export "b": blue #c3f3fa, green #c8fec0, pink #f9ccf8, purple #d2d7fc, white #eaeaea, yellow #fffeb3. All three source images are byte-identical Git blobs:
  - sticky.e63cea5a.webp — 8e0c0106944b20ab583c969af97750ed1ef19a58
  - stickynotes-add.bfbefc41.webp — 9bdff7405df32ef359fa3fc66de1775054e8cf3d
  - stickynotes-close.80b2c95a.webp — c3d7c28f83d6b07b7b9602f1ed65951e07394f65
- The source Vuex config for key "sticky" stores {notes:[...]}, with immediate save on changed count and **600ms debounce** for deep content/position changes. The React Guest storage adapter uses key windows-os:legacy-sticky:guest:v1 with the **same stored record fields** (transient React id not persisted). Add/close and completed drag/resize write immediately. Error in persisted data is surfaced without silent overwrite.

## Target architecture

- packages/apps/sticky/src/model.ts: source colors and default geometry, Guest read/write, record validation, viewport-safe move/resize and source-only serialization.
- packages/apps/sticky/src/StickyNotesApp.tsx + CSS: separate floating article per note; source add/close icons and textarea; pointer-capture drag and eight resize handles; source focus-to-front and delayed text save.
- packages/sdk/src/index.ts: one registered system utility "sticky" with original icon, Start-menu launch and 200×200 source window metadata. packages/engine/src/index.ts: reopening the running Sticky app restores/focuses the existing **singleton** taskbar entry rather than opening another note collection.
- packages/ui/src/DesktopShell.tsx: render StickyNotesApp **without WindowFrame** while keeping the common window lifecycle, taskbar and z-order. Minimize does not unmount the notes, and the final-note close destroys only the app's taskbar entry. Original installed .lnk and Run.exe shell alias StikyNot.exe now resolve through the same AppRegistry; no host access.

## Acceptance coverage

- packages/apps/sticky/src/model.test.ts verifies exact source default yellow geometry, six color-name order, Guest serialization, Unicode, empty note list reopening, corrupt-data handling, pointer movement bounds, min 150×100 edge/corner resizing and mobile clamping.
- packages/engine/src/index.test.ts verifies one taskbar entry and restored z/minimized state on repeated OPEN_APP.
- tests/e2e/sticky-notes.spec.ts runs in both desktop/mobile Chromium: source 200×200 centered yellow panel, exact yellow RGB and icon asset files; edits and source 600ms persistence/reload, add/random six colors and saved record fields; drag/resize/persistence; minimize/restore and close-last/reopen; launching StikyNot.exe via the Run dialog.

**Boundaries:** This is a faithful functional slice for the default Win7 Guest theme. Pixel-by-pixel visual baseline comparisons, RTL variations, all other original Win7 programs, and non-default source themes remain separate migration work. Browser localStorage provides the target guest-config adapter; it is not claimed byte-compatible with the original Vuex backend. The overall simulator is not fully ported; do not merge/release as complete.

**CI status: VERIFIED.** First opt-in [CI 43249169205](https://github.com/codersachin99/windows-os/actions/runs/43249169205) identified one TypeScript browser timer handle mismatch, corrected in `3f3b9301`. [Opt-in rerun 43249454264](https://github.com/codersachin99/windows-os/actions/runs/43249454264) passed **166 Vitest unit tests across 30 files**, **174 Chromium desktop/mobile browser tests**, TypeScript, source/Contacts checks and Vite production build. Source palette, asset Git SHAs and data schema are checked; exact screenshot parity across other themes remains open.
