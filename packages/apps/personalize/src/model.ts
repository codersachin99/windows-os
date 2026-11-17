import type {ThemeId} from "@windows-os/contracts";
import {legacyArt,legacyShellThemeAssets,sourceSystemWallpapers} from "@windows-os/assets";

/** Original pinned personalize.js ChangeTheme, _getThemes:
 * classes aero/basic/wins, theme selection immediately applies Theme and
 * source theme background. This first slice limits the chooser to the three
 * implemented shell themes. Other source categories and settings are pending.
 */
export type SourcePersonalizeThemeId=Extract<ThemeId,"win7"|"winxp"|"win11">;
export interface SourcePersonalizeTheme{
  id:SourcePersonalizeThemeId;
  label:string;
  group:"aero"|"wins";
  preview:string;
}
export const SOURCE_PERSONALIZE_THEMES:readonly SourcePersonalizeTheme[]=[
  {id:"win7",label:"Windows 7",group:"aero",preview:legacyArt.wallpaperWin7},
  {id:"winxp",label:"Windows XP",group:"wins",preview:legacyShellThemeAssets.winxp.theme},
  {id:"win11",label:"Windows 11",group:"wins",preview:legacyShellThemeAssets.win11.theme}
] as const;
export function sourcePersonalizeGroup(group:SourcePersonalizeTheme["group"]):SourcePersonalizeTheme[]{
  return SOURCE_PERSONALIZE_THEMES.filter(theme=>theme.group===group);
}

/** Original ChangeBackground reads assetStore.bgs. This subset consists only
 * of the pinned system backgrounds already imported into React as real bytes.
 * Uploaded images/videos and animated sources require their own adapters. */
export const SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS:readonly string[]=sourceSystemWallpapers;
