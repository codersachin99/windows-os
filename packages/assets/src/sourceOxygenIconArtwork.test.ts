import {expect,it} from "vitest";
import {sourceShellAsset,sourceThemeProgramArt,sourceThemeFileIconArtwork,sourceThemeSpecialFolderArt} from "./index";
it("maps pinned Oxygen core icon artwork and original aliases",()=>{
  const original={
  "computer": "/assets/images/computer-oxygen.d170989c.webp",
  "bin": "/assets/images/bin-oxygen.b6be9ff9.webp",
  "bin-full": "/assets/images/bin-full-oxygen.a82e7824.webp",
  "folder": "/assets/images/folder-oxygen.b048f163.webp",
  "file": "/assets/images/file-oxygen.7a4e1a22.webp",
  "folder-docs": "/assets/images/folder-docs-oxygen.c90421ab.webp",
  "folder-downloads": "/assets/images/folder-oxygen.b048f163.webp",
  "folder-music": "/assets/images/folder-music-oxygen.cd81f2bb.webp",
  "folder-pics": "/assets/images/folder-pics-oxygen.4782ad04.webp",
  "disk-os": "/assets/images/disk-oxygen.9b235af5.webp",
  "disk-data": "/assets/images/disk-oxygen.9b235af5.webp",
  "disk-cd": "/assets/images/disk-cd-oxygen.c2083455.webp",
  "disk-connected": "/assets/images/disk-removable-oxygen.baaa39fa.webp",
  "disk-disconnected": "/assets/images/disk-removable-oxygen.baaa39fa.webp",
  "calc": "/assets/images/calc-oxygen.d1995bc6.webp",
  "cpanel": "/assets/images/cpanel-oxygen.ddd1bb31.webp",
  "notepad": "/assets/images/notepad-oxygen.9f263926.webp",
  "cmd": "/assets/images/cmd-oxygen.b7d25079.webp",
  "text": "/assets/images/text-oxygen.95901e25.webp",
  "richtext": "/assets/images/richtext-oxygen.f5743000.webp",
  "executable": "/assets/images/executable-oxygen.33e505c2.webp",
  "shortcut": "/assets/images/shortcut-oxygen.f9210347.webp",
  "media": "/assets/images/media-oxygen.1799a7a7.webp",
  "zip": "/assets/images/zip-oxygen.38e964f7.webp",
  "desktop": "/assets/images/desktop-oxygen.d7075bf2.webp",
  "logoff": "/assets/images/logoff-oxygen.051fb842.webp",
  "restart": "/assets/images/restart-oxygen.d4450a1a.webp",
  "shutdown": "/assets/images/shutdown-oxygen.62df7a25.webp"
};
  for(const [key,path] of Object.entries(original))expect(sourceThemeProgramArt("oxygen",key),key).toBe(path);
  for(const kind of ["computer","bin","folder","file"] as const)expect(sourceShellAsset("oxygen",kind)).toBe(original[kind]);
  expect(sourceShellAsset("oxygen","binFull")).toBe(original["bin-full"]);
  expect(sourceShellAsset("oxygen","binFull")).not.toBe(original.bin);
  expect(sourceShellAsset("oxygen","theme")).toBe("/assets/images/oxygen.414aed47.svg");
  expect(sourceShellAsset("oxygen","start")).toBeNull();
  expect(sourceThemeSpecialFolderArt("oxygen","Videos")).toBeNull();
  expect(sourceThemeFileIconArtwork("oxygen","folder")).toEqual({src:original.folder,exactSourceArtwork:true});
  expect(sourceThemeFileIconArtwork("oxygen","file")).toEqual({src:original.file,exactSourceArtwork:true});
  for(const key of ["text","richtext","zip","executable","media"] as const)expect(sourceThemeFileIconArtwork("oxygen",key).src).toBe(original[key]);
  expect(sourceThemeFileIconArtwork("oxygen","file","calc").src).toBe(original.calc);
  expect(sourceThemeFileIconArtwork("oxygen","file","https://example.com/icon.png").src).toBe("https://example.com/icon.png");
  for(const [label,key] of [["Documents","folder-docs"],["Downloads","folder-downloads"],["Music","folder-music"],["Pictures","folder-pics"]] as const)expect(sourceThemeSpecialFolderArt("oxygen",label)).toBe(original[key]);
  expect(sourceThemeProgramArt("oxygen","__proto__")).toBeNull();
  expect(sourceThemeProgramArt("oxygen","unported")).toBeNull();
  expect(sourceThemeProgramArt("win7","notepad")).toBeNull();
});
