import {expect,it} from "vitest";
import {sourceShellAsset,sourceThemeProgramArt,sourceThemeFileIconArtwork,sourceThemeSpecialFolderArt} from "./index";
it("maps exact ChromeOS core icon aliases and preserves fallback boundaries",()=>{
  const original={
  "computer": "/assets/images/computer-chromeos.f4f817d9.webp",
  "bin": "/assets/images/bin-chromeos.6bccf38b.webp",
  "bin-full": "/assets/images/bin-chromeos.6bccf38b.webp",
  "folder": "/assets/images/folder-chromeos.fa700781.svg",
  "file": "/assets/images/file-chromeos.c40dd66d.svg",
  "start": "/assets/images/start-button-win8.2e5214cc.svg",
  "folder-docs": "/assets/images/folder-chromeos.fa700781.svg",
  "folder-downloads": "/assets/images/downloads-chromeos.729e50f7.svg",
  "folder-music": "/assets/images/folder-chromeos.fa700781.svg",
  "folder-pics": "/assets/images/folder-chromeos.fa700781.svg",
  "folder-videos": "/assets/images/folder-chromeos.fa700781.svg",
  "disk-os": "/assets/images/disk-os-chromeos.8e3d1d59.webp",
  "disk-data": "/assets/images/disk-data-chromeos.eb3a943a.webp",
  "disk-cd": "/assets/images/disk-cd-chromeos.f4c2176f.webp",
  "disk-connected": "/assets/images/disk-data-chromeos.eb3a943a.webp",
  "disk-disconnected": "/assets/images/disk-data-chromeos.eb3a943a.webp",
  "calc": "/assets/images/calc-chromeos.a98e0827.webp",
  "cpanel": "/assets/images/cpanel-chromeos.208392b0.svg",
  "notepad": "/assets/images/notepad-chromeos.9c15f97a.webp",
  "cmd": "/assets/images/cmd-chromeos.255c4ab1.webp",
  "text": "/assets/images/text-chromeos.76d507c5.svg",
  "executable": "/assets/images/executable-win10.8269999b.webp",
  "shortcut": "/assets/images/shortcut-win10.c8f56fdb.webp",
  "media": "/assets/images/media-chromeos.51aced5d.svg",
  "zip": "/assets/images/zip-chromeos.f405c15d.svg",
  "desktop": "/assets/images/desktop-chromeos.26c36183.svg",
  "chrome": "/assets/images/chrome-chromeos.9384cbbf.svg"
};
  for(const [key,path] of Object.entries(original))
    expect(sourceThemeProgramArt("chromeos",key),key).toBe(path);
  for(const kind of ["computer","bin","folder","file","start"] as const)
    expect(sourceShellAsset("chromeos",kind)).toBe(original[kind]);
  expect(sourceShellAsset("chromeos","binFull")).toBe(original.bin);
  expect(sourceShellAsset("chromeos","theme")).toBe("/assets/images/chromeos.eaca6e72.webp");
  expect(sourceThemeFileIconArtwork("chromeos","folder")).toEqual({src:original.folder,exactSourceArtwork:true});
  expect(sourceThemeFileIconArtwork("chromeos","file")).toEqual({src:original.file,exactSourceArtwork:true});
  expect(sourceThemeFileIconArtwork("chromeos","text").src).toBe(original.text);
  expect(sourceThemeFileIconArtwork("chromeos","zip").src).toBe(original.zip);
  expect(sourceThemeFileIconArtwork("chromeos","file","calc").src).toBe(original.calc);
  expect(sourceThemeFileIconArtwork("chromeos","file","https://example.com/icon.png").src).toBe("https://example.com/icon.png");
  for(const label of ["Documents","Music","Pictures","Videos"])
    expect(sourceThemeSpecialFolderArt("chromeos",label)).toBe(original.folder);
  expect(sourceThemeSpecialFolderArt("chromeos","Downloads")).toBe(original["folder-downloads"]);
  expect(sourceThemeProgramArt("chromeos","__proto__")).toBeNull();
  expect(sourceThemeProgramArt("chromeos","unported")).toBeNull();
  expect(sourceThemeProgramArt("win7","notepad")).toBeNull();
});
