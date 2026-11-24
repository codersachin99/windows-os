import {sourceIsXpFamily} from "@windows-os/contracts";
export const LEGACY_REVISION = "26b9f0ce7a1665dee89a7c81824bec09e2c75776" as const;

/**
 * Frozen src/modules/shell/startmenu-base.js "start-docs", "start-pics"
 * and "start-music" icon keys. These six image files were imported via
 * their original Git blobs; their SHA-1 Git blob IDs equal the immutable
 * legacy-win7@LEGACY_REVISION objects, without re-encoding or substitution.
 * Source isBaseTheme hides avatar hover previews; preserve the base images
 * for theme-specific source artwork mapping, not as forced preview widgets.
 */
export const sourceWin7StartLibraryArtwork=Object.freeze({
  documents:Object.freeze({
    standard:"/assets/images/start-docs.68e567fd.webp",
    base:"/assets/images/start-docs-base.d4ace145.svg"
  }),
  pictures:Object.freeze({
    standard:"/assets/images/start-pics.90cdea88.webp",
    base:"/assets/images/start-pics-base.b5f2d859.svg"
  }),
  music:Object.freeze({
    standard:"/assets/images/start-music.7d1b9e60.webp",
    base:"/assets/images/start-music-base.74611945.svg"
  })
});
export type SourceWin7LibraryKey=keyof typeof sourceWin7StartLibraryArtwork;
export function sourceWin7StartLibraryIcon(
  theme:string,key:SourceWin7LibraryKey
):string{
  return theme.startsWith("basic-")
    ?sourceWin7StartLibraryArtwork[key].base
    :sourceWin7StartLibraryArtwork[key].standard;
}

// Exact asset file names and bytes come from legacy-win7 at LEGACY_REVISION.
// Keep source names and paths. Do not substitute emoji or approximated artwork.
export const legacyArt = {
  wallpaperWin7: "/assets/images/default.deccec52.webp",
  wallpaperArchitecture: "/assets/images/architecture.e651db26.webp",
  wallpaperLandscape: "/assets/images/landscape.1626b82c.webp",
  wallpaperNature: "/assets/images/nature.e05e4ec0.webp",
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
  // Byte-identical pinned original Windows 7 Command Prompt artwork.
  cmd: "/assets/images/cmd.a2c1d19b.webp",
  // Byte-identical pinned Win7 Control Panel and Display page artwork.
  cpanel: "/assets/images/cpanel.38ffbb1d.webp",
  personalize: "/assets/images/personal.ccbfdd3a.webp",
  // Original c170 game icons and shell:games folder, verified by pinned Git blob SHA.
  games: "/assets/images/games.e71bd970.webp",
  chess: "/assets/images/chess.92e3ebb6.webp",
  mahjong: "/assets/images/mahjong.129fbf1a.webp",
  minesweeper: "/assets/images/minesweeper.d2b56ae5.webp",
  purbleplace: "/assets/images/purbleplace.55ae3611.webp",
  solitaire: "/assets/images/solitaire.35c75495.webp",
  spidersolitaire: "/assets/images/spidersolitaire.2d281206.webp",
  tetris: "/assets/images/tetris.7ea2464e.webp",
  display: "/assets/images/display.8adb9edd.webp",
  programs: "/assets/images/programs.610e703b.webp",
  accounts: "/assets/images/accounts.2f4d5075.webp",
  // Pinned source taskbar-base.js Win7 tray icon variants.
  trayVolume: "/assets/images/volume-100.fb90d926.webp",
  trayNetwork: "/assets/images/network.21b75845.webp",
  trayActionCenter: "/assets/images/action-center.4d8b33c7.webp",
  trayClock: "/assets/images/datetime-s.4f8b0fa9.webp",
  trayBattery: "/assets/images/battery-90.a4b58b08.webp",
  resolutionPreview: "/assets/images/resolution.f3fc8376.webp",
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
  // Exact original Win7 web application viewer artwork.
  internet: "/assets/images/internet.b27ef7d7.webp",
  // Byte-identical original Windows 7 Chrome icon.
  chrome: "/assets/images/chrome.0eddc17a.webp",
  // Byte-identical original Windows 7 Internet Explorer icon.
  ie: "/assets/images/ie.66b8418d.webp",
  // Source-exact Win7 base-message warning/error art.
  messageWarning: "/assets/images/warning.cce1fd36.webp",
  messageError: "/assets/images/error.026cae2a.webp",
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

// Original XP/Win11 shell image names and bytes were imported from the
// pinned legacy-win7 revision. Never use generated substitute graphics.
export const legacyShellThemeAssets = Object.freeze({
  // Pinned source 9x & 2k theme artwork is byte-identical to legacy-win7
  // @26b9f0c. Win95/98 share their classic source icon family.
  win95: {
    start: legacyArt.win7Brand,
    computer:"/assets/images/computer-win95.004ba941.webp",
    bin:"/assets/images/bin-win95.28a063bb.webp",
    binFull:"/assets/images/bin-full-win95.5b7aebde.webp",
    folder:"/assets/images/folder-win95.dde31877.webp",
    file:"/assets/images/file-win95.ce41ba94.webp",
    theme:"/assets/images/win95.fcef1b3b.webp"
  },
  win2k: {
    start:"/assets/images/start-button-win2k.650d501c.webp",
    computer:"/assets/images/computer-win2k.5c9df4ed.webp",
    bin:"/assets/images/bin-win2k.4b231417.webp",
    binFull:"/assets/images/bin-full-win2k.f2dd6793.webp",
    folder:"/assets/images/folder-win2k.6bea372b.webp",
    // The source's 2k set does not override the generic file icon.
    file:"/assets/images/file-win95.ce41ba94.webp",
    theme:"/assets/images/default-win2k.1c1f7fa2.png"
  },
  // Pinned original icons.registry.json win10 group; the source uses the
  // Win8 Start button SVG for Win10, not the Win7 glass orb.
  win10: {
    start: "/assets/images/start-button-win8.2e5214cc.svg",
    computer: "/assets/images/computer-win10.2212df79.webp",
    bin: "/assets/images/bin-win10.e0f739cc.webp",
    binFull: "/assets/images/bin-full-win10.857c2cab.webp",
    folder: "/assets/images/folder-win10.294665f0.webp",
    file: "/assets/images/file-win10.036601ed.webp",
    theme: "/assets/images/win10.743e8c13.webp"
  },
  winxp: {
    start: "/assets/images/start-button-winxp.a3485adf.webp",
    computer: "/assets/images/computer-winxp.8cbae9da.webp",
    bin: "/assets/images/bin-winxp.7d0403fd.webp",
    binFull: "/assets/images/bin-full-winxp.ba3f6193.webp",
    folder: "/assets/images/folder-winxp.ff1b00c5.webp",
    file: "/assets/images/file-winxp.c130b357.webp",
    theme: "/assets/images/winxp.3e41719f.webp"
  },
  win11: {
    start: "/assets/images/start-button-win11.e48a735f.webp",
    computer: "/assets/images/computer-win11.fc5b48e4.webp",
    bin: "/assets/images/bin-win11.73608517.webp",
    binFull: "/assets/images/bin-full-win11.de576bf3.webp",
    folder: "/assets/images/folder-win11.49360b7d.webp",
    file: "/assets/images/file-win11.8b2c3723.webp",
    theme: "/assets/images/win11.fc00c43d.webp"
  }
} as const);

/** Source-pinned Windows 11 dark variant is a distinct desktop image and
 * Start orb, while the remaining Windows 11 app/file icon family is shared.
 * Both blobs were copied unchanged from legacy-win7@26b9f0ce.
 */
export const sourceWin11DarkArtwork=Object.freeze({
  wallpaper:"/assets/images/win11dark.af52a1ca.webp",
  start:"/assets/images/start-button-win11dark.d417814c.webp"
});

/** Immutable Win8/Win8.1 native wallpaper and fullscreen Start art from
 * pinned legacy-win7 source. Unlike Windows 10, Win8/Win81 have no
 * distinct Computer/Bin icon overrides in icons.registry.json.
 * The source Win8 Start button SVG was already byte-imported for Win10.
 */
export const sourceWin8ShellArtwork=Object.freeze({
  win8Wallpaper:"/assets/images/win8.3a5f11f3.webp",
  win81Wallpaper:"/assets/images/win81.7b80787e.webp",
  startScreen:"/assets/images/win8-startscreen.844bc8df.webp",
  start:"/assets/images/start-button-win8.2e5214cc.svg"
});

/** Source logon-winxp.js / logon-win11.js exact original artwork.
 * These two new binary assets were imported with Git blob SHA equality
 * against pinned legacy-win7@26b9f0c, not redrawn/generated.
 * Windows XP source avatar is from original account store's Guest icon.
 */
export const sourceThemeLogonArtwork=Object.freeze({
  win8:Object.freeze({
    guest:"/assets/images/guest-win8.265e68f5.webp"
  }),
  win10:Object.freeze({
    guest:"/assets/images/guest-win10.a110df5a.webp",
    background:legacyShellThemeAssets.win10.theme
  }),
  win2k:Object.freeze({banner:"/assets/images/logo2k.15140c8b.webp"}),
  winLS:Object.freeze({
    background:"/assets/images/login-winL.d27b081a.webp",
    brand:"/assets/images/start-button-winxp.a3485adf.webp",
    guest:"/assets/images/guest-win10.a110df5a.webp"
  }),
  winW:Object.freeze({
    logo:"/assets/images/logowhistler.73c9045c.webp"
  }),
  winvista:Object.freeze({
    background:"/assets/images/login-winvista.7a523d62.webp",
    shutdown:"/assets/images/shutdown.08d3f74a.webp"
  }),
  macos:Object.freeze({
    background:"/assets/images/macos.54af5cd4.webp",
    guest:"/assets/images/guest-macos.caf967b3.webp"
  }),
  chromeos:Object.freeze({
    background:"/assets/images/chromeos.eaca6e72.webp",
    guest:"/assets/images/usertile12.75a9eb89.webp"
  }),
  ubuntu:Object.freeze({
    guest:"/assets/images/guest-ubuntu.e2037acf.svg",
    logo:"/assets/images/logo-ubuntu.b06d4c47.svg"
  }),
  kubuntu:Object.freeze({
    background:"/assets/images/kubuntu.618268f7.webp",
    guest:"/assets/images/guest-win10.a110df5a.webp",
    restart:"/assets/images/restart-kubuntu.5c766c73.svg",
    shutdown:"/assets/images/shutdown-kubuntu.146c3ea3.svg"
  }),
  oxygen:Object.freeze({
    background:"/assets/images/oxygen.414aed47.svg",
    guest:legacyArt.guestAvatar,
    restart:"/assets/images/restart-oxygen.d4450a1a.webp",
    shutdown:"/assets/images/shutdown-oxygen.62df7a25.webp"
  }),
  aeroNoir:Object.freeze({
    background:"/assets/images/aeroNoir.237e6377.webp",
    guest:"/assets/images/guest-win10.a110df5a.webp",
    restart:"/assets/images/restart-kubuntu.5c766c73.svg",
    shutdown:"/assets/images/shutdown-kubuntu.146c3ea3.svg"
  }),
  winxp:Object.freeze({
    logo:"/assets/images/logoxp.9b034658.png",
    guest:legacyArt.guestAvatar
  }),
  win11:Object.freeze({
    guest:"/assets/images/guest-win10.a110df5a.webp",
    background:legacyShellThemeAssets.win11.theme
  })
});

/** Pinned 3b8c desktop registry art. These are desktop defaults, not
 * login artwork unless the source deliberately shares the same asset. */
export const sourceAdditionalDesktopWallpapers=Object.freeze({
  winvista:"/assets/images/winvista.d80b2f4f.webp",
  macos:"/assets/images/macos.54af5cd4.webp",
  chromeos:"/assets/images/chromeos.eaca6e72.webp",
  ubuntu:"/assets/images/ubuntu.3588c6cf.webp",
  kubuntu:"/assets/images/kubuntu.618268f7.webp",
  winLS:"/assets/images/winLS.e359a90f.jpg",
  winLP:"/assets/images/winLP.dcaa8b07.jpg",
  aeroNoir:"/assets/images/aeroNoir.237e6377.webp",
  oxygen:"/assets/images/oxygen.414aed47.svg",
  winW:"/assets/images/winW.6a3e313e.webp",
  winxpG:"/assets/images/autumn.41774694.webp",
  winxpR:"/assets/images/follows.3e030a12.webp",
  winxpS:"/assets/images/azul.3af33f73.webp",
  winxpZ:"/assets/images/ascent.7c62e722.webp"
});
/** Original source ChangeTheme save() also changes the active background. */
export function sourceShellWallpaper(theme:string):string{
  // Pinned built-in registry 3b8c: exact Aero image categories and
  // Basic 2–4 solid desktop colors, not inferred Win7-1…4 files.
  if(theme==="aero-2")return legacyArt.wallpaperArchitecture;
  if(theme==="aero-3")return legacyArt.wallpaperLandscape;
  if(theme==="aero-4")return legacyArt.wallpaperNature;
  if(theme==="basic-2")return "#3b6ea4";
  if(theme==="basic-3")return "#000";
  if(theme==="basic-4")return "#fff";
  if(theme==="win31")return "#bfbdc0";
  if(theme==="win95")return "#007d7b";
  if(theme==="win98")return "#57a8a8";
  if(theme==="win2k")return "#3b6ea4";
  if(theme==="win8")return sourceWin8ShellArtwork.win8Wallpaper;
  if(theme==="win81")return sourceWin8ShellArtwork.win81Wallpaper;
  if(theme==="win10")return legacyShellThemeAssets.win10.theme;
  if(theme==="win11")return legacyShellThemeAssets.win11.theme;
  if(theme==="win11dark")return sourceWin11DarkArtwork.wallpaper;
  if(theme==="base")return "#fffd";
  if(theme==="onebit")return "#352b30";
  if(Object.prototype.hasOwnProperty.call(sourceAdditionalDesktopWallpapers,theme))
    return sourceAdditionalDesktopWallpapers[theme as keyof typeof sourceAdditionalDesktopWallpapers];
  if(sourceIsXpFamily(theme))return legacyShellThemeAssets.winxp.theme;
  return legacyArt.wallpaperWin7;
}

/** The subset of original system backgrounds actually byte-imported from
 * the pinned legacy source. Do not add guessed URLs or unported user uploads. */
export const sourceSystemWallpapers:readonly string[]=Object.freeze([
  legacyShellThemeAssets.win95.theme,
  legacyShellThemeAssets.win2k.theme,
  ...legacyArt.wallpaperChoices,
  legacyArt.wallpaperArchitecture,
  legacyArt.wallpaperLandscape,
  legacyArt.wallpaperNature,
  sourceWin8ShellArtwork.win8Wallpaper,
  sourceWin8ShellArtwork.win81Wallpaper,
  legacyShellThemeAssets.win10.theme,
  legacyShellThemeAssets.winxp.theme,
  legacyShellThemeAssets.win11.theme,
  sourceWin11DarkArtwork.wallpaper,
  ...Object.values(sourceAdditionalDesktopWallpapers)
]);
/** Pinned solid theme defaults, not user-supplied CSS or URLs. */
export function sourceIsSolidThemeWallpaper(path:string):boolean{
  return ["#3b6ea4","#000","#fff","#fffd","#352b30","#bfbdc0","#007d7b","#57a8a8"].includes(path);
}
export function sourceIsSystemWallpaper(path:string):boolean{
  return sourceSystemWallpapers.includes(path);
}


/** Byte-identical pinned boot images from legacy-win7/src/modules/themes:
 * boot-win31.js: portrait-ish 5/6-height image
 * boot-win9x.js: stretched fullscreen GIF for 95/98/2k/XP
 * boot-win-mixed.js: contained source image for Vista, winLS/LP, WinW
 * boot-win-x.js: 100px logo + five-orbit 25px spinner for Win8/10/11.
 * Source 'win10' deliberately reuses 'boot-win8'; 'winLP' maps to 'winLS'
 * in app.config.json, which uses the original 'boot-winL' image.
 */
export const sourceBootOriginalArtwork=Object.freeze({
  win31:{renderer:"win31",src:"/assets/images/boot-win31.7bac4ac4.webp"},
  win95:{renderer:"win9x",src:"/assets/images/boot-win95.9bf06d7a.gif"},
  win98:{renderer:"win9x",src:"/assets/images/boot-win98.36ae413e.gif"},
  win2k:{renderer:"win9x",src:"/assets/images/boot-win2k.2870262d.gif"},
  winxp:{renderer:"win9x",src:"/assets/images/boot-winxp.c42ee019.gif"},
  winvista:{renderer:"win-mixed",src:"/assets/images/boot-winvista.f7526b81.gif"},
  win8:{renderer:"win-x",src:"/assets/images/boot-win8.1a6acdfd.webp"},
  win10:{renderer:"win-x",src:"/assets/images/boot-win8.1a6acdfd.webp"},
  win11:{renderer:"win-x",src:"/assets/images/boot-win11.120bb3b3.webp"},
  winLS:{renderer:"win-mixed",src:"/assets/images/boot-winL.934ea74a.gif"},
  winW:{renderer:"win-mixed",src:"/assets/images/boot-winW.052f504e.webp"}
} as const);
export type SourceBootOriginalRenderer=
  (typeof sourceBootOriginalArtwork)[keyof typeof sourceBootOriginalArtwork]["renderer"];
/** Strict source family lookup: unported boot screens retain the Win7
 * fallback, never derive an asset path from arbitrary theme strings. */
export function sourceBootOriginalArt(screen:string):
  {readonly renderer:SourceBootOriginalRenderer;readonly src:string}|null{
  return Object.prototype.hasOwnProperty.call(sourceBootOriginalArtwork,screen)
    ?sourceBootOriginalArtwork[screen as keyof typeof sourceBootOriginalArtwork]
    :null;
}

/** Original XP/Win11 application icon variants, all pinned Git blobs. */
export const legacyThemeProgramArtwork=Object.freeze({
  win10:Object.freeze({
    computer:"/assets/images/computer-win10.2212df79.webp",
    bin:"/assets/images/bin-win10.e0f739cc.webp",
    games:"/assets/images/games-win10.63f82076.webp",
    cpanel:"/assets/images/cpanel-win10.d3d1d446.webp"
  }),
  winxp:Object.freeze({
    notepad:"/assets/images/notepad-winxp.82037fb1.webp",
    games:"/assets/images/games-winxp.7f048588.webp",
    personalize:"/assets/images/personal-winxp.01949b73.webp",
    cpanel:"/assets/images/cpanel-winxp.1b08f5c8.webp",
    calc:"/assets/images/calc-winxp.f79aee6b.webp",
    cmd:"/assets/images/cmd-winxp.62e75899.webp",
    "action-center":"/assets/images/action-center-winxp.52f44912.webp",
    "network":"/assets/images/network-winxp.744648d4.webp",
    "battery":"/assets/images/battery-winxp.af8edd8a.webp",
    "datetime":"/assets/images/datetime-winxp.d62f4ef6.webp",
    "camera":"/assets/images/camera-winxp.b21fe0fe.webp",
    "magnifier":"/assets/images/magnifier-winxp.24194bc4.webp",
    "paint":"/assets/images/paint-winxp.7e4e5dac.webp",
    "player":"/assets/images/player-winxp.e1b486dd.webp",
    "run":"/assets/images/run-winxp.63d23fb9.webp",
    "display":"/assets/images/display-winxp.da9a9b48.webp",
    "programs":"/assets/images/programs-winxp.f148b05d.webp",
    "personal":"/assets/images/personal-winxp.01949b73.webp",
    "taskbar":"/assets/images/taskbar-winxp.46a225c9.webp",
    "wordpad":"/assets/images/wordpad-winxp.1bde3c38.webp",
    "text":"/assets/images/text-winxp.35e970dd.webp",
    "executable":"/assets/images/executable-winxp.b1d9ded4.webp",
    "media":"/assets/images/media-winxp.c7e33e88.webp",
    "folder-docs":"/assets/images/folder-docs-winxp.a303ce2a.webp",
    "folder-pics":"/assets/images/folder-pics-winxp.05398ea9.webp",
    "folder-music":"/assets/images/folder-music-winxp.dc009194.webp",
    "folder-videos":"/assets/images/folder-videos-winxp.c38aba27.webp",
    "disk-os":"/assets/images/disk-os-winxp.e3c2a016.webp",
    "disk-cd":"/assets/images/disk-cd-winxp.83ac2166.webp",
    "disk-data":"/assets/images/disk-data-winxp.225dcc03.webp",
    "default":"/assets/images/default-winxp.4351048b.webp"
  }),
  win11:Object.freeze({
    notepad:"/assets/images/notepad-win11.2e4af294.webp",
    games:"/assets/images/games-win11.d339e9be.webp",
    personalize:"/assets/images/personal-win11.76af8a1e.webp",
    cpanel:"/assets/images/cpanel-win11.e7111666.webp",
    photo:"/assets/images/photo-win11.bb63ad2e.webp",
    cmd:"/assets/images/cmd-win11.ecbe89c7.webp",
    "paint":"/assets/images/paint-win11.ea557c33.webp",
    "text":"/assets/images/text-win11.d9d08eae.webp",
    "executable":"/assets/images/executable-win11.2b4d4283.webp",
    "media":"/assets/images/media-win11.a4cd83eb.webp",
    "folder-docs":"/assets/images/folder-docs-win11.18b5729b.webp",
    "folder-pics":"/assets/images/folder-pics-win11.76e995dc.webp",
    "folder-downloads":"/assets/images/folder-downloads-win11.f675795b.webp",
    "disk-os":"/assets/images/disk-os-win11.4aee0d0a.webp",
    "disk-cd":"/assets/images/disk-cd-win11.84d9e496.webp",
    "disk-data":"/assets/images/disk-data-win11.a389fbb1.webp",
    "default":"/assets/images/default-win11.fdf9b988.webp"
  })
} as const);
export const sourceWin2kProgramArtwork:Readonly<Record<string,string>>=Object.freeze({
  about:"/assets/images/about-win2k.ddc7bdd1.webp",
  programs:"/assets/images/programs-win2k.a348b75a.webp",
  games:"/assets/images/games-win2k.4f15470b.webp",
  cpanel:"/assets/images/cpanel-win2k.613075e7.webp",
  search:"/assets/images/search-win2k.b73ad698.webp",
  run:"/assets/images/run-win2k.a75b3afb.png",
  shutdown:"/assets/images/shutdown-win2k.db9ed044.webp",
  computer:"/assets/images/computer-win2k.5c9df4ed.webp",
  bin:"/assets/images/bin-win2k.4b231417.webp",
  "bin-full":"/assets/images/bin-full-win2k.f2dd6793.webp",
  folder:"/assets/images/folder-win2k.6bea372b.webp"
});
/** Core macOS icon pack, pinned icons.registry.json themes.macos.
 * Keep only imported exact artwork; other keys retain explicit fallback. */
export const sourceMacOSIconArtwork=Object.freeze({
  "computer":"/assets/images/computer-mac.4c6c5258.webp",
  "bin":"/assets/images/bin-mac.499e907b.webp",
  "bin-full":"/assets/images/bin-full-mac.67e3d272.webp",
  "folder":"/assets/images/folder-mac.248938aa.webp",
  "file":"/assets/images/file-mac.f9d8e370.webp",
  "start":"/assets/images/start-button-mac.db7da45a.webp",
  "folder-docs":"/assets/images/folder-docs-mac.19ef120e.webp",
  "folder-downloads":"/assets/images/folder-downloads-mac.5a239779.webp",
  "folder-music":"/assets/images/folder-music-mac.8905b037.webp",
  "folder-pics":"/assets/images/folder-pics-mac.dfca3097.webp",
  "folder-videos":"/assets/images/folder-videos-mac.7edd23bf.webp",
  "disk-os":"/assets/images/disk-mac.c1f755d1.webp",
  "disk-data":"/assets/images/disk-mac.c1f755d1.webp",
  "disk-cd":"/assets/images/disk-mac.c1f755d1.webp",
  "disk-connected":"/assets/images/disk-mac.c1f755d1.webp",
  "disk-disconnected":"/assets/images/disk-mac.c1f755d1.webp",
  "calc":"/assets/images/calc-mac.a8be886f.webp",
  "cpanel":"/assets/images/cpanel-mac.edf3e86a.webp",
  "notepad":"/assets/images/notepad-mac.82ca5f3f.webp",
  "cmd":"/assets/images/cmd-mac.4736d145.webp",
  "text":"/assets/images/text-mac.2378630a.webp",
  "richtext":"/assets/images/richtext-mac.2378630a.webp",
  "executable":"/assets/images/executable-mac.73f92274.webp",
  "shortcut":"/assets/images/shortcut-mac.45146f00.webp"
});
function sourceMacOSIcon(key:string):string|null{
  return Object.prototype.hasOwnProperty.call(sourceMacOSIconArtwork,key)
    ?sourceMacOSIconArtwork[key as keyof typeof sourceMacOSIconArtwork]:null;
}
/** ChromeOS core registry; shared Bin and folder aliases are intentional. */
export const sourceChromeOSIconArtwork=Object.freeze({
  "computer":"/assets/images/computer-chromeos.f4f817d9.webp",
  "bin":"/assets/images/bin-chromeos.6bccf38b.webp",
  "bin-full":"/assets/images/bin-chromeos.6bccf38b.webp",
  "folder":"/assets/images/folder-chromeos.fa700781.svg",
  "file":"/assets/images/file-chromeos.c40dd66d.svg",
  "start":"/assets/images/start-button-win8.2e5214cc.svg",
  "folder-docs":"/assets/images/folder-chromeos.fa700781.svg",
  "folder-downloads":"/assets/images/downloads-chromeos.729e50f7.svg",
  "folder-music":"/assets/images/folder-chromeos.fa700781.svg",
  "folder-pics":"/assets/images/folder-chromeos.fa700781.svg",
  "folder-videos":"/assets/images/folder-chromeos.fa700781.svg",
  "disk-os":"/assets/images/disk-os-chromeos.8e3d1d59.webp",
  "disk-data":"/assets/images/disk-data-chromeos.eb3a943a.webp",
  "disk-cd":"/assets/images/disk-cd-chromeos.f4c2176f.webp",
  "disk-connected":"/assets/images/disk-data-chromeos.eb3a943a.webp",
  "disk-disconnected":"/assets/images/disk-data-chromeos.eb3a943a.webp",
  "calc":"/assets/images/calc-chromeos.a98e0827.webp",
  "cpanel":"/assets/images/cpanel-chromeos.208392b0.svg",
  "notepad":"/assets/images/notepad-chromeos.9c15f97a.webp",
  "cmd":"/assets/images/cmd-chromeos.255c4ab1.webp",
  "text":"/assets/images/text-chromeos.76d507c5.svg",
  "executable":"/assets/images/executable-win10.8269999b.webp",
  "shortcut":"/assets/images/shortcut-win10.c8f56fdb.webp",
  "media":"/assets/images/media-chromeos.51aced5d.svg",
  "zip":"/assets/images/zip-chromeos.f405c15d.svg",
  "desktop":"/assets/images/desktop-chromeos.26c36183.svg",
  "chrome":"/assets/images/chrome-chromeos.9384cbbf.svg"
});
function sourceChromeOSIcon(key:string):string|null{
  return Object.prototype.hasOwnProperty.call(sourceChromeOSIconArtwork,key)
    ?sourceChromeOSIconArtwork[key as keyof typeof sourceChromeOSIconArtwork]:null;
}
/** Pinned Ubuntu core desktop/Explorer registry, including source shortcut alias. */
export const sourceUbuntuIconArtwork=Object.freeze({
  "computer":"/assets/images/computer-ubuntu.ab0d9786.webp",
  "bin":"/assets/images/bin-ubuntu.509f78ac.webp",
  "bin-full":"/assets/images/bin-full-ubuntu.2faf5a4b.webp",
  "folder":"/assets/images/folder-ubuntu.73afbe73.svg",
  "file":"/assets/images/file-ubuntu.2f731416.svg",
  "start":"/assets/images/start-button-ubuntu.a6d206e0.webp",
  "folder-docs":"/assets/images/folder-docs-ubuntu.d9b020ee.svg",
  "folder-downloads":"/assets/images/folder-downloads-ubuntu.367c96da.svg",
  "folder-music":"/assets/images/folder-music-ubuntu.c191048c.svg",
  "folder-pics":"/assets/images/folder-pics-ubuntu.f0402adf.svg",
  "folder-videos":"/assets/images/folder-videos-ubuntu.c9f591cb.svg",
  "disk-os":"/assets/images/disk-os-ubuntu.21cd56d7.webp",
  "disk-data":"/assets/images/disk-data-ubuntu.2dd831a0.webp",
  "disk-cd":"/assets/images/disk-cd-ubuntu.8116cfe5.svg",
  "disk-connected":"/assets/images/disk-connected-ubuntu.bcb836ee.svg",
  "disk-disconnected":"/assets/images/disk-disconnected-ubuntu.6f41bf79.svg",
  "calc":"/assets/images/calc-ubuntu.52ed0dee.svg",
  "cpanel":"/assets/images/cpanel-ubuntu.0464e08d.webp",
  "notepad":"/assets/images/notepad-ubuntu.cc9f1715.webp",
  "cmd":"/assets/images/cmd-ubuntu.393c1f91.webp",
  "text":"/assets/images/text-ubuntu.733fe14c.webp",
  "richtext":"/assets/images/richtext-ubuntu.31b42436.svg",
  "executable":"/assets/images/executable-ubuntu.55e207d7.webp",
  "shortcut":"/assets/images/shortcut-win10.c8f56fdb.webp",
  "media":"/assets/images/media-ubuntu.991db543.svg",
  "zip":"/assets/images/zip-ubuntu.cef6da1f.svg",
  "desktop":"/assets/images/desktop-ubuntu.ca166b4b.webp"
});
function sourceUbuntuIcon(key:string):string|null{
  return Object.prototype.hasOwnProperty.call(sourceUbuntuIconArtwork,key)
    ?sourceUbuntuIconArtwork[key as keyof typeof sourceUbuntuIconArtwork]:null;
}
/** Pinned Kubuntu core registry. Computer/folder and Ubuntu aliases are intentional. */
export const sourceKubuntuIconArtwork=Object.freeze({
  "computer":"/assets/images/computer-kubuntu.21e2af5f.svg",
  "bin":"/assets/images/bin-kubuntu.9e105407.webp",
  "bin-full":"/assets/images/bin-full-kubuntu.52b4bff6.webp",
  "folder":"/assets/images/computer-kubuntu.21e2af5f.svg",
  "file":"/assets/images/file-kubuntu.7dae3497.webp",
  "start":"/assets/images/start-button-kubuntu.70b91e6e.svg",
  "folder-docs":"/assets/images/folder-docs-kubuntu.bc09a419.svg",
  "folder-downloads":"/assets/images/folder-download-kubuntu.3ddfc03d.svg",
  "folder-music":"/assets/images/folder-music-kubuntu.bdd260b5.svg",
  "folder-pics":"/assets/images/folder-pics-kubuntu.372cdadd.svg",
  "folder-videos":"/assets/images/folder-videos-ubuntu.c9f591cb.svg",
  "disk-os":"/assets/images/disk-os-kubuntu.367266ba.webp",
  "disk-data":"/assets/images/disk-data-kubuntu.dae58e0b.webp",
  "disk-cd":"/assets/images/disk-cd-ubuntu.8116cfe5.svg",
  "disk-connected":"/assets/images/disk-connected-ubuntu.bcb836ee.svg",
  "disk-disconnected":"/assets/images/disk-disconnected-ubuntu.6f41bf79.svg",
  "calc":"/assets/images/calc-kubuntu.1cae644c.webp",
  "cpanel":"/assets/images/cpanel-kubuntu.34a12acd.webp",
  "notepad":"/assets/images/notepad-kubuntu.3cbb25e5.webp",
  "cmd":"/assets/images/cmd-kubuntu.38e94c40.webp",
  "text":"/assets/images/text-kubuntu.3a6c3fc7.webp",
  "richtext":"/assets/images/richtext-ubuntu.31b42436.svg",
  "executable":"/assets/images/executable-kubuntu.07e7f7b2.webp",
  "shortcut":"/assets/images/shortcut-win10.c8f56fdb.webp",
  "media":"/assets/images/media-kubuntu.d9fc4ff6.webp",
  "zip":"/assets/images/zip-ubuntu.cef6da1f.svg",
  "desktop":"/assets/images/desktop-kubuntu.caba3657.webp"
});
function sourceKubuntuIcon(key:string):string|null{
  return Object.prototype.hasOwnProperty.call(sourceKubuntuIconArtwork,key)
    ?sourceKubuntuIconArtwork[key as keyof typeof sourceKubuntuIconArtwork]:null;
}
/** Pinned Aero Noir core icons; source folder/disk aliases retained. */
export const sourceAeroNoirIconArtwork=Object.freeze({
  "computer": "/assets/images/computer-aeroNoir.1a117c0c.webp",
  "bin": "/assets/images/bin-aeroNoir.12b5ed31.svg",
  "bin-full": "/assets/images/bin-full-aeroNoir.6bcff3f1.webp",
  "folder": "/assets/images/folder-aeroNoir.0a237526.svg",
  "file": "/assets/images/file-aeroNoir.a9c655e6.svg",
  "folder-docs": "/assets/images/folder-docs-aeroNoir.e177413f.svg",
  "folder-downloads": "/assets/images/folder-downloads-aeroNoir.95a9aee9.svg",
  "folder-music": "/assets/images/folder-aeroNoir.0a237526.svg",
  "folder-pics": "/assets/images/folder-aeroNoir.0a237526.svg",
  "folder-videos": "/assets/images/folder-aeroNoir.0a237526.svg",
  "disk-os": "/assets/images/disk-os-aeroNoir.54eed116.svg",
  "disk-data": "/assets/images/disk-data-aeroNoir.ea90c364.svg",
  "disk-cd": "/assets/images/disc-aeroNoir.fac45aa1.svg",
  "disk-connected": "/assets/images/disk-data-aeroNoir.ea90c364.svg",
  "disk-disconnected": "/assets/images/disk-data-aeroNoir.ea90c364.svg",
  "calc": "/assets/images/calc-aeroNoir.75c6cdda.svg",
  "cpanel": "/assets/images/cpanel-aeroNoir.9ba00864.webp",
  "notepad": "/assets/images/notepad-aeroNoir.87d75ca0.webp",
  "cmd": "/assets/images/cmd-aeroNoir.6b41da99.webp",
  "text": "/assets/images/text-aeroNoir.dc3a397c.svg",
  "richtext": "/assets/images/richtext-aeroNoir.0a8b71f5.webp",
  "executable": "/assets/images/executable-aeroNoir.229e3731.webp",
  "shortcut": "/assets/images/shortcut-aeroNoir.cd6dda1d.svg",
  "media": "/assets/images/media-aeroNoir.c443b1a1.webp",
  "zip": "/assets/images/zip-aeroNoir.20c3456d.webp",
  "desktop": "/assets/images/desktop-aeroNoir.3821791a.svg"
});
function sourceAeroNoirIcon(key:string):string|null{
  return Object.prototype.hasOwnProperty.call(sourceAeroNoirIconArtwork,key)
    ?sourceAeroNoirIconArtwork[key as keyof typeof sourceAeroNoirIconArtwork]:null;
}
/** Pinned Oxygen core artwork. Preserve original folder and disk aliases. */
export const sourceOxygenIconArtwork=Object.freeze({
  "computer": "/assets/images/computer-oxygen.d170989c.webp",
  "bin": "/assets/images/bin-oxygen.b6be9ff9.webp",
  "bin-full": "/assets/images/bin-full-oxygen.a82e7824.webp",
  "folder": "/assets/images/folder-oxygen.b048f163.webp",
  "file": "/assets/images/file-oxygen.7a4e1a22.webp",
  "folder-docs": "/assets/images/folder-docs-oxygen.c90421ab.webp",
  "folder-downloads": "/assets/images/folder-oxygen.b048f163.webp",
  "folder-music": "/assets/images/folder-music-oxygen.cd81f2bb.webp",
  "folder-pics": "/assets/images/folder-pics-oxygen.4782ad04.webp",
  "disk-os": "/assets/images/disk-oxygen.9b235af5.webp",
  "disk-data": "/assets/images/disk-oxygen.9b235af5.webp",
  "disk-cd": "/assets/images/disk-cd-oxygen.c2083455.webp",
  "disk-connected": "/assets/images/disk-removable-oxygen.baaa39fa.webp",
  "disk-disconnected": "/assets/images/disk-removable-oxygen.baaa39fa.webp",
  "calc": "/assets/images/calc-oxygen.d1995bc6.webp",
  "cpanel": "/assets/images/cpanel-oxygen.ddd1bb31.webp",
  "notepad": "/assets/images/notepad-oxygen.9f263926.webp",
  "cmd": "/assets/images/cmd-oxygen.b7d25079.webp",
  "text": "/assets/images/text-oxygen.95901e25.webp",
  "richtext": "/assets/images/richtext-oxygen.f5743000.webp",
  "executable": "/assets/images/executable-oxygen.33e505c2.webp",
  "shortcut": "/assets/images/shortcut-oxygen.f9210347.webp",
  "media": "/assets/images/media-oxygen.1799a7a7.webp",
  "zip": "/assets/images/zip-oxygen.38e964f7.webp",
  "desktop": "/assets/images/desktop-oxygen.d7075bf2.webp",
  "logoff": "/assets/images/logoff-oxygen.051fb842.webp",
  "restart": "/assets/images/restart-oxygen.d4450a1a.webp",
  "shutdown": "/assets/images/shutdown-oxygen.62df7a25.webp"
});
function sourceOxygenIcon(key:string):string|null{
  return Object.prototype.hasOwnProperty.call(sourceOxygenIconArtwork,key)
    ?sourceOxygenIconArtwork[key as keyof typeof sourceOxygenIconArtwork]:null;
}
export function sourceThemeProgramArt(theme:string,iconKey:string):string|null{
  if(theme==="oxygen")return sourceOxygenIcon(iconKey);
  if(theme==="aeroNoir")return sourceAeroNoirIcon(iconKey);
  if(theme==="kubuntu")return sourceKubuntuIcon(iconKey);
  if(theme==="ubuntu")return sourceUbuntuIcon(iconKey);
  if(theme==="chromeos")return sourceChromeOSIcon(iconKey);
  if(theme==="macos")return sourceMacOSIcon(iconKey);
  if(theme==="win2k")return sourceWin2kProgramArtwork[iconKey]??null;
  if((theme==="win95"||theme==="win98")&&iconKey==="shutdown")
    return "/assets/images/power-win95.11d0301d.webp";
  if(theme==="win10"){
    const icons:Readonly<Record<string,string>>=legacyThemeProgramArtwork.win10;
    return icons[iconKey]??null;
  }
  if(sourceIsXpFamily(theme)){
    const icons:Readonly<Record<string,string>>=legacyThemeProgramArtwork.winxp;
    return icons[iconKey]??null;
  }
  if(theme==="win11"||theme==="win11dark"){
    const icons:Readonly<Record<string,string>>=legacyThemeProgramArtwork.win11;
    return icons[iconKey]??null;
  }
  return null;
}

/** Theme-specific notification icons present in the pinned XP image catalog.
 * Do not pretend Win11 or unsupported Volume variants have exact theme art.
 */
export function sourceThemeTrayArtwork(theme:string,trayId:string):string|null{
  const keys:Readonly<Record<string,string>>={
    TaskbarActionCenter:"action-center",
    TaskbarNetwork:"network",
    TaskbarBattery:"battery"
  };
  const iconKey=keys[trayId];
  return iconKey?sourceThemeProgramArt(theme,iconKey):null;
}

/** Exact source special-folder themed art, not for arbitrary user folders. */
export function sourceThemeSpecialFolderArt(theme:string,label:string):string|null{
  const keys:Readonly<Record<string,string>>={
    Documents:"folder-docs",Downloads:"folder-downloads",
    Pictures:"folder-pics",Music:"folder-music",Videos:"folder-videos"
  };
  return sourceThemeProgramArt(theme,keys[label]??"");
}

export const legacyXpPowerArtwork = Object.freeze({
  logoff: "/assets/images/logoff-winxp.71dc5ab2.webp",
  shutdown: "/assets/images/shutdown-winxp.f3312ea0.webp"
});
export type SourceShellArtworkKind = keyof typeof legacyShellThemeAssets.winxp;
/** Other legacy theme IDs must keep their existing original fallback artwork. */
export function sourceShellAsset(theme: string, kind: SourceShellArtworkKind): string | null {
  if(theme==="oxygen"){
    if(kind==="theme")return sourceShellWallpaper(theme);
    return sourceOxygenIcon(kind==="binFull"?"bin-full":kind);
  }
  if(theme==="aeroNoir"){
    if(kind==="theme")return sourceShellWallpaper(theme);
    return sourceAeroNoirIcon(kind==="binFull"?"bin-full":kind);
  }
  if(theme==="kubuntu"){
    if(kind==="theme")return sourceShellWallpaper(theme);
    return sourceKubuntuIcon(kind==="binFull"?"bin-full":kind);
  }
  if(theme==="ubuntu"){
    if(kind==="theme")return sourceShellWallpaper(theme);
    return sourceUbuntuIcon(kind==="binFull"?"bin-full":kind);
  }
  if(theme==="chromeos"){
    if(kind==="theme")return sourceShellWallpaper(theme);
    return sourceChromeOSIcon(kind==="binFull"?"bin-full":kind);
  }
  if(theme==="macos"){
    if(kind==="theme")return sourceShellWallpaper(theme);
    return sourceMacOSIcon(kind==="binFull"?"bin-full":kind);
  }
  // Pinned classic Start image, selected only for the new Basic 3/4 shells.
  if((theme==="basic-2"||theme==="basic-3"||theme==="basic-4")&&kind==="start")return legacyArt.win7Brand;
  if(theme==="win95"||theme==="win98")return legacyShellThemeAssets.win95[kind];
  if(theme==="win2k")return legacyShellThemeAssets.win2k[kind];
  if ((theme === "win8" || theme === "win81") && kind === "start")
    return sourceWin8ShellArtwork.start;
  if (theme === "win10") return legacyShellThemeAssets.win10[kind];
  if (sourceIsXpFamily(theme)) return legacyShellThemeAssets.winxp[kind];
  if (theme === "win11") return legacyShellThemeAssets.win11[kind];
  if (theme === "win11dark") return kind==="start"
    ?sourceWin11DarkArtwork.start:legacyShellThemeAssets.win11[kind];
  return null;
}



/** Source-pinned shared card-game art and sound used by source
 * Solitaire e202, Spider 6b74 and shared card 5ea1. These are
 * byte-identical Git blobs, not regenerated card artwork. */
export const legacyCardArtwork=Object.freeze({
  spritesheet:"/assets/images/cards-spritesheet.f136d9d3.webp",
  klondikeBackground:"/assets/images/cards-bg-klondike.85b0dfcd.webp",
  spiderBackground:"/assets/images/cards-bg-spider.48a00ea1.webp"
});
export const legacyCardAudio=Object.freeze({
  complete:"/assets/audio/cards-complete.83202212.mp3",
  drop:"/assets/audio/cards-drop.c01a1fb5.mp3",
  fireworks:"/assets/audio/cards-fireworks.6177db2d.mp3",
  home:"/assets/audio/cards-home.086a0222.mp3",
  pick:"/assets/audio/cards-pick.004c73d6.mp3",
  place:"/assets/audio/cards-place.7417fc28.mp3",
  warning:"/assets/audio/cards-warning.32db113e.mp3"
});

/** Original Tetris asset manifest, shared as a typed source mapping. */
export const legacyTetrisArtwork = Object.freeze({
  background:"/assets/images/tetris-bg.abd0ff80.webp",
  audio:{
    bgm:"/assets/audio/tetris-bgm.4e25e1ef.mp3",
    burn:"/assets/audio/tetris-burn.73862414.mp3",
    levelup:"/assets/audio/tetris-levelup.94899555.mp3",
    lock:"/assets/audio/tetris-lock.d3a08852.mp3",
    move:"/assets/audio/tetris-move.4ca1112f.mp3",
    over:"/assets/audio/tetris-over.e473e7b4.mp3",
    quad:"/assets/audio/tetris-quad.7a619527.mp3",
    rotate:"/assets/audio/tetris-rotate.b19c7c35.mp3"
  }
});

export const legacyMineAudio = Object.freeze({
  newGame:"/assets/audio/minesweeper-new.60909dd9.mp3",
  lose:"/assets/audio/minesweeper-lose.b3b70bbb.mp3"
});

export const legacyMineArtwork = Object.freeze({
  cell:"/assets/images/minesweeper-cell.a0c15d1c.webp",
  mine:"/assets/images/minesweeper-mine.cbba8bd0.webp",
  timer:"/assets/images/minesweeper-timer.663f9d44.webp"
});

/** Source Win7 icon assets for the pinned 3097 Control Panel registry.
 * Every file below was imported byte-identically from legacy-win7 at
 * LEGACY_REVISION. The source "personalize" category uses "personal" art.
 * Alternate shell themes remain separate and are NOT asserted here. */
export const legacyCpanelTileArtwork:Readonly<Record<string,string>>=Object.freeze({
  data:"/assets/images/data.7f45037b.webp",
  datetime:"/assets/images/datetime.a146b1e9.webp",
  default:"/assets/images/default.7934e9f9.webp",
  storage:"/assets/images/storage.d28402ed.webp",
  display:legacyArt.display,
  "action-center-headline":"/assets/images/action-center-headline.27cc6d83.webp",
  backup:"/assets/images/backup.5e4eb80c.webp",
  access:"/assets/images/access.564b9198.webp",
  gadgets:"/assets/images/gadgets.6b10acd8.webp",
  keyboard:"/assets/images/keyboard.5a5a435d.webp",
  mouse:"/assets/images/mouse.061c3f15.webp",
  notification:"/assets/images/notification.da3d3f8a.webp",
  personalize:"/assets/images/personal.ccbfdd3a.webp",
  power:"/assets/images/power.e9c91fa5.webp",
  programs:legacyArt.programs,
  region:"/assets/images/region.4e615968.webp",
  sound:"/assets/images/sound.fbf2cc53.webp",
  speech:"/assets/images/speech.35e2276d.webp",
  sync:"/assets/images/sync.0b44bb3c.webp",
  system:"/assets/images/system.011a8064.webp",
  taskbar:"/assets/images/taskbar.5a0a4fcb.webp",
  accounts:legacyArt.accounts,
  defender:"/assets/images/defender.cab18690.webp",
  update:"/assets/images/update.6d0c5c2f.webp"
});

/** Pinned source 4cca and 0f35 theme icon keys. Only byte-imported original
 * Win7 assets appear here. Other types retain original generic file fallback.
 */
const sourceLegacyIconMap:Readonly<Record<string,string>>={
  folder:legacyArt.folder,file:legacyArt.file,photo:legacyArt.photo,
  notepad:legacyArt.notepad,calc:legacyArt.calculator,chrome:legacyArt.chrome,
  ie:legacyArt.ie,paint:legacyArt.paint,camera:legacyArt.camera,
  player:legacyArt.player,recorder:legacyArt.recorder,
  magnifier:legacyArt.magnifier,snipping:legacyArt.snipping,
  taskmgr:legacyArt.taskmgr,sticky:legacyArt.sticky,
  run:legacyArt.run,cmd:legacyArt.cmd,computer:legacyArt.computer,
  games:legacyArt.games,chess:legacyArt.chess,mahjong:legacyArt.mahjong,
  minesweeper:legacyArt.minesweeper,purbleplace:legacyArt.purbleplace,
  solitaire:legacyArt.solitaire,spidersolitaire:legacyArt.spidersolitaire,
  tetris:legacyArt.tetris,
  cpanel:legacyArt.cpanel,display:legacyArt.display,
  programs:legacyArt.programs,accounts:legacyArt.accounts,
  ...legacyCpanelTileArtwork
};
export interface LegacySourceIconArtwork{
  src:string;
  exactSourceArtwork:boolean;
}
/** Original 0f35.c supports remote and data URLs. Block script schemes. */
export function legacySourceCustomIconURL(icon:string):string|null{
  if(/^https?:\/\//i.test(icon))return icon;
  if(/^data:image\/(?:png|jpeg|gif|webp|bmp|svg\+xml|avif);base64,[a-z0-9+/]+={0,2}$/i.test(icon))
    return icon;
  return null;
}
export function legacySourceIconArtwork(iconKey:string):LegacySourceIconArtwork{
  const custom=legacySourceCustomIconURL(iconKey);
  if(custom)return {src:custom,exactSourceArtwork:false};
  const imported=Object.prototype.hasOwnProperty.call(sourceLegacyIconMap,iconKey)
    ?sourceLegacyIconMap[iconKey]:undefined;
  return {src:imported??legacyArt.file,exactSourceArtwork:imported!==undefined};
}

/** Shared original 4cca + 0f35 icon selection for Desktop and Explorer.
 * Keep the per-shortcut JSON override; missing themed image types are fallbacks.
 */
export function sourceThemeFileIconArtwork(
  theme:string,sourceType:string,shortcutIcon?:string|null
):LegacySourceIconArtwork{
  const key=shortcutIcon??sourceType;
  const themed=sourceThemeProgramArt(theme,key);
  if(themed)return {src:themed,exactSourceArtwork:true};
  const original=legacySourceIconArtwork(key);
  const generic=sourceShellAsset(theme,
    sourceType==="folder"&&!shortcutIcon?"folder":"file");
  if(shortcutIcon&&original.exactSourceArtwork&&key!=="file")return original;
  if(sourceType==="folder"&&!shortcutIcon&&generic)
    return {src:generic,exactSourceArtwork:true};
  if((key==="file"||(!original.exactSourceArtwork&&original.src===legacyArt.file))
    &&generic)return {src:generic,exactSourceArtwork:key==="file"};
  return original;
}

