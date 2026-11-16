# Shell-first source migration acceptance — 17 November 2026

## Product instruction and priority (effective immediately)

After stabilizing the in-flight Solitaire browser acceptance, direct the
migration to **shell fidelity before additional games/apps**, in this order:

1. **Themes:** Original theme components, per-theme skin variables, artwork,
   desktop/taskbar, window chrome, boot/logon/shutdown, font and responsive
   layouts. Start with Win7 baseline, WinXP and Win11; do not imply the other
   supported source theme IDs have been fully migrated.
2. **Context menus:** Desktop background and item, Explorer file/folder,
   Recycle Bin, taskbar and Start program menus; source item ordering,
   nested menus, keyboard/pointer behavior, enable/disable predicates,
   placement and actual safe actions.
3. **Desktop:** wallpaper/profile preferences, icon placement and selection,
   rename, create, drag/drop, source file associations, visible context actions,
   multi-select, touch interactions and screen-size constraints.
4. **Start menu:** Source-specific Win7/XP/11 structures, source installed
   shortcuts and pinned/recent behavior, all-program trees, search,
   account/power controls, icons, focus and keyboard interactions.
5. **Computer and Recycle Bin Explorer:** shared source pane contracts,
   breadcrumbs/navigation, view modes, list rendering, selection, rename,
   clipboard, drag/drop, search, file properties, recycle/restore/empty
   lifecycle, error paths and mobile scrollability.

Exact source checkpoint: `legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.
Target: `codersachin99/windows-os` draft PR #1, branch
`feat/0001-faithful-react-foundation`. PR remains draft, do not merge
or release while source functionality or source-vs-target pixel parity is
unverified. Keep reusable source engines and UI/SDK adapters modular.

## First shell-priority batch

### Original DesktopMenu

Pinned original `src/modules/system/main.js`, desktop menu B computed
`items()`: **View (Large/Medium/Small, Auto arrange, Show icons)**;
**Refresh**; **Paste**; **Copy path**; **Upload files here**; **New
(Folder, Shortcut, Rich Text Document, Text Document)**; **Display**;
optional **Gadgets**; and **Personalize**. The React desktop already had
view/refresh/paste/new and safe VFS-backed create and clipboard. This
batch adds Copy path through the browser clipboard using the mounted Guest
desktop path; native multi-file upload through `importDroppedFiles`,
and Display routed to the actual migrated Control Panel Display screen
with Back/Forward history. Unported Gadgets and Personalize are visibly
disabled; do NOT fabricate working program launches or host configuration.
`tests/e2e/desktop-context-source.spec.ts` covers order, safe actions,
real imported file, route, history, and disabled status on desktop/mobile.

### Theme-specific Start structure

Pinned source:
`src/modules/shell/startmenu-winxp.js` webpack `6f58`,
`src/styles/shell/startmenu-winxp.css`: XP source menu is 360px,
two columns with profile top region and logoff/shutdown bottom region.

`src/modules/shell/startmenu-win11.js` webpack `18ee`,
`src/styles/shell/startmenu-win11.css`: Win11 menu is bottom-centered
8px above taskbar, search at top, 6-column program grid, original
grid cells 90x80 and 32px artwork, account/power bottom region.

The shared StartMenu keeps source-installed shortcuts and safe launch
behavior, with theme-selected layout classes and structural regions.
`sourceStartMenuThemes.css` adapts the above source layout contract
to the existing React shared menu; XP uses top+bottom profile regions,
Win11 uses the centered search/grid/footer contract, and Win7 remains
unchanged. Mobile narrows to a 4-column Win11 grid. The intermediate
palette/Guest program lists are *not* verified original theme pixel
artwork/pinned or recent-program semantics. See
`tests/e2e/startmenu-themes.spec.ts`.

### Solitaire acceptance boundary

[Run #43952536487](https://github.com/codersachin99/windows-os/actions/runs/43952536487)
passed TypeScript, all units, source audits and production build, then
468/470 desktop/mobile Chromium browser tests. Only failure was the
same test on both projects: decorative `aria-hidden` drag overlay was
asserted with Playwright `toBeVisible()`; the element was present, but
accessibility-aware visibility intentionally reported hidden.
That assertion is corrected to check DOM presence and pointer-events.
Do **not** call that correction accepted until a new exact-SHA run passes.
Do not resume Solitaire statistics/win-animation until the shell priority
milestones are substantially complete.

## Next verifiable slices

- Audit all theme identifiers and exact source CSS/asset manifests.
  Port Win7, WinXP and Win11 theme frames without replacing the source
  personality with a generic CSS approximation.
- Port source `main.js` **desktop item menu** conditions/actions
  (Open, Pin, Unpin, Create shortcut, Download, Cut, Copy, Delete,
  Rename, Properties) with safe backing and disabled unavailable actions.
- Fix desktop menu placement using real rendered dimensions and source
  submenu edge flip; cover bottom-right desktop/mobile.
- Port source Start menu All Programs and pinned/recent/search contracts
  per theme before marking visuals or interactions as verified.
- Then source Computer/Bin context menus, Win7 address bar/layout,
  view controls, file operation and Recycle Bin lifecycle acceptance.

Only run GitHub Actions deliberately via `[run-ci]`. Record exact
commit SHA, successes, failures, skipped sections and remaining blockers.


## Subsequent shell menu geometry and Computer/Bin slice

Following the first opt-in integrated CI snapshot, the next independent
commits add measured source menu geometry and Computer/Bin context actions.
These changes are **not** in that earlier CI's SHA.

- `sourceDesktopMenuPosition.ts` with source `main.js` measured
  edge-flip and bounded mobile geometry, pure unit tests. Desktop background
  menu now repositions after render and after View/New expansion, preserving
  its original click anchor; CSS limits height so the last item can scroll.
  Playwright checks the popup bounds after both expansions.
- Source Computer/Bin Explorer background context menu adds the same original
  8 View choices (`SOURCE_VIEW_MODES`), keyboard-accessible radio options,
  Refresh, Copy path via safe browser clipboard, Upload files here via
  existing `fileInput` and importer, New folder compatibility, and
  Empty Recycle Bin only on the source Bin. Upload is visibly disabled in
  Bin and no Bin Paste is exposed. View choices use the existing
  `ExplorerSession.setViewMode` rather than a duplicate view engine.
- Explorer's popup uses the same shared `@windows-os/ui/menu-position`
  geometry and max-height; source Computer and Bin Playwright cases test
  view changes, Guest path copy, real imported files and bin prohibitions.

**Known remaining mismatch**: the original `main.js` Explorer context
background has a nested New submenu, while this React compatibility slice
still offers its existing direct New folder action. Original per-item menus,
source iconography, theme skin CSS, source popup hover transition, properties,
complete shortcut creation and paired original screenshots remain pending.
No assertion that the entire shell has reached source parity is made.

## Source DesktopItemMenu and Computer New submenu follow-up

Pinned original `src/modules/system/main.js` DesktopItemMenu `M.items()`
source action order: Open, Bin-only Empty Recycle Bin, Pin/Unpin,
Send to Desktop (installed default programs), Send to → Compressed folder
(file paths), Download (eligible non-shortcut extensions), Cut, Copy,
Delete, Rename, Properties. Visibility is conditioned on multiple
selection, system icon, shortcut backing and valid path.

Migrated pure `sourceDesktopItemMenu.ts` defines this order and disabled
predicates with unit tests for system Computer, empty/populated Bin,
installed source apps, TXT files, directory/.lnk exclusions and
multiselection. `DesktopIcons` uses it to render the item menu.
- Empty Bin is enabled only after reading the actual source-mounted
  trash directory. A confirmation is required before
  `VirtualFileStore.emptyTrash` permanently removes items; Cancel
  leaves them intact.
- Download for eligible regular files uses `readBytes` and a scoped
  browser Blob URL, preserving Guest file bytes rather than touching
  host files.
- Send to Desktop calls the existing `createSourceDesktopShortcut`
  with installed pinned source program ID and collision-safe .lnk
  JSON. This is intentionally not enabled for arbitrary URLs,
  uninstalled programs or source system icons.
- Pin/Unpin, Compressed Folder and Properties remain visibly disabled
  until the corresponding real source services exist. They must not
  be reported as finished despite correct menu visibility.
- New desktop/mobile acceptance tests exercise item order,
  file download, multi-select restrictions and confirm/cancel/empty
  Recycle Bin lifecycle.

Original `main.js` ExplorerMenu background New submenu differs from
Desktop New: it has **Folder, Rich Text Document, Text Document**,
without Shortcut. `ExplorerApp` now uses shared
`@windows-os/ui/desktop-create` and existing `ExplorerSession`
for actual Guest VFS operations and Win7 inline renaming. Bin continues
to hide New. Context-menu Properties stays disabled as upstream.
The shared source folder/text/RTF helper has retained collision-safe
creation and its existing unit coverage; Explorer browser cases verify
all three payload types. Original hover submenus/visual theme fidelity
and complete Explorer item Send To/Properties remain outstanding.

No release until exact-SHA opt-in tests pass, source vs React screenshots
are compared and outstanding shell modules close.
