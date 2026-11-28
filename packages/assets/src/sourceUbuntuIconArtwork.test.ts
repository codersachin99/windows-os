import {expect,it} from "vitest";
import {sourceShellAsset,sourceThemeProgramArt,sourceThemeFileIconArtwork,sourceThemeSpecialFolderArt} from "./index";
it("maps exact Ubuntu core registry and isolates source-specific artwork",()=>{
  const original={
  "computer": "/assets/images/computer-ubuntu.ab0d9786.webp",
  "bin": "/assets/images/bin-ubuntu.509f78ac.webp",
  "bin-full": "/assets/images/bin-full-ubuntu.2faf5a4b.webp",
  "folder": "/assets/images/folder-ubuntu.73afbe73.svg",
  "file": "/assets/images/file-ubuntu.2f731416.svg",
  "start": "/assets/images/start-button-ubuntu.a6d206e0.webp",
  "folder-docs": "/assets/images/folder-docs-ubuntu.d9b020ee.svg",
  "folder-downloads": "/assets/images/folder-downloads-ubuntu.367c96da.svg",
  "folder-music": "/assets/images/folder-music-ubuntu.c191048c.svg",
  "folder-pics": "/assets/images/folder-pics-ubuntu.f0402adf.svg",
  "folder-videos": "/assets/images/folder-videos-ubuntu.c9f591cb.svg",
  "disk-os": "/assets/images/disk-os-ubuntu.21cd56d7.webp",
  "disk-data": "/assets/images/disk-data-ubuntu.2dd831a0.webp",
  "disk-cd": "/assets/images/disk-cd-ubuntu.8116cfe5.svg",
  "disk-connected": "/assets/images/disk-connected-ubuntu.bcb836ee.svg",
  "disk-disconnected": "/assets/images/disk-disconnected-ubuntu.6f41bf79.svg",
  "calc": "/assets/images/calc-ubuntu.52ed0dee.svg",
  "cpanel": "/assets/images/cpanel-ubuntu.0464e08d.webp",
  "notepad": "/assets/images/notepad-ubuntu.cc9f1715.webp",
  "cmd": "/assets/images/cmd-ubuntu.393c1f91.webp",
  "text": "/assets/images/text-ubuntu.733fe14c.webp",
  "richtext": "/assets/images/richtext-ubuntu.31b42436.svg",
  "executable": "/assets/images/executable-ubuntu.55e207d7.webp",
  "shortcut": "/assets/images/shortcut-win10.c8f56fdb.webp",
  "media": "/assets/images/media-ubuntu.991db543.svg",
  "zip": "/assets/images/zip-ubuntu.cef6da1f.svg",
  "desktop": "/assets/images/desktop-ubuntu.ca166b4b.webp"
};
  for(const [key,path] of Object.entries(original))
    expect(sourceThemeProgramArt("ubuntu",key),key).toBe(path);
  for(const kind of ["computer","bin","folder","file","start"] as const)
    expect(sourceShellAsset("ubuntu",kind)).toBe(original[kind]);
  expect(sourceShellAsset("ubuntu","binFull")).toBe(original["bin-full"]);
  expect(sourceShellAsset("ubuntu","binFull")).not.toBe(sourceShellAsset("ubuntu","bin"));
  expect(sourceShellAsset("ubuntu","theme")).toBe("/assets/images/ubuntu.3588c6cf.webp");
  expect(sourceThemeFileIconArtwork("ubuntu","folder")).toEqual({src:original.folder,exactSourceArtwork:true});
  expect(sourceThemeFileIconArtwork("ubuntu","file")).toEqual({src:original.file,exactSourceArtwork:true});
  for(const key of ["text","richtext","zip","executable","media"] as const)
    expect(sourceThemeFileIconArtwork("ubuntu",key).src).toBe(original[key]);
  expect(sourceThemeFileIconArtwork("ubuntu","file","calc").src).toBe(original.calc);
  expect(sourceThemeFileIconArtwork("ubuntu","file","https://example.com/icon.png").src).toBe("https://example.com/icon.png");
  for(const [label,key] of [["Documents","folder-docs"],["Downloads","folder-downloads"],["Music","folder-music"],["Pictures","folder-pics"],["Videos","folder-videos"]] as const)
    expect(sourceThemeSpecialFolderArt("ubuntu",label)).toBe(original[key]);
  expect(sourceThemeProgramArt("ubuntu","__proto__")).toBeNull();
  expect(sourceThemeProgramArt("ubuntu","unported")).toBeNull();
  expect(sourceThemeProgramArt("win7","notepad")).toBeNull();
});
