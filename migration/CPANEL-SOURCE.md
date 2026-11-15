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

## Programs and Features — source-list/selection follow-up

The original `src/modules/apps/cpanel.js` `ra` programs panel renders
a two-pane list with heading `uninstall-change-program`, source instruction,
disabled Organize menu, name/date/version/type table and click-selectable
rows sorted by lower-case label. The React Control Panel now exposes a
second real navigation location `programs`; its rows come from the
already source-pinned c170 manifest `sourcePrograms`, filtered to actual
Guest-installed executable paths and excluding source-hidden entries.
The module does **not** invent host machine installed packages or device
version metadata: version is `--`, date explicitly unknown, type
`Simulation`. The original split between `appItems` (device metadata)
and `programItems` (simulator data) is still pending. Row selection,
Back/Forward history, search discovery and no-uninstall-without-permissions
are covered by model and desktop/mobile browser tests.

Imported source exact `programs.610e703b.webp` with verified Git blob
SHA `20787fca64de67b1b40ba3c16baf2f3362d84e6a`. The original
installer launch side pane and uninstall flows are not implemented;
do not substitute deleting Guest binaries. Other internal Control Panel
screens, full category/search index and screenshot fidelity are pending.

## User Accounts — source Guest-only Kt/Xt page

Pinned `src/modules/apps/cpanel.js` `Kt` handles original
account panel `accounts` and `pageLinks`. With `user=null`
(the pinned browser Guest desktop), `Change password`, `Change picture`,
`Change name`, `Link account`, and `Delete account` are disabled;
the Guest card from `G` displays `Guest account`; the
`logoff()` action emits `changeView({view:"Switch"})`, **not** a
destructive `LOG_OFF`. React now renders that source Guest card and
blocked actions, and invokes the existing permissioned `SWITCH_USER`
phase to preserve running windows and files. This was verified from
the source; authenticated account management and backend changes are
not faked. The source's "View other accounts" action relies on the
original account backend and is explicitly disabled pending that
integration.

Added narrow account search, Back/Forward navigation, source file-art
`accounts.2f4d5075.webp` imported byte-identically (blob SHA
`9b11bc4dd87a06e76db474967deaeda6d45c9def`), unit contracts
and desktop/mobile browser acceptance for Guest switch/resume. All
other original Control Panel account pages and screenshot parity
remain pending. This commit intentionally avoids `[run-ci]` while
the earlier Display+Programs acceptance run #43717661924 is active.

## Notification Area Icons — source bc55 + cpanel.js qe responsive tray behavior

Original `src/modules/shell/taskbar-base.js` module `bc55`
defines **four** default tray items in order: Action Center, Network,
Battery, Volume, each state `"shown"`; `showClockIcon=true`,
`alwaysShowIcons=false`. Its selectors `visibleItems`, `hiddenItems`
and `enabledItems` differentiate `shown`, `hidden`,
`notifications-only` and `off`. The source `cpanel.js` `qe`
panel provides the notification-area dropdowns, system icon on/off
subpage, Restore defaults, Always show checkbox, and OK/Cancel footer.

React now has a typed pure tray preference model, original initial values,
source selector functions and deterministic unit tests. The fourth
Control Panel page `notification` renders both `qe` subviews.
Preferences are lifted to `App` so they survive source
`Alt+L` Switch/resume; visible tray icons, clock visibility and
hidden-icons flyout update immediately on selection. Restore default
behaviors resets only `trayItems` exactly as the source action; it
does not implicitly change the independent clock/always-show options.
Desktop/mobile browser tests exercise visible/hidden flags, flyout,
always-show, system clock off/on and restoring defaults.

Imported five byte-identical pinned Win7 assets: volume 100, network,
action-center, datetime-s and battery 90. Tray images are simulator UI;
their presence **does not assert real host battery level or internet
connectivity**, and clicking icons does not control native speakers or
OS notifications. Full Vuex persisted settings, tray popup contents,
notification counts/actions, source mobile skin and pixel screenshots
remain pending. The page and shell tray wiring intentionally have no
`[run-ci]` while CI #43717661924 from the previous Display/Programs
batch is running. The new code cannot be called CI-accepted yet.
