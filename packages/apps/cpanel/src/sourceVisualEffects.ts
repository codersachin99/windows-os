/** Pinned legacy-win7/src/modules/shell/system.js SystemPerformance:
 * Visual Effects preset = auto|appearance|performance|custom. The original
 * Vuex effect keys enableGlass/showWindowShadows/animateTaskbar gate Aero theme CSS.
 * This narrow Guest adapter persists only those implemented effects; old v1 records are migrated on read.
 */
export const SOURCE_VISUAL_EFFECTS_KEY="windows-os:guest:visual-effects:v1";
export type SourceVisualEffectsPreset="auto"|"appearance"|"performance"|"custom";
export interface SourceVisualEffects{
  preset:SourceVisualEffectsPreset;
  enableGlass:boolean;
  showWindowShadows:boolean;
  animateTaskbar:boolean;
}
export const SOURCE_DEFAULT_VISUAL_EFFECTS:Readonly<SourceVisualEffects>=Object.freeze({
  preset:"auto",enableGlass:true,showWindowShadows:true,animateTaskbar:true
});
export function sourceVisualEffectsPreset(
  previous:SourceVisualEffects,preset:SourceVisualEffectsPreset
):SourceVisualEffects{
  switch(preset){
    case "appearance":return {preset,enableGlass:true,showWindowShadows:true,animateTaskbar:true};
    case "performance":return {preset,enableGlass:false,showWindowShadows:false,animateTaskbar:false};
    case "auto":return {...SOURCE_DEFAULT_VISUAL_EFFECTS};
    case "custom":return {...previous,preset:"custom"};
  }
}
export function sourceVisualEffectsToggle(
  previous:SourceVisualEffects,key:"enableGlass"|"showWindowShadows"|"animateTaskbar",
  checked:boolean
):SourceVisualEffects{
  return {...previous,[key]:checked,preset:"custom"};
}
export function sourceVisualEffectsRead(
  storage:Pick<Storage,"getItem">|undefined
):SourceVisualEffects{
  try{
    const raw=storage?.getItem(SOURCE_VISUAL_EFFECTS_KEY);
    if(!raw)return {...SOURCE_DEFAULT_VISUAL_EFFECTS};
    const value:unknown=JSON.parse(raw);
    if(!value||typeof value!=="object"||Array.isArray(value))
      return {...SOURCE_DEFAULT_VISUAL_EFFECTS};
    const record=value as Record<string,unknown>;
    const preset=record.preset;
    if(preset!=="auto"&&preset!=="appearance"&&preset!=="performance"&&
      preset!=="custom")return {...SOURCE_DEFAULT_VISUAL_EFFECTS};
    if(typeof record.enableGlass!=="boolean"||
      typeof record.showWindowShadows!=="boolean"||
      (record.animateTaskbar!==undefined&&typeof record.animateTaskbar!=="boolean"))
      return {...SOURCE_DEFAULT_VISUAL_EFFECTS};
    return {
      preset,
      enableGlass:record.enableGlass,
      showWindowShadows:record.showWindowShadows,
      animateTaskbar:typeof record.animateTaskbar==="boolean"?record.animateTaskbar:preset!=="performance"
    };
  }catch{return {...SOURCE_DEFAULT_VISUAL_EFFECTS};}
}
export function sourceVisualEffectsSave(
  storage:Pick<Storage,"setItem">|undefined,
  effects:SourceVisualEffects
):boolean{
  try{
    storage?.setItem(SOURCE_VISUAL_EFFECTS_KEY,JSON.stringify({
      preset:effects.preset,enableGlass:effects.enableGlass,
      showWindowShadows:effects.showWindowShadows,
      animateTaskbar:effects.animateTaskbar
    }));
    return Boolean(storage);
  }catch{return false;}
}
