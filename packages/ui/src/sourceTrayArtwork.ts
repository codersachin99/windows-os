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

/** f0ed: themeData.icon["notifi-"+type]. Guest info has no registry icon. */
const notificationArt={
  base:{error:"notifi-error.362aae4b.webp",success:"notifi-success.9bd6d775.webp",warning:"notifi-warning.44f565cf.webp"},
  retro:{error:"error-win2k.ceba73c0.png",success:"success-win2k.7b281bfb.png",warning:"warning-win2k.333f629e.png"},
  modern:{error:"notifi-error-win10.956ad576.webp",success:"notifi-success-win10.5fdfecb5.webp",warning:"notifi-warning-win10.e1a2a370.webp"},
  onebit:{error:"close-onebit.a1490e2c.svg",success:"check-onebit.35be58dd.svg",warning:"alert-onebit.809dcd0e.svg"}
} as const;
export function sourceNotificationArt(theme:string,type:string):string|undefined{
  if(type!=="error"&&type!=="success"&&type!=="warning")return undefined;
  const family=theme==="onebit"?"onebit":
    ["win31","win95","win98","win2k"].includes(theme)?"retro":
    ["win10","win11","win11dark","macos","chromeos","ubuntu","kubuntu"].includes(theme)?"modern":"base";
  return image(notificationArt[family][type]);
}
