import type {ThemeId} from "@windows-os/contracts";
import {legacyArt,legacyShellThemeAssets,sourceSystemWallpapers,sourceWin8ShellArtwork,sourceWin11DarkArtwork} from "@windows-os/assets";

/** Original pinned personalize.js ChangeTheme, _getThemes:
 * classes aero/basic/wins, theme selection immediately applies Theme and
 * source theme background. This bounded chooser exposes ten source-backed
 * shell personalities, not the entire source catalog or complete parity.
 */
export type SourcePersonalizeThemeId=Extract<ThemeId,"win7"|"win95"|"win98"|"win2k"|"winxp"|"win8"|"win81"|"win10"|"win11"|"win11dark">;
export interface SourcePersonalizeTheme{
  id:SourcePersonalizeThemeId;
  label:string;
  group:"aero"|"wins";
  preview:string;
}
export const SOURCE_PERSONALIZE_THEMES:readonly SourcePersonalizeTheme[]=[
  {id:"win7",label:"Windows 7",group:"aero",preview:legacyArt.wallpaperWin7},
  {id:"win95",label:"Windows 95",group:"wins",preview:legacyShellThemeAssets.win95.theme},
  {id:"win98",label:"Windows 98",group:"wins",preview:legacyShellThemeAssets.win95.theme},
  {id:"win2k",label:"Windows 2000",group:"wins",preview:legacyShellThemeAssets.win2k.theme},
  {id:"winxp",label:"Windows XP",group:"wins",preview:legacyShellThemeAssets.winxp.theme},
  {id:"win8",label:"Windows 8",group:"wins",preview:sourceWin8ShellArtwork.win8Wallpaper},
  {id:"win81",label:"Windows 8.1",group:"wins",preview:sourceWin8ShellArtwork.win81Wallpaper},
  {id:"win10",label:"Windows 10",group:"wins",preview:legacyShellThemeAssets.win10.theme},
  {id:"win11",label:"Windows 11",group:"wins",preview:legacyShellThemeAssets.win11.theme},
  {id:"win11dark",label:"Windows 11 Dark",group:"wins",preview:sourceWin11DarkArtwork.wallpaper}
] as const;
export function sourcePersonalizeGroup(group:SourcePersonalizeTheme["group"]):SourcePersonalizeTheme[]{
  return SOURCE_PERSONALIZE_THEMES.filter(theme=>theme.group===group);
}

/** Original ChangeBackground reads assetStore.bgs. This subset consists only
 * of the pinned system backgrounds already imported into React as real bytes.
 * Uploaded images/videos and animated sources require their own adapters. */
export const SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS:readonly string[]=sourceSystemWallpapers;
