import {expect,it} from "vitest";
import {sourceShellAsset,sourceThemeProgramArt,sourceThemeFileIconArtwork,sourceThemeSpecialFolderArt} from "./index";
it("maps original Onebit monochrome icons and intentional aliases",()=>{
  const original={
  "computer": "/assets/images/computer-onebit.ce54e8ef.svg",
  "bin": "/assets/images/bin-onebit.b4ba1ed0.svg",
  "bin-full": "/assets/images/bin-onebit.b4ba1ed0.svg",
  "folder": "/assets/images/folder-onebit.11d8e8ae.svg",
  "file": "/assets/images/file-onebit.86e331c1.svg",
  "start": "/assets/images/start-onebit.76d1ba55.svg",
  "folder-docs": "/assets/images/folder-onebit.11d8e8ae.svg",
  "folder-downloads": "/assets/images/folder-onebit.11d8e8ae.svg",
  "folder-music": "/assets/images/folder-onebit.11d8e8ae.svg",
  "folder-pics": "/assets/images/folder-onebit.11d8e8ae.svg",
  "folder-videos": "/assets/images/folder-onebit.11d8e8ae.svg",
  "disk-os": "/assets/images/disk-onebit.f548a0b4.svg",
  "disk-data": "/assets/images/disk-onebit.f548a0b4.svg",
  "disk-cd": "/assets/images/disk-onebit.f548a0b4.svg",
  "disk-connected": "/assets/images/disk-onebit.f548a0b4.svg",
  "disk-disconnected": "/assets/images/disk-onebit.f548a0b4.svg",
  "calc": "/assets/images/calc-onebit.7ec329f9.svg",
  "cpanel": "/assets/images/cpanel-onebit.97f4504b.svg",
  "notepad": "/assets/images/notepad-onebit.b01fbf08.svg",
  "cmd": "/assets/images/cmd-onebit.79f55a17.svg",
  "text": "/assets/images/text-onebit.885050ef.svg",
  "richtext": "/assets/images/text-onebit.885050ef.svg",
  "executable": "/assets/images/default-onebit.aa73533f.svg",
  "shortcut": "/assets/images/shortcut-onebit.25a406da.svg",
  "media": "/assets/images/media-onebit.e7e32a4b.svg",
  "zip": "/assets/images/zip-onebit.75fd7aa6.svg",
  "desktop": "/assets/images/desktop-onebit.1ee5fa8d.svg",
  "default": "/assets/images/default-onebit.aa73533f.svg",
  "power": "/assets/images/power-onebit.9672be1f.svg"
};
  for(const [key,path] of Object.entries(original))expect(sourceThemeProgramArt("onebit",key),key).toBe(path);
  for(const kind of ["computer","bin","folder","file","start"] as const)expect(sourceShellAsset("onebit",kind)).toBe(original[kind]);
  expect(sourceShellAsset("onebit","binFull")).toBe(original.bin);
  expect(sourceShellAsset("onebit","theme")).toBe("#352b30");
  expect(sourceThemeFileIconArtwork("onebit","folder")).toEqual({src:original.folder,exactSourceArtwork:true});
  expect(sourceThemeFileIconArtwork("onebit","file")).toEqual({src:original.file,exactSourceArtwork:true});
  for(const key of ["text","richtext","zip","executable","media"] as const)expect(sourceThemeFileIconArtwork("onebit",key).src).toBe(original[key]);
  expect(sourceThemeFileIconArtwork("onebit","file","calc").src).toBe(original.calc);
  expect(sourceThemeFileIconArtwork("onebit","file","https://example.com/icon.png").src).toBe("https://example.com/icon.png");
  for(const label of ["Documents","Downloads","Music","Pictures","Videos"])expect(sourceThemeSpecialFolderArt("onebit",label)).toBe(original.folder);
  expect(sourceThemeProgramArt("onebit","__proto__")).toBeNull();
  expect(sourceThemeProgramArt("onebit","unported")).toBeNull();
  expect(sourceThemeProgramArt("win7","notepad")).toBeNull();
});
