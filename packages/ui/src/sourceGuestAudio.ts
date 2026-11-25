/** Source c561 volume artwork thresholds and Guest mixer state. */
export type SourceGuestAudio={volume:number;muted:boolean};
export const SOURCE_GUEST_AUDIO_INITIAL:SourceGuestAudio={volume:100,muted:false};
export function sourceGuestVolume(value:number):number{
  return Number.isFinite(value)?Math.max(0,Math.min(100,Math.round(value))):100;
}
const artwork={
  "0":"volume-0-win10.319871af.webp",
  "32":"volume-32-win10.0c0304cf.webp",
  "65":"volume-65-win10.fcea34a7.webp",
  "100":"volume-100-win10.5647dfdd.webp",
  muted:"volume-muted-win10.9bff41dd.webp"
} as const;
export function sourceMacOSVolumeArt(audio:SourceGuestAudio):string{
  const volume=sourceGuestVolume(audio.volume);
  const key=audio.muted?"muted":volume<32?"0":volume<65?"32":volume<100?"65":"100";
  return "/assets/images/"+artwork[key];
}

/** XP registry maps all unmuted thresholds to the same source speaker. */
export function sourceXPVolumeArt(audio:SourceGuestAudio):string{
  return "/assets/images/"+(audio.muted?"volume-muted-winxp.70d8b244.webp":"sound-winxp.1ff35c0e.webp");
}
