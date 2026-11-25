/** Pinned f0ed/e0ee icon rules and icons.registry.json inheritance.
 * The Guest notification store may report info/success; the frozen registry
 * only provides error/warning variants, so keep the normal flag otherwise. */
const image=(name:string)=>"/assets/images/"+name;
export function sourceActionCenterArt(severity:string|undefined,xpArtwork=false,onebitArtwork=false):string{
  if(severity==="error"||severity==="warning"){
    if(onebitArtwork)return image("action-center-base.d153243a.svg");
    return image(severity==="error"?"action-center-error.e8a7e681.webp":"action-center-warning.fc9ed53b.webp");
  }
  return image(onebitArtwork?"action-center-onebit.1bd0c609.svg":xpArtwork?"action-center-winxp.52f44912.webp":"action-center.4d8b33c7.webp");
}
export function sourceNetworkUsesVector(theme:string):boolean{
  return /win10|^win11|macos/.test(theme);
}
export function sourceNetworkTrayArt(online:boolean,xpArtwork=false,retroArtwork=false,onebitArtwork=false):string{
  if(onebitArtwork)return image(online?"network-onebit.bc98df3e.svg":"network-off-onebit.a9393cd6.svg");
  if(retroArtwork)return image(online?"network-win2k.798c0454.png":"network-off-win2k.a6d55774.png");
  if(xpArtwork)return image(online?"network-winxp.744648d4.webp":"network-off-winxp.60414007.webp");
  return image(online?"network.21b75845.webp":"network-off.2d8dfd51.webp");
}
export function sourceNetworkConnectionArt(online:boolean,type:string,xpArtwork=false,retroArtwork=false,onebitArtwork=false):string{
  if(!online)return sourceNetworkTrayArt(false,xpArtwork,retroArtwork,onebitArtwork);
  if(onebitArtwork)return image("network-onebit.bc98df3e.svg");
  // Only Onebit overrides signal/wired; XP/2000 override the tray icon and offline image.
  return image(/wifi|cellular/.test(type)?"network-signal.4305a101.webp":"network-wired.c19a6640.webp");
}

export {sourceNotificationArt} from "@windows-os/assets";

/** f0ed resolves action-center-headline[-severity] directly. The pinned
 * registry has no severity headline variants. Do not substitute tray artwork. */
export function sourceActionCenterHeadlineArt(severity:"error"|"warning"|undefined,onebitArtwork=false):string|undefined{
  if(severity)return undefined;
  return image(onebitArtwork?"action-center-onebit.1bd0c609.svg":"action-center-headline.27cc6d83.webp");
}
