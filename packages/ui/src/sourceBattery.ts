/** Source a88c: display filter range and the two radio presets. */
export function sourceBrightness(value:number):number{
  return Number.isFinite(value)?Math.max(.6,Math.min(1.2,Math.round(value*10)/10)):1;
}
export function sourceBatteryPercent(level:number):number|null{
  return Number.isFinite(level)&&level>=0&&level<=1?Math.round(level*100):null;
}
