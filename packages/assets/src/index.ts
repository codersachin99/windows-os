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
  fileExplorer: "/assets/images/fileexplorer.43fce486.webp",
  contacts: "/apps/contacts/icon.webp"
} as const;
