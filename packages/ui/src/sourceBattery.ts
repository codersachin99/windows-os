/** Source a88c: display filter range and the two radio presets. */
export function sourceBrightness(value:number):number{
  return Number.isFinite(value)?Math.max(.6,Math.min(1.2,Math.round(value*10)/10)):1;
}
export function sourceBatteryPercent(level:number):number|null{
  return Number.isFinite(level)&&level>=0&&level<=1?Math.round(level*100):null;
}

/** Original a88c sprite frames use the raw measured fraction, not rounded percent. */
export function sourceBatteryMeterOffset(level:number):number|null{
  if(sourceBatteryPercent(level)===null)return null;
  return -32*(level<.1?20:level<.2?11:Math.round(9*level));
}
