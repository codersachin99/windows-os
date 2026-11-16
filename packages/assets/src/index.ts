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
  // Byte-identical pinned original Windows 7 Command Prompt artwork.
  cmd: "/assets/images/cmd.a2c1d19b.webp",
  // Byte-identical pinned Win7 Control Panel and Display page artwork.
  cpanel: "/assets/images/cpanel.38ffbb1d.webp",
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
