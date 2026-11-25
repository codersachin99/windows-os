import {expect,it} from "vitest";
import {sourceActionCenterArt,sourceNetworkUsesVector,sourceNetworkTrayArt,sourceNetworkConnectionArt,sourceNotificationArt} from "./sourceTrayArtwork";
it("selects source Action Center severity and inherited icon overrides",()=>{
  expect(sourceActionCenterArt(undefined)).toContain("action-center.4d8b33c7");
  expect(sourceActionCenterArt("info",true)).toContain("action-center-winxp.");
  expect(sourceActionCenterArt("success",false,true)).toContain("action-center-onebit.");
  expect(sourceActionCenterArt("warning",true)).toContain("action-center-warning.");
  expect(sourceActionCenterArt("error")).toContain("action-center-error.");
  for(const severity of ["warning","error"])expect(sourceActionCenterArt(severity,false,true)).toContain("action-center-base.");
});
it("distinguishes source tray glyphs from inherited connection artwork",()=>{
  for(const theme of ["win10","win11","win11dark","macos"])expect(sourceNetworkUsesVector(theme)).toBe(true);
  for(const theme of ["ubuntu","win8","chromeos","win7","onebit"])expect(sourceNetworkUsesVector(theme)).toBe(false);
  expect(sourceNetworkTrayArt(true,true,true)).toContain("network-win2k.");
  expect(sourceNetworkConnectionArt(true,"wifi",true,true)).toContain("network-signal.");
  expect(sourceNetworkConnectionArt(true,"cellular",true)).toContain("network-signal.");
  expect(sourceNetworkConnectionArt(true,"unknown",true)).toContain("network-wired.");
  expect(sourceNetworkConnectionArt(false,"wifi",true,true)).toContain("network-off-win2k.");
  expect(sourceNetworkConnectionArt(false,"wifi",true)).toContain("network-off-winxp.");
  expect(sourceNetworkConnectionArt(true,"unknown",false,false,true)).toContain("network-onebit.");
});

it("resolves all three original notification types in each icon family",()=>{
  const cases=[
    {themes:["win7","aero-1","basic-2","winvista","win8","win81","winxp","winxpZ","winW","winLP","winLS","oxygen","aeroNoir"],files:["notifi-error.362aae4b.webp","notifi-success.9bd6d775.webp","notifi-warning.44f565cf.webp"]},
    {themes:["win31","win95","win98","win2k"],files:["error-win2k.ceba73c0.png","success-win2k.7b281bfb.png","warning-win2k.333f629e.png"]},
    {themes:["win10","win11","win11dark","macos","chromeos","ubuntu","kubuntu"],files:["notifi-error-win10.956ad576.webp","notifi-success-win10.5fdfecb5.webp","notifi-warning-win10.e1a2a370.webp"]},
    {themes:["onebit"],files:["close-onebit.a1490e2c.svg","check-onebit.35be58dd.svg","alert-onebit.809dcd0e.svg"]}
  ];
  for(const {themes,files} of cases)for(const theme of themes){
    (["error","success","warning"] as const).forEach((type,i)=>expect(sourceNotificationArt(theme,type)).toBe("/assets/images/"+files[i]));
    expect(sourceNotificationArt(theme,"info")).toBeUndefined();
  }
});
