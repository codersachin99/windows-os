/**
 * Exact defaults.themeScreens from the immutable final source:
 * codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * app.config.json. Keep source theme identifiers/casing unchanged.
 *
 * The catalog is not a declaration that every visual theme has migrated.
 * The UI accepts test-mode IDs to aid per-theme migration, while unsupported
 * shell skins continue to use the existing Win7 fallback until faithfully
 * rebuilt with source components, styles and byte-identical assets.
 */
export const SOURCE_THEME_SCREENS={
  "base": {
    "boot": "win7",
    "logon": "win7"
  },
  "aero-1": {
    "boot": "win7",
    "logon": "win7"
  },
  "aero-2": {
    "boot": "win7",
    "logon": "win7"
  },
  "aero-3": {
    "boot": "win7",
    "logon": "win7"
  },
  "aero-4": {
    "boot": "win7",
    "logon": "win7"
  },
  "basic-1": {
    "boot": "win7",
    "logon": "win7"
  },
  "basic-2": {
    "boot": "win7",
    "logon": "win7"
  },
  "basic-3": {
    "boot": "win7",
    "logon": "win7"
  },
  "basic-4": {
    "boot": "win7",
    "logon": "win7"
  },
  "win31": {
    "boot": "win31",
    "logon": "win31"
  },
  "win95": {
    "boot": "win95",
    "logon": "win95"
  },
  "win98": {
    "boot": "win98",
    "logon": "win98"
  },
  "win2k": {
    "boot": "win2k",
    "logon": "win2k"
  },
  "winxp": {
    "boot": "winxp",
    "logon": "winxp"
  },
  "winxpE": {
    "boot": "winxp",
    "logon": "winxp"
  },
  "winxpG": {
    "boot": "winxp",
    "logon": "winxp"
  },
  "winxpN": {
    "boot": "winxp",
    "logon": "winxp"
  },
  "winxpR": {
    "boot": "winxp",
    "logon": "winxp"
  },
  "winxpS": {
    "boot": "winxp",
    "logon": "winxp"
  },
  "winxpZ": {
    "boot": "winxp",
    "logon": "winxp"
  },
  "winvista": {
    "boot": "winvista",
    "logon": "winvista"
  },
  "win8": {
    "boot": "win8",
    "logon": "win8"
  },
  "win81": {
    "boot": "win8",
    "logon": "win8"
  },
  "win10": {
    "boot": "win10",
    "logon": "win10"
  },
  "win11": {
    "boot": "win11",
    "logon": "win11"
  },
  "win11dark": {
    "boot": "win11",
    "logon": "win11"
  },
  "macos": {
    "boot": "macos",
    "logon": "macos"
  },
  "chromeos": {
    "boot": "chromeos",
    "logon": "chromeos"
  },
  "ubuntu": {
    "boot": "ubuntu",
    "logon": "ubuntu"
  },
  "kubuntu": {
    "boot": "kubuntu",
    "logon": "kubuntu"
  },
  "winLS": {
    "boot": "winLS",
    "logon": "winLS"
  },
  "winLP": {
    "boot": "winLS",
    "logon": "winLS"
  },
  "aeroNoir": {
    "boot": "aeroNoir",
    "logon": "aeroNoir"
  },
  "oxygen": {
    "boot": "oxygen",
    "logon": "oxygen"
  },
  "winW": {
    "boot": "winW",
    "logon": "winW"
  },
  "onebit": {
    "boot": "onebit",
    "logon": "onebit"
  }
} as const;
export type SourceThemeConfigId=keyof typeof SOURCE_THEME_SCREENS;
/** Original Win7 is the canonical shell ID; config uses "base" for its
 * source boot and logon mapping. */
export type SourceThemeId=SourceThemeConfigId|"win7";
export type SourceThemeScreenId=(typeof SOURCE_THEME_SCREENS)[SourceThemeConfigId]["logon"]|"win7";
export interface SourceThemeScreens{
  readonly boot:SourceThemeScreenId;
  readonly logon:SourceThemeScreenId;
}
export const SOURCE_THEME_SCREEN_DEFAULTS:SourceThemeScreens=
  Object.freeze({boot:"win7",logon:"win7"});
export const SOURCE_THEME_CATALOG_IDS:readonly SourceThemeId[]=
  Object.freeze(["win7",...Object.keys(SOURCE_THEME_SCREENS)] as SourceThemeId[]);
/** Four source Aero IDs share Win7 renderer family/window chrome.
 * Their individual original palette/wallpaper associations are still pending.
 */
export const SOURCE_AERO_THEME_IDS=Object.freeze([
  "aero-1","aero-2","aero-3","aero-4"
] as const);
export function sourceIsAeroFamily(theme:string):boolean{
  return (SOURCE_AERO_THEME_IDS as readonly string[]).includes(theme);
}
/** All seven exact XP theme IDs share the original XP shell family,
 * with individual colors defined by theme-winxp-scss.js. */
export const SOURCE_XP_THEME_IDS=Object.freeze([
  "winxp","winxpE","winxpG","winxpN","winxpR","winxpS","winxpZ"
] as const);
export function sourceIsXpFamily(theme:string):boolean{
  return (SOURCE_XP_THEME_IDS as readonly string[]).includes(theme);
}
export function sourceIsKnownTheme(id:string):id is SourceThemeId{
  return id==="win7"||Object.prototype.hasOwnProperty.call(SOURCE_THEME_SCREENS,id);
}
/** Exact source profile mapping, with a safe Win7 compatibility fallback.
 * No untrusted theme string can be used as a file path or dynamic import. */
export function sourceThemeScreens(theme:string):SourceThemeScreens{
  return sourceIsKnownTheme(theme)&&theme!=="win7"
    ?SOURCE_THEME_SCREENS[theme]:SOURCE_THEME_SCREEN_DEFAULTS;
}
/** Indicates shell implementation scope, not theme catalog membership.
 * Twenty-six themes now have partial source-backed shell adaptations;
 * partial never means pixel-perfect, and login-only families remain pending. */
export function sourceThemeShellStatus(theme:string):"partial"|"pending"{
  return sourceIsAeroFamily(theme)||theme==="basic-1"||theme==="basic-2"||theme==="basic-3"||theme==="basic-4"||theme==="win31"||theme==="win95"||theme==="win98"||theme==="win2k"
    ||theme==="win7"||sourceIsXpFamily(theme)||theme==="win8"
    ||theme==="win81"||theme==="winvista"||theme==="win10"||theme==="win11"||theme==="win11dark"
    ?"partial":"pending";
}
