/** Locked final original legacy-win7 source at
 * 26b9f0ce7a1665dee89a7c81824bec09e2c75776.
 * src/modules/chunks/shared~plugin-cssvar~sandbox~vue-app~vue-store.js:
 * webpack 3b8c (built-in theme registry) and 2299 (palette).
 * Original system/personalize.js module 5e9f maps selected ID -> color.
 * Sound and iconPack values remain metadata until those runtimes migrate. */
export const SOURCE_WIN7_THEME_METADATA={
  "aero-1":{name:"Windows 7",category:"aero",background:null,
    color:"#aad1fb",transparent:true,sound:"Windows Default",iconPack:null},
  "aero-2":{name:"Architecture",category:"aero",background:"architecture",
    color:"#5986ca",transparent:true,sound:"Cityscape",iconPack:null},
  "aero-3":{name:"Landscape",category:"aero",background:"landscape",
    color:"#ababab",transparent:true,sound:"Landscape",iconPack:null},
  "aero-4":{name:"Nature",category:"aero",background:"nature",
    color:"#9f81bf",transparent:true,sound:"Garden",iconPack:null},
  "basic-1":{name:"Windows 7 Basic",category:"basic",background:null,
    color:"#a7c0dc",transparent:false,sound:"Windows Default",iconPack:null},
  "basic-2":{name:"Windows Classic",category:"basic",background:"#3b6ea4",
    color:null,transparent:false,sound:"Windows Default",iconPack:"win7classic"},
  "basic-3":{name:"High Contrast Black",category:"basic",background:"#000",
    color:null,transparent:false,sound:"Windows Default",iconPack:"win7classic"},
  "basic-4":{name:"High Contrast White",category:"basic",background:"#fff",
    color:null,transparent:false,sound:"Windows Default",iconPack:"win7classic"}
} as const;
export type SourceWin7VariantId=keyof typeof SOURCE_WIN7_THEME_METADATA;
export function sourceWin7VariantMetadata(theme:string):
  (typeof SOURCE_WIN7_THEME_METADATA)[SourceWin7VariantId]|null{
  return Object.prototype.hasOwnProperty.call(SOURCE_WIN7_THEME_METADATA,theme)
    ?SOURCE_WIN7_THEME_METADATA[theme as SourceWin7VariantId]:null;
}
export function sourceWin7ThemeColor(theme:string):string|null{
  return sourceWin7VariantMetadata(theme)?.color??null;
}
/** Original Aero CSS plugin uses 0.65 active / 0.3 inactive
 * alpha when transparency is enabled; Basic 1 remains opaque.
 * The user-facing transparency toggle remains a later task. */
export function sourceWin7ThemeChromeColors(theme:string):
  {active:string;inactive:string|null}|null{
  const value=sourceWin7VariantMetadata(theme);
  if(!value?.color)return null;
  if(!value.transparent)return {active:value.color,inactive:null};
  const hex=value.color;
  const r=parseInt(hex.slice(1,3),16),
    g=parseInt(hex.slice(3,5),16),
    b=parseInt(hex.slice(5,7),16);
  return {
    active:`rgba(${r}, ${g}, ${b}, 0.65)`,
    inactive:`rgba(${r}, ${g}, ${b}, 0.3)`
  };
}
