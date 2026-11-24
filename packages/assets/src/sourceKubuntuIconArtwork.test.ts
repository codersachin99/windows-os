import {expect,it} from "vitest";
import {sourceShellAsset,sourceThemeProgramArt,sourceThemeFileIconArtwork,sourceThemeSpecialFolderArt} from "./index";
it("maps exact Kubuntu core registry and intentional shared aliases",()=>{
  const original={
  "computer": "/assets/images/computer-kubuntu.21e2af5f.svg",
  "bin": "/assets/images/bin-kubuntu.9e105407.webp",
  "bin-full": "/assets/images/bin-full-kubuntu.52b4bff6.webp",
  "folder": "/assets/images/computer-kubuntu.21e2af5f.svg",
  "file": "/assets/images/file-kubuntu.7dae3497.webp",
  "start": "/assets/images/start-button-kubuntu.70b91e6e.svg",
  "folder-docs": "/assets/images/folder-docs-kubuntu.bc09a419.svg",
  "folder-downloads": "/assets/images/folder-download-kubuntu.3ddfc03d.svg",
  "folder-music": "/assets/images/folder-music-kubuntu.bdd260b5.svg",
  "folder-pics": "/assets/images/folder-pics-kubuntu.372cdadd.svg",
  "folder-videos": "/assets/images/folder-videos-ubuntu.c9f591cb.svg",
  "disk-os": "/assets/images/disk-os-kubuntu.367266ba.webp",
  "disk-data": "/assets/images/disk-data-kubuntu.dae58e0b.webp",
  "disk-cd": "/assets/images/disk-cd-ubuntu.8116cfe5.svg",
  "disk-connected": "/assets/images/disk-connected-ubuntu.bcb836ee.svg",
  "disk-disconnected": "/assets/images/disk-disconnected-ubuntu.6f41bf79.svg",
  "calc": "/assets/images/calc-kubuntu.1cae644c.webp",
  "cpanel": "/assets/images/cpanel-kubuntu.34a12acd.webp",
  "notepad": "/assets/images/notepad-kubuntu.3cbb25e5.webp",
  "cmd": "/assets/images/cmd-kubuntu.38e94c40.webp",
  "text": "/assets/images/text-kubuntu.3a6c3fc7.webp",
  "richtext": "/assets/images/richtext-ubuntu.31b42436.svg",
  "executable": "/assets/images/executable-kubuntu.07e7f7b2.webp",
  "shortcut": "/assets/images/shortcut-win10.c8f56fdb.webp",
  "media": "/assets/images/media-kubuntu.d9fc4ff6.webp",
  "zip": "/assets/images/zip-ubuntu.cef6da1f.svg",
  "desktop": "/assets/images/desktop-kubuntu.caba3657.webp"
};
  for(const [key,path] of Object.entries(original))
    expect(sourceThemeProgramArt("kubuntu",key),key).toBe(path);
  for(const kind of ["computer","bin","folder","file","start"] as const)
    expect(sourceShellAsset("kubuntu",kind)).toBe(original[kind]);
  expect(sourceShellAsset("kubuntu","binFull")).toBe(original["bin-full"]);
  expect(sourceShellAsset("kubuntu","binFull")).not.toBe(sourceShellAsset("kubuntu","bin"));
  expect(sourceShellAsset("kubuntu","theme")).toBe("/assets/images/kubuntu.618268f7.webp");
  expect(sourceShellAsset("kubuntu","folder")).toBe(sourceShellAsset("kubuntu","computer"));
  for(const key of ["folder-videos","disk-cd","disk-connected","disk-disconnected","richtext","shortcut","zip"] as const)
    expect(sourceThemeProgramArt("kubuntu",key)).toBe(sourceThemeProgramArt("ubuntu",key));
  expect(sourceThemeFileIconArtwork("kubuntu","folder")).toEqual({src:original.folder,exactSourceArtwork:true});
  expect(sourceThemeFileIconArtwork("kubuntu","file")).toEqual({src:original.file,exactSourceArtwork:true});
  for(const key of ["text","richtext","zip","executable","media"] as const)
    expect(sourceThemeFileIconArtwork("kubuntu",key).src).toBe(original[key]);
  expect(sourceThemeFileIconArtwork("kubuntu","file","calc").src).toBe(original.calc);
  expect(sourceThemeFileIconArtwork("kubuntu","file","https://example.com/icon.png").src).toBe("https://example.com/icon.png");
  for(const [label,key] of [["Documents","folder-docs"],["Downloads","folder-downloads"],["Music","folder-music"],["Pictures","folder-pics"],["Videos","folder-videos"]] as const)
    expect(sourceThemeSpecialFolderArt("kubuntu",label)).toBe(original[key]);
  expect(sourceThemeProgramArt("kubuntu","__proto__")).toBeNull();
  expect(sourceThemeProgramArt("kubuntu","unported")).toBeNull();
  expect(sourceThemeProgramArt("win7","notepad")).toBeNull();
});
