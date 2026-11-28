import type {ThemeId} from "@windows-os/contracts";
import {legacyArt,legacyShellThemeAssets,sourceSystemWallpapers,sourceWin8ShellArtwork,sourceWin11DarkArtwork,sourceShellWallpaper} from "@windows-os/assets";

/** Pinned source built-in theme registry (webpack 3b8c and 2299).
 * Exact original names, source Aero palettes, solid Basic background
 * colors and immutable original image assets. Original _getThemes("aero")
 * contains four cards; the "base" theme is excluded from the gallery.
 * The canonical win7 direct route remains supported outside the gallery.
 * Rendering these cards still does not mean full source visual parity.
 */
export type SourcePersonalizeThemeId=Exclude<ThemeId,"base"|"win7">;
export interface SourcePersonalizeTheme{
  id:SourcePersonalizeThemeId;
  label:string;
  group:"aero"|"basic"|"wins"|"others";
  preview:string;
}
export const SOURCE_PERSONALIZE_THEMES:readonly SourcePersonalizeTheme[]=[
  {id:"aero-1",label:"Windows 7",group:"aero",preview:legacyArt.wallpaperWin7},
  {id:"aero-2",label:"Architecture",group:"aero",preview:legacyArt.wallpaperArchitecture},
  {id:"aero-3",label:"Landscape",group:"aero",preview:legacyArt.wallpaperLandscape},
  {id:"aero-4",label:"Nature",group:"aero",preview:legacyArt.wallpaperNature},
  {id:"basic-1",label:"Windows 7 Basic",group:"basic",preview:legacyArt.wallpaperWin7},
  {id:"basic-2",label:"Windows Classic",group:"basic",preview:"#3b6ea4"},
  {id:"basic-3",label:"High Contrast Black",group:"basic",preview:"#000"},
  {id:"basic-4",label:"High Contrast White",group:"basic",preview:"#fff"},
  {id:"win31",label:"Windows 3.1",group:"wins",preview:sourceShellWallpaper("win31")},
  {id:"win95",label:"Windows 95",group:"wins",preview:sourceShellWallpaper("win95")},
  {id:"win98",label:"Windows 98",group:"wins",preview:sourceShellWallpaper("win98")},
  {id:"win2k",label:"Windows 2000",group:"wins",preview:sourceShellWallpaper("win2k")},
  {id:"winxp",label:"Windows XP",group:"wins",preview:legacyShellThemeAssets.winxp.theme},
  {id:"winxpE",label:"Windows XP (E)",group:"wins",preview:legacyShellThemeAssets.winxp.theme},
  {id:"winxpG",label:"Windows XP (G)",group:"wins",preview:sourceShellWallpaper("winxpG")},
  {id:"winxpN",label:"Windows XP (N)",group:"wins",preview:legacyShellThemeAssets.winxp.theme},
  {id:"winxpR",label:"Windows XP (R)",group:"wins",preview:sourceShellWallpaper("winxpR")},
  {id:"winxpS",label:"Windows XP (S)",group:"wins",preview:sourceShellWallpaper("winxpS")},
  {id:"winxpZ",label:"Windows XP (Z)",group:"wins",preview:sourceShellWallpaper("winxpZ")},
  {id:"winvista",label:"Windows Vista",group:"wins",preview:sourceShellWallpaper("winvista")},
  {id:"win8",label:"Windows 8",group:"wins",preview:sourceWin8ShellArtwork.win8Wallpaper},
  {id:"win81",label:"Windows 8.1",group:"wins",preview:sourceWin8ShellArtwork.win81Wallpaper},
  {id:"win10",label:"Windows 10",group:"wins",preview:legacyShellThemeAssets.win10.theme},
  {id:"win11",label:"Windows 11",group:"wins",preview:legacyShellThemeAssets.win11.theme},
  {id:"win11dark",label:"Windows 11 Dark",group:"wins",preview:sourceWin11DarkArtwork.wallpaper},
  {id:"macos",label:"macOS",group:"others",preview:sourceShellWallpaper("macos")},
  {id:"chromeos",label:"ChromeOS",group:"others",preview:sourceShellWallpaper("chromeos")},
  {id:"ubuntu",label:"Ubuntu",group:"others",preview:sourceShellWallpaper("ubuntu")},
  {id:"kubuntu",label:"Kubuntu",group:"others",preview:sourceShellWallpaper("kubuntu")},
  {id:"winLS",label:"Windows Longhorn (Slate)",group:"others",preview:sourceShellWallpaper("winLS")},
  {id:"winLP",label:"Windows Longhorn (Plex)",group:"others",preview:sourceShellWallpaper("winLP")},
  {id:"aeroNoir",label:"Aero Noir",group:"others",preview:sourceShellWallpaper("aeroNoir")},
  {id:"oxygen",label:"Oxygen",group:"others",preview:sourceShellWallpaper("oxygen")},
  {id:"winW",label:"Windows Whistler",group:"others",preview:sourceShellWallpaper("winW")},
  {id:"onebit",label:"Onebit",group:"others",preview:sourceShellWallpaper("onebit")}
] as const;
export function sourcePersonalizeGroup(group:SourcePersonalizeTheme["group"]):SourcePersonalizeTheme[]{
  return SOURCE_PERSONALIZE_THEMES.filter(theme=>theme.group===group);
}

/** Original ChangeBackground reads assetStore.bgs. This subset consists only
 * of the pinned system backgrounds already imported into React as real bytes.
 * Uploaded images/videos and animated sources require their own adapters. */
export const SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS:readonly string[]=sourceSystemWallpapers;
