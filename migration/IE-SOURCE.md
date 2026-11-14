# Internet Explorer — source-backed migration

- Pinned source: codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187, src/modules/apps/ie.js (blob 9cf202d89e270465e75467b0c127f87c296ff07b, webpack 1386).
- Configuration: app.config.json defines browserHome=https://msn.com and browserSearch=https://bing.com/search?q=.
- Original manifest: IE program ID ie, executable Program Files/Internet Explorer/iexplore.exe.
- Original image: ie-onebit.37a664e0.svg imported byte-identically, source Git blob a91eb2430602f735ba6360e39b3029debc4238b8.
- Source Win7 image ie.66b8418d.webp (blob c587b0afe72cf508af2ecf438174416f36bc45bc) is imported byte-identically via GitHub Base64 and now used in the Win7 app registry.

## Implemented source behaviors

- Initial source MSN URL with empty history and disabled Back/Next.
- Original Bing search URL with encodeURIComponent.
- Address input selection on focus, Enter/Go to navigate, Back/Next history with forward truncation.
- Source disabled Favorites/Bookmarks menubar, iframe viewport, loading progress hidden 500ms after load, Internet status label.
- Dedicated React application package with shell registry, Start Menu and Run/installed program integration.
- HTTP(S) URL-only guard: untrusted active content schemes and embedded URL credentials are never executed.

## Verification boundary

- Unit tests assert pinned config, URL handling, search encoding and history branch behavior.
- Browser tests assert app launch, iframe URL attributes, menus, Back/Forward, search and rejected dangerous schemes. They never assert external site contents.
- Websites such as MSN and Bing can refuse iframe embedding because of server frame policies. The port is not a native browser engine.
- Precise source 0f35 and 617a URL helper semantics, message-browser component, exact Win7 window geometry and multi-theme screenshot parity remain pending.
- [CI #43574037011 SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43574037011): 284 unit tests across 56 files, 286 browser cases, 40 source-art audits, TypeScript and build. Source IE remains in-progress until exact original pixel/functional parity. Draft PR #1 unmerged, main unchanged.
