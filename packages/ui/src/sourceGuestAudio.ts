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

/** Win31/95/98/2000 registry: one unmuted speaker and a separate mute image. */
export function sourceRetroVolumeArt(audio:SourceGuestAudio):string{
  return "/assets/images/"+(audio.muted?"sound-muted-win2k.c4df5325.png":"sound-win2k.6b4cee4c.webp");
}

/** Onebit registry: volume 0 and 32 share the same glyph. */
export function sourceOnebitVolumeArt(audio:SourceGuestAudio):string{
  const value=sourceGuestVolume(audio.volume);
  return "/assets/images/"+(audio.muted?"volume-off-onebit.61d24fcf.svg":value<65?"volume-0-onebit.44ebf44b.svg":value<100?"volume-1-onebit.629e30d3.svg":"volume-onebit.33ed49b4.svg");
}
