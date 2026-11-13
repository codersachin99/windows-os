# Original Computer / Recycle Bin View toolbar — source trace

Pinned reference: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

## Original UI and behavior

- `src/modules/apps/bin.js` renders the Computer component with `id="bin"` and `hoistedPath=trashPath`; the Bin therefore inherits Computer's same toolbar and View menu.
- `src/modules/apps/computer.js` renders a right-aligned menu item with the current `themeData.icon["view-" + viewMode]`, hidden label, eight `viewModeItems` and a `winui-slider` with `min="0"`, `max="7"`, `value=viewModeValue`. `inputViewMode(index)` calls `session.setViewMode(this.viewModes[index].value)`; selecting a View item also sets `session.viewMode`.
- Original `src/styles/apps/computer.css` (tracked verbatim in `packages/apps/explorer/src/source.css`) specifies a 192px slider, rotated for LTR, and right-aligned `.winui-menu.is-view`. Original `assets/locales/en-US.json` contains the eight corresponding labels: `xl-icons`, `lg-icons`, `md-icons`, `sm-icons`, `list`, `details`, `tiles`, `content`.
- **Exact original mode ordering and default verified** in `src/modules/chunks/shared~bsod~games~main.js`, webpack module `cb81`: `["xl-icons","lg-icons","md-icons","sm-icons","list","details","tiles","content"]`; initial `viewMode = "tiles"`. React's eight-mode order and initial Tiles view now follow that source. These are source-function proofs, not a visual screenshot comparison.

## React implementation

- `packages/apps/explorer/src/sourceViewModes.ts` provides one typed eight-mode mapping and safe index bounds for the source slider. `SourceViewMenu.tsx` provides a right-aligned, keyboard and pointer-accessible menu with source mode changes through the existing `ExplorerSession.setViewMode`.
- `ExplorerApp` reuses View for Computer and the hoisted Bin, while the other partly migrated themes retain their prior select control. The existing file-management actions remain intact for compatibility; the Win7 toolbar still has non-source extra actions and is not claimed screen-exact. New Folder is offered only in ordinary non-search Computer folders; Bin creation remains blocked to protect recycle/restore metadata (a deliberate source difference).
- `ExplorerApp.css` supports extra-large icons without changing the prior seven layouts. Desktop/mobile Playwright checks cover View popup, all eight labels, the range slider, an extra-large selection, keyboard movement to Content, outside/Escape dismissal, Bin inheritance and non-Win7 compatibility.

## Byte-verified source artwork

The eight original WebP files were fetched from the pinned private source as base64, staged via the GitHub Git Blob API and checked against these original Git blob SHA values. They are **not reconstructed emoji or generated artwork**.

| Source locale key | WebP asset | Git blob SHA |
| --- | --- | --- |
| xl-icons | `view-xl-icons.98501d90.webp` | `ba4feaf8ecf71f622fc05ccb61a10db7089bc474` |
| lg-icons | `view-lg-icons.5eeaf0f2.webp` | `bbdb7904e6f508aa9d3665ca178788150b0b89fc` |
| md-icons | `view-md-icons.13e6ed1c.webp` | `b5f6433b77ef4cf16b1a205e8b1fde17d52f5045` |
| sm-icons | `view-sm-icons.198c1e08.webp` | `23307c251101e721722926c3dbd4ec9f8e4c792d` |
| list | `view-list.daaaa500.webp` | `289e7c7693f6a8e6dc6e01f5b01b67c0bda43534` |
| details | `view-details.6c230237.webp` | `7ae51b2d3b6f12b001bfd20513a79b06584865c5` |
| tiles | `view-tiles.c4008351.webp` | `82b6e028e1b8dbcdde1f1a470102b469430ba639` |
| content | `view-content.fe756cda.webp` | `5c93f00240898306f8be2c50d30742a1bcb561f0` |

## Scope and remaining parity

Do not claim screenshot or pixel parity; original popup rendering, default mode appearance in other themes, and alternate theme skins still require separate comparison. The exact source `cb81` order and Tiles default are verified. No dangerous trash Cut / Copy / Paste / Rename or untracked New Folder writes were enabled. Existing Bin Restore, Delete permanently and Empty controls remain safe and functional. Source asset licensing/public distribution approval is still a release blocker. Only deliberately opt-in to CI using `[run-ci]`.
