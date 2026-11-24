import {expect,it} from "vitest";
import {sourceShellAsset,sourceThemeProgramArt,sourceThemeFileIconArtwork,sourceThemeSpecialFolderArt} from "./index";

it("maps the pinned macOS registry core icons without leaking to other themes",()=>{
  const original={
  "computer": "/assets/images/computer-mac.4c6c5258.webp",
  "bin": "/assets/images/bin-mac.499e907b.webp",
  "bin-full": "/assets/images/bin-full-mac.67e3d272.webp",
  "folder": "/assets/images/folder-mac.248938aa.webp",
  "file": "/assets/images/file-mac.f9d8e370.webp",
  "start": "/assets/images/start-button-mac.db7da45a.webp",
  "folder-docs": "/assets/images/folder-docs-mac.19ef120e.webp",
  "folder-downloads": "/assets/images/folder-downloads-mac.5a239779.webp",
  "folder-music": "/assets/images/folder-music-mac.8905b037.webp",
  "folder-pics": "/assets/images/folder-pics-mac.dfca3097.webp",
  "folder-videos": "/assets/images/folder-videos-mac.7edd23bf.webp",
  "disk-os": "/assets/images/disk-mac.c1f755d1.webp",
  "disk-data": "/assets/images/disk-mac.c1f755d1.webp",
  "disk-cd": "/assets/images/disk-mac.c1f755d1.webp",
  "disk-connected": "/assets/images/disk-mac.c1f755d1.webp",
  "disk-disconnected": "/assets/images/disk-mac.c1f755d1.webp",
  "calc": "/assets/images/calc-mac.a8be886f.webp",
  "cpanel": "/assets/images/cpanel-mac.edf3e86a.webp",
  "notepad": "/assets/images/notepad-mac.82ca5f3f.webp",
  "cmd": "/assets/images/cmd-mac.4736d145.webp",
  "text": "/assets/images/text-mac.2378630a.webp",
  "richtext": "/assets/images/richtext-mac.2378630a.webp",
  "executable": "/assets/images/executable-mac.73f92274.webp",
  "shortcut": "/assets/images/shortcut-mac.45146f00.webp"
};
  for(const [key,path] of Object.entries(original)){
    expect(sourceThemeProgramArt("macos",key),key).toBe(path);
  }
  expect(sourceThemeProgramArt("macos","__proto__")).toBeNull();
  expect(sourceThemeProgramArt("macos","unported")).toBeNull();
  expect(sourceThemeProgramArt("win7","notepad")).toBeNull();
  for(const kind of ["computer","bin","folder","file","start"] as const)
    expect(sourceShellAsset("macos",kind)).toBe(original[kind]);
  expect(sourceShellAsset("macos","binFull")).toBe(original["bin-full"]);
  expect(sourceShellAsset("macos","theme")).toBe("/assets/images/macos.54af5cd4.webp");
  expect(sourceThemeFileIconArtwork("macos","folder")).toEqual({src:original.folder,exactSourceArtwork:true});
  expect(sourceThemeFileIconArtwork("macos","file")).toEqual({src:original.file,exactSourceArtwork:true});
  expect(sourceThemeFileIconArtwork("macos","text").src).toBe(original.text);
  expect(sourceThemeFileIconArtwork("macos","file","calc").src).toBe(original.calc);
  expect(sourceThemeFileIconArtwork("macos","file","https://example.com/icon.png").src).toBe("https://example.com/icon.png");
  for(const [label,key] of [["Documents","folder-docs"],["Downloads","folder-downloads"],["Music","folder-music"],["Pictures","folder-pics"],["Videos","folder-videos"]] as const)
    expect(sourceThemeSpecialFolderArt("macos",label)).toBe(original[key]);
});
