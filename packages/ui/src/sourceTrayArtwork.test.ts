import {expect,it} from "vitest";
import {sourceActionCenterArt,sourceNetworkUsesVector,sourceNetworkTrayArt,sourceNetworkConnectionArt} from "./sourceTrayArtwork";
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
