export const LEGACY_REVISION = "4e63290d783009e1293433c6ccf252abba9c1187" as const;

// Exact asset file names and bytes come from legacy-win7 at LEGACY_REVISION.
// Keep source names and paths. Do not substitute emoji or approximated artwork.
export const legacyArt = {
  wallpaperWin7: "/assets/images/default.deccec52.webp",
  wallpaperChoices: [
    "/assets/images/default.deccec52.webp",
    "/assets/images/win7-1.5c44223b.webp",
    "/assets/images/win7-2.bf7d7452.webp",
    "/assets/images/win7-3.64168120.webp",
    "/assets/images/win7-4.53fed3fd.webp"
  ],
  logonBackground: "/assets/images/login.85fd59c8.webp",
  guestAvatar: "/assets/images/guest.1a7eab2b.webp",
  accountFrame: "/assets/images/acc-frame.8481679a.webp",
  logonArrow: "/assets/images/logon.4ecf68e0.webp",
  startOrb: "/assets/images/start-button.b35eae12.webp",
  win7Brand: "/assets/images/start-button-classic.ec7b0b9f.webp",
  recycleBin: "/assets/images/bin.7193a1d7.webp",
  computer: "/assets/images/computer.f1f7f519.webp",
  notepad: "/assets/images/notepad.90e3ce4c.webp",
  calculator: "/assets/images/calc.1733a9a0.webp",
  run: "/assets/images/run.cf7c0332.webp",
  sticky: "/assets/images/sticky.e63cea5a.webp",
  stickyAdd: "/assets/images/stickynotes-add.bfbefc41.webp",
  stickyClose: "/assets/images/stickynotes-close.80b2c95a.webp",
  magnifier: "/assets/images/magnifier.66b65661.webp",
  magnifierHelp: "/assets/images/help.a34353ca.webp",
  taskmgr: "/assets/images/taskmgr.af82f08f.webp",
  search: "/assets/images/search.5b30849a.webp",
  folder: "/assets/images/folder.677f8e80.webp",
  file: "/assets/images/file.73b2d097.webp",
  shortcut: "/assets/images/shortcut.e8c69673.webp",
  paint: "/assets/images/paint.37480453.webp",
  // Byte-identical original Windows 7 Photo Viewer icon (imported via Base64).
  photo: "/assets/images/photo.db6c5f81.webp",
  // Byte-identical original Windows 7 Sound Recorder icon.
  recorder: "/assets/images/recorder.519283f8.webp",
  // Byte-identical original Windows 7 Camera icon.
  camera: "/assets/images/camera.5e0b513d.webp",
  // Byte-identical original Windows 7 Media Player icon.
  player: "/assets/images/player.d45d301d.webp",
  // Byte-identical original Windows 7 Snipping Tool icon.
  snipping: "/assets/images/snipping.2c25345c.webp",
  // Byte-identical original Windows 7 Chrome icon.
  chrome: "/assets/images/chrome.0eddc17a.webp",
  // Byte-identical original Windows 7 Internet Explorer icon.
  ie: "/assets/images/ie.66b8418d.webp",
  fileExplorer: "/assets/images/fileexplorer.43fce486.webp",
  fileExplorerRefresh: "/assets/images/fileexplorer-refresh.7f376545.webp",
  viewModeIcon: {
    "extra-large-icons": "/assets/images/view-xl-icons.98501d90.webp",
    "large-icons": "/assets/images/view-lg-icons.5eeaf0f2.webp",
    "medium-icons": "/assets/images/view-md-icons.13e6ed1c.webp",
    "small-icons": "/assets/images/view-sm-icons.198c1e08.webp",
    "list": "/assets/images/view-list.daaaa500.webp",
    "details": "/assets/images/view-details.6c230237.webp",
    "tiles": "/assets/images/view-tiles.c4008351.webp",
    "content": "/assets/images/view-content.fe756cda.webp"
  },
  contacts: "/apps/contacts/icon.webp"
} as const;
