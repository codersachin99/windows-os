# Source Guest disk and profile bootstrap — evidence and implementation

**Pinned source:** \`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187\`  
**Bundled source:** \`src/modules/chunks/shared~plugin-embed~sandbox~system-cache~vue-app~vue-store.js\`  
**React implementation:** \`packages/filesystem/src/sourceGuest.ts\`, \`packages/sdk/src/runtime.ts\`, \`apps/web/src/App.tsx\`.

## Exact source evidence

The original webpack bundle exposes these functions and constants (names and source fragments are paraphrased below; raw code remains in the private source repository):

| Original webpack module | Source behavior | React counterpart |
|---|---|---|
| \`5401\` | \`EXTERNAL\` volume; \`computer\` drive root; system disk name \`drive0\`; special folder template map | \`SOURCE_COMPUTER_ROOT\`, \`SOURCE_SYSTEM_DISK\` |
| \`4cca\` | \`getPath\` builds \`computer/drive0\`; \`getUserPath\` suffix is \`Users/<uid>\` or \`Users/Guest\` | \`SOURCE_GUEST_PROFILE\` and drive mapping |
| \`757f\` | first system initialization has Program Files, Program Files/Common Files, ProgramData, Users, Users/Public, Windows, Windows/System32; other installation paths come from the program manifest | \`SOURCE_SYSTEM_FOLDERS\` |
| \`5401\` | special folders Desktop, Documents, Downloads, Music, Pictures, Videos, Favorites, AppData; user AppData/Roaming holds WindowsOS/Windows/RecycleBin, Recent, SendTo, Start Menu/Programs | \`SOURCE_GUEST_FOLDERS\`, \`SOURCE_GUEST_TRASH\` |
| \`760d\` | system installer creates folders and program binaries; user installer creates special folders, program menu categories and application \`.lnk\` files | only source-proven directory creation is implemented; binaries and shortcuts remain pending |
| explorer service, same chunk | \`getSystemPath\` obtains a URI for \`computer/drive0\`; \`init\` creates the default System volume (letter C); \`ensureUser(null)\` populates Guest; \`getTrashPath\` derives AppData/Roaming/WindowsOS/Windows/RecycleBin | \`sourceGuestMounts\`, \`ensureSourceGuestDirectories\`, \`SourceFilesystemRuntime.startGuest\` |
| \`getStats\` | enumerates drives, estimates quota/usage and also exposes a non-accessible \`DVD RW Drive\` (Z:) | mounted C: and disabled Z: entry; host capacity and optical-device filesystem are **not** invented |

## Source-derived virtual paths

All values are normalized simulated external-drive URIs, not host filesystem paths:

- System root: \`/EXTERNAL/computer\`
- Original System (C:) drive: \`/EXTERNAL/computer/drive0\`
- Guest profile: \`/EXTERNAL/computer/drive0/Users/Guest\`
- Desktop: \`/EXTERNAL/computer/drive0/Users/Guest/Desktop\`
- Documents: \`/EXTERNAL/computer/drive0/Users/Guest/Documents\`
- Recycle Bin: \`/EXTERNAL/computer/drive0/Users/Guest/AppData/Roaming/WindowsOS/Windows/RecycleBin\`

The source's native Capacitor \`getUri\` can return a device-specific absolute URI. For the React virtual filesystem we preserve the source's \`EXTERNAL/computer/drive0\` logical hierarchy, not a platform-dependent file URL.

## Runtime behavior

Guest login now calls \`SourceFilesystemRuntime.startGuest()\`. When an existing **explicit source-runtime snapshot** exists, it takes priority and is restored unchanged. Otherwise, the pinned original source layout is seeded idempotently using the VFS. The profile is persisted in browser storage and preserved across reloads. The preexisting simulated file store at \`windows-os:vfs:guest:v1\` remains intact, including any files created before this checkpoint.

Computer now exposes the source System (C:) and Guest directories in its navigation panel, and displays the original DVD Z: device as disabled instead of inventing writable media. Explorer right-click item and background menus route through the existing shared file operations, while unsupported Properties and advanced menu commands remain disabled.

## Explicit gaps and acceptance

This milestone **does not** import the original bundled executables, shortcuts, UI icon assets, audio, localforage files, metadata files, dynamic disk quota, alternate user accounts, removable volumes, Windows native host files, or original installer shell events. Those require independent source mapping and visual/functional tests. The original source's installation build marker is not emulated as a claim of full installation.

The original \`computer.js\`, \`bin.js\`, and relevant large webpack chunks remain \`in-progress\`. The source-root migration is evidence-backed; full simulator parity is not reached.
