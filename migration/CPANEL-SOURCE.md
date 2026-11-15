# Source Control Panel a259 / Display — initial navigable React slice

Pinned source: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`,
`src/modules/apps/cpanel.js`, original a259 `window-cpanel` and
display module Re (lines ~2880–3195). The original panel has titlebar,
back/forward addressbar, breadcrumb history `history=[null]` and
`historyIndex=0`, search field, root tiles, six internal panel IDs
`accounts`, `action-center`, `backup`, `display`,
`notification`, `programs`, and `openLocation()` that truncates
forward history on new navigation.

**Actually implemented now:** registered reusable `ControlPanelApp` via
the normal `AppRegistry` and shared `WindowFrame`, with source Start menu
right-side entry, real location/breadcrumb state, back/forward history,
instant *Display-only* search, and the original Display panel. The Display
screen includes exact source preview, the device dropdown, generated
fullscreen/4:3/16:10/16:9/21:9 resolution descriptions and original
70–200% zoom labels. The source checks `isWeb` and disables the hardware
settings fieldset in browsers; React preserves this boundary and does not
pretend to change native monitor resolution. Cancel closes Control Panel.

**Original binary artwork:** `cpanel.38ffbb1d.webp`,
`display.8adb9edd.webp`, and `resolution.f3fc8376.webp`
were imported from the pinned legacy commit as byte-identical blobs, with
original Git SHA verification. Browser/unit tests cover the Start entry,
preview art, source navigation, browser-disabled settings and search.

**Still not implemented:** full root tiles/categories from source shared
a97a provider, other five internal panels and their settings, full
source indexed search, live device setting adapters, full old-source CSS
pixel/layout acceptance, alternate skins, source `windowLocation` router
integration, breadcrumbs outside the two known locations. Do not label this
module implemented or source-verified. It remains **in progress**. The
current root intentionally exposes only a functioning Display entry rather
than fake pages. The first screen layout uses source classes and source
art but awaits screenshot comparison.
