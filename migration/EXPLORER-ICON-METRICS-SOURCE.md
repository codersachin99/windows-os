# Computer icon-view source geometry — 17 November 2026

## Pinned reference and scope

Repository `codersachin99/legacy-win7`, exact commit
`4e63290d783009e1293433c6ccf252abba9c1187`,
`src/styles/apps/computer.css` and its imported React copy
`packages/apps/explorer/src/source.css`.

The original is *not* a generic CSS icon grid. Its `listview__view`
classes apply the following dimensions in Computer and Recycle Bin:

| Original view | Item width | Image box | Original item padding |
| --- | --- | --- | --- |
| Small icons | 30%, minimum 160px | 16×16px | 2px |
| Medium icons | 96px | 88×88px | 2px 4px 4px |
| Large icons | 144px | 128×128px | 2px 8px 8px |
| Extra large icons | 212px | 196×196px | 2px 8px 8px |
| Tiles | 20% − 8px, minimum 256px | 48×48px | 4px |
| Content | full width | 48×48px | 4px |

Medium/Large/Extra captions in the original use four-line
`-webkit-line-clamp`, `white-space:normal` and centered text.

## Why another CSS adapter was necessary

`source.css` already retains the original `computer.css` unchanged,
but later `ExplorerApp.css` selectors for the React `explorer-item`
override many of those dimensions. This made medium imagery 64px,
large 112px, extra-large 160px, and default Tiles 32px even though
the source stylesheet remained present. The actual visible geometry
was not faithful to the original.

Commit `3dbce2c` aligns the overriding React selectors to the source
sizes, padding and four-line caption behavior for all three selected
Win7, WinXP and Win11 themes. The existing Win7-specific Tiles/Details,
list and content rules remain undisturbed; extra-small screens retain
separate responsive overrides where the source would otherwise
overflow a narrow mobile window.

`tests/e2e/source-computer-icon-metrics.spec.ts` asserts computed
browser dimensions for all three enlarged modes, Small and Tiles,
and verifies that changing between XP and Windows 11 retains the
pinned large-icon dimensions. This is checked in desktop and mobile
Chromium on deliberate `[run-ci]` commits.

## Acceptance boundary

Matching CSS metrics is not full visual parity. The exact original
window chrome, theme popup palette, font rendering, Explorer empty
areas and pixel-level source-versus-React screenshot comparison remain
unverified. No external host filesystem reads were introduced; the
test fixture is a Guest VFS file. PR #1 remains draft, main untouched.
