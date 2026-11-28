import {expect,it} from "vitest";
import {sourceShellAsset,sourceThemeProgramArt,sourceThemeFileIconArtwork,sourceThemeSpecialFolderArt} from "./index";
it("maps pinned Aero Noir core icon artwork and original aliases",()=>{
  const original={
  "computer": "/assets/images/computer-aeroNoir.1a117c0c.webp",
  "bin": "/assets/images/bin-aeroNoir.12b5ed31.svg",
  "bin-full": "/assets/images/bin-full-aeroNoir.6bcff3f1.webp",
  "folder": "/assets/images/folder-aeroNoir.0a237526.svg",
  "file": "/assets/images/file-aeroNoir.a9c655e6.svg",
  "folder-docs": "/assets/images/folder-docs-aeroNoir.e177413f.svg",
  "folder-downloads": "/assets/images/folder-downloads-aeroNoir.95a9aee9.svg",
  "folder-music": "/assets/images/folder-aeroNoir.0a237526.svg",
  "folder-pics": "/assets/images/folder-aeroNoir.0a237526.svg",
  "folder-videos": "/assets/images/folder-aeroNoir.0a237526.svg",
  "disk-os": "/assets/images/disk-os-aeroNoir.54eed116.svg",
  "disk-data": "/assets/images/disk-data-aeroNoir.ea90c364.svg",
  "disk-cd": "/assets/images/disc-aeroNoir.fac45aa1.svg",
  "disk-connected": "/assets/images/disk-data-aeroNoir.ea90c364.svg",
  "disk-disconnected": "/assets/images/disk-data-aeroNoir.ea90c364.svg",
  "calc": "/assets/images/calc-aeroNoir.75c6cdda.svg",
  "cpanel": "/assets/images/cpanel-aeroNoir.9ba00864.webp",
  "notepad": "/assets/images/notepad-aeroNoir.87d75ca0.webp",
  "cmd": "/assets/images/cmd-aeroNoir.6b41da99.webp",
  "text": "/assets/images/text-aeroNoir.dc3a397c.svg",
  "richtext": "/assets/images/richtext-aeroNoir.0a8b71f5.webp",
  "executable": "/assets/images/executable-aeroNoir.229e3731.webp",
  "shortcut": "/assets/images/shortcut-aeroNoir.cd6dda1d.svg",
  "media": "/assets/images/media-aeroNoir.c443b1a1.webp",
  "zip": "/assets/images/zip-aeroNoir.20c3456d.webp",
  "desktop": "/assets/images/desktop-aeroNoir.3821791a.svg"
};
  for(const [key,path] of Object.entries(original))expect(sourceThemeProgramArt("aeroNoir",key),key).toBe(path);
  for(const kind of ["computer","bin","folder","file"] as const)expect(sourceShellAsset("aeroNoir",kind)).toBe(original[kind]);
  expect(sourceShellAsset("aeroNoir","binFull")).toBe(original["bin-full"]);
  expect(sourceShellAsset("aeroNoir","binFull")).not.toBe(original.bin);
  expect(sourceShellAsset("aeroNoir","theme")).toBe("/assets/images/aeroNoir.237e6377.webp");
  expect(sourceShellAsset("aeroNoir","start")).toBeNull();
  expect(sourceThemeFileIconArtwork("aeroNoir","folder")).toEqual({src:original.folder,exactSourceArtwork:true});
  expect(sourceThemeFileIconArtwork("aeroNoir","file")).toEqual({src:original.file,exactSourceArtwork:true});
  for(const key of ["text","richtext","zip","executable","media"] as const)expect(sourceThemeFileIconArtwork("aeroNoir",key).src).toBe(original[key]);
  expect(sourceThemeFileIconArtwork("aeroNoir","file","calc").src).toBe(original.calc);
  expect(sourceThemeFileIconArtwork("aeroNoir","file","https://example.com/icon.png").src).toBe("https://example.com/icon.png");
  for(const [label,key] of [["Documents","folder-docs"],["Downloads","folder-downloads"],["Music","folder-music"],["Pictures","folder-pics"],["Videos","folder-videos"]] as const)expect(sourceThemeSpecialFolderArt("aeroNoir",label)).toBe(original[key]);
  expect(sourceThemeProgramArt("aeroNoir","__proto__")).toBeNull();
  expect(sourceThemeProgramArt("aeroNoir","unported")).toBeNull();
  expect(sourceThemeProgramArt("win7","notepad")).toBeNull();
});
