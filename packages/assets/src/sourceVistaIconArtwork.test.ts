import {expect,it} from "vitest";
import {sourceShellAsset,sourceThemeProgramArt,sourceThemeFileIconArtwork,sourceThemeSpecialFolderArt,legacyArt} from "./index";
it("maps the entire original Vista override registry without inventing theme-specific shared icons",()=>{
  const original={
  "calc": "/assets/images/calc-winvista.46d50b40.webp",
  "cpanel": "/assets/images/cpanel-winvista.aee2401a.webp",
  "folder-docs": "/assets/images/folder-docs-winvista.d37b911b.webp",
  "folder-downloads": "/assets/images/folder-downloads-winvista.e9a11f63.webp",
  "folder-music": "/assets/images/folder-music-winvista.f77b8b67.webp",
  "folder-pics": "/assets/images/folder-pics-winvista.73e408b9.webp",
  "folder-videos": "/assets/images/folder-videos-winvista.e4bb726b.webp",
  "gadgets": "/assets/images/gadgets-winvista.9645eb0d.webp",
  "paint": "/assets/images/paint-winvista.2f8923fc.webp",
  "start": "/assets/images/start-button-winvista.f48c809a.webp",
  "sticky": "/assets/images/sticky-winvista.2eb5a2ad.webp"
};
  for(const [key,path] of Object.entries(original))expect(sourceThemeProgramArt("winvista",key),key).toBe(path);
  expect(sourceShellAsset("winvista","start")).toBe(original.start);
  expect(sourceShellAsset("winvista","theme")).toBe("/assets/images/winvista.d80b2f4f.webp");
  for(const kind of ["computer","bin","binFull","folder","file"] as const)expect(sourceShellAsset("winvista",kind)).toBeNull();
  expect(sourceThemeFileIconArtwork("winvista","folder")).toEqual({src:legacyArt.folder,exactSourceArtwork:true});
  expect(sourceThemeFileIconArtwork("winvista","file")).toEqual({src:legacyArt.file,exactSourceArtwork:true});
  expect(sourceThemeFileIconArtwork("winvista","file","calc").src).toBe(original.calc);
  for(const [label,key] of [["Documents","folder-docs"],["Downloads","folder-downloads"],["Music","folder-music"],["Pictures","folder-pics"],["Videos","folder-videos"]] as const)expect(sourceThemeSpecialFolderArt("winvista",label)).toBe(original[key]);
  expect(sourceThemeProgramArt("winvista","__proto__")).toBeNull();
  expect(sourceThemeProgramArt("winvista","notepad")).toBeNull();
  expect(sourceThemeProgramArt("win7","calc")).toBeNull();
});
