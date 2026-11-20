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
/** Pinned shared source webpack 2299: exact 32 ChangeAppearance colors. */
export const SOURCE_AERO_COLORS:readonly string[]=[
  "#aad1fb","#5986ca","#61d4d7","#6bc35b","#b3e165","#fcec8a",
  "#f0b85b","#d35352","#fb83cb","#fbd7f9","#9f81bf","#d9c8db",
  "#cbc2a5","#8c6a6b","#ababab","#e9e9e9","#ffb900","#f7630c",
  "#da3b01","#d13438","#e74856","#ea005e","#e3008c","#c239b3",
  "#0078d7","#8e8cd8","#8764b8","#b146c2","#0099bc","#00b7c3",
  "#00b294","#00cc6a"
] as const;
export interface SourceAeroAppearance{
  color:string|null;
  transparent:boolean;
}
export const SOURCE_AERO_APPEARANCE_KEY="windows-os:guest:aero-appearance:v1";
export const SOURCE_DEFAULT_AERO_APPEARANCE:Readonly<SourceAeroAppearance>=
  Object.freeze({color:null,transparent:true});
export function sourceAeroAppearanceValid(value:SourceAeroAppearance):boolean{
  return (value.color===null||SOURCE_AERO_COLORS.includes(value.color))&&
    typeof value.transparent==="boolean";
}
export function sourceAeroAppearanceRead(
  storage:Pick<Storage,"getItem">|undefined
):SourceAeroAppearance{
  try{
    const raw=storage?.getItem(SOURCE_AERO_APPEARANCE_KEY);
    if(!raw)return {...SOURCE_DEFAULT_AERO_APPEARANCE};
    const value:unknown=JSON.parse(raw);
    if(!value||typeof value!=="object"||Array.isArray(value))
      return {...SOURCE_DEFAULT_AERO_APPEARANCE};
    const fields=value as Record<string,unknown>;
    if((fields.color!==null&&(typeof fields.color!=="string"||
      !SOURCE_AERO_COLORS.includes(fields.color)))||
      typeof fields.transparent!=="boolean")
      return {...SOURCE_DEFAULT_AERO_APPEARANCE};
    return {color:fields.color as string|null,transparent:fields.transparent};
  }catch{return {...SOURCE_DEFAULT_AERO_APPEARANCE};}
}
export function sourceAeroAppearanceSave(
  storage:Pick<Storage,"setItem">|undefined,value:SourceAeroAppearance
):boolean{
  if(!sourceAeroAppearanceValid(value))return false;
  try{
    storage?.setItem(SOURCE_AERO_APPEARANCE_KEY,JSON.stringify(value));
    return Boolean(storage);
  }catch{return false;}
}
/** Pinned plugin-cssvar gates Aero translucency on the source theme's
 * transparent flag, the saved setting and the Performance enableGlass
 * effect. Original active/idle alpha is 0.65/0.3 when both are enabled. */
export function sourceWin7ThemeChromeColors(
  theme:string,appearance:SourceAeroAppearance=SOURCE_DEFAULT_AERO_APPEARANCE,
  enableGlass=true
):{active:string;inactive:string|null}|null{
  const value=sourceWin7VariantMetadata(theme);
  if(!value?.color)return null;
  if(!value.transparent)return {active:value.color,inactive:null};
  const hex=appearance.color!==null&&SOURCE_AERO_COLORS.includes(appearance.color)
    ?appearance.color:value.color;
  if(!appearance.transparent||!enableGlass)
    return {active:hex,inactive:hex};
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),
    b=parseInt(hex.slice(5,7),16);
  return {
    active:`rgba(${r}, ${g}, ${b}, 0.65)`,
    inactive:`rgba(${r}, ${g}, ${b}, 0.3)`
  };
}
