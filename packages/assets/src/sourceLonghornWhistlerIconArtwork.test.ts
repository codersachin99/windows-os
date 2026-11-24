import {expect,it} from "vitest";
import {sourceShellAsset,sourceThemeProgramArt,sourceThemeFileIconArtwork,sourceThemeSpecialFolderArt} from "./index";
it("uses shared source Longhorn Plex/Whistler icons with distinct Start and wallpaper",()=>{
  const original={
  "about": "/assets/images/about-winxp.4d3ad58f.webp",
  "access": "/assets/images/access-winxp.c88ef204.webp",
  "accounts": "/assets/images/accounts-winxp.f09bda44.webp",
  "action-center": "/assets/images/action-center-winxp.52f44912.webp",
  "arrow": "/assets/images/arrow-winxp.b58eda4d.webp",
  "battery": "/assets/images/battery-winxp.af8edd8a.webp",
  "battery-charging": "/assets/images/battery-charging-winxp.321f84b7.webp",
  "bin": "/assets/images/bin-winxp.7d0403fd.webp",
  "bin-full": "/assets/images/bin-full-winxp.ba3f6193.webp",
  "calc": "/assets/images/calc-winxp.f79aee6b.webp",
  "camera": "/assets/images/camera-winxp.b21fe0fe.webp",
  "cmd": "/assets/images/cmd-winxp.62e75899.webp",
  "computer": "/assets/images/computer-winxp.8cbae9da.webp",
  "cpanel": "/assets/images/cpanel-winxp.1b08f5c8.webp",
  "datetime": "/assets/images/datetime-winxp.d62f4ef6.webp",
  "default": "/assets/images/default-winxp.4351048b.webp",
  "desktop": "/assets/images/desktop-winxp.da2acd23.webp",
  "disk-cd": "/assets/images/disk-cd-winxp.83ac2166.webp",
  "disk-connected": "/assets/images/disk-connected-winxp.e32b5363.webp",
  "disk-data": "/assets/images/disk-data-winxp.225dcc03.webp",
  "disk-disconnected": "/assets/images/disk-disconnected-winxp.3537cb22.webp",
  "disk-os": "/assets/images/disk-os-winxp.e3c2a016.webp",
  "display": "/assets/images/display-winxp.da9a9b48.webp",
  "executable": "/assets/images/executable-winxp.b1d9ded4.webp",
  "file": "/assets/images/file-winxp.c130b357.webp",
  "folder": "/assets/images/folder-winxp.ff1b00c5.webp",
  "folder-docs": "/assets/images/folder-docs-winxp.a303ce2a.webp",
  "folder-downloads": "/assets/images/folder-winxp.ff1b00c5.webp",
  "folder-music": "/assets/images/folder-music-winxp.dc009194.webp",
  "folder-pics": "/assets/images/folder-pics-winxp.05398ea9.webp",
  "folder-videos": "/assets/images/folder-videos-winxp.c38aba27.webp",
  "games": "/assets/images/games-winxp.7f048588.webp",
  "help": "/assets/images/help-winxp.6b449d71.webp",
  "installer": "/assets/images/programs-winxp.f148b05d.webp",
  "keyboard": "/assets/images/keyboard-winxp.648c2cdc.webp",
  "logoff": "/assets/images/logoff-winxp.71dc5ab2.webp",
  "magnifier": "/assets/images/magnifier-winxp.24194bc4.webp",
  "media": "/assets/images/media-winxp.c7e33e88.webp",
  "mouse": "/assets/images/mouse-winxp.c5534a40.webp",
  "network": "/assets/images/network-winxp.744648d4.webp",
  "network-off": "/assets/images/network-off-winxp.60414007.webp",
  "notepad": "/assets/images/notepad-winxp.82037fb1.webp",
  "paint": "/assets/images/paint-winxp.7e4e5dac.webp",
  "personalize": "/assets/images/personal-winxp.01949b73.webp",
  "player": "/assets/images/player-winxp.e1b486dd.webp",
  "programs": "/assets/images/programs-winxp.f148b05d.webp",
  "recorder": "/assets/images/sound-winxp.1ff35c0e.webp",
  "restart": "/assets/images/restart-winxp.3e97eeb0.webp",
  "run": "/assets/images/run-winxp.63d23fb9.webp",
  "search": "/assets/images/search-winxp.92dbc7ef.webp",
  "shutdown": "/assets/images/shutdown-winxp.f3312ea0.webp",
  "sound": "/assets/images/sound-winxp.1ff35c0e.webp",
  "sound-muted": "/assets/images/volume-muted-winxp.70d8b244.webp",
  "sound-unmuted": "/assets/images/sound-winxp.1ff35c0e.webp",
  "speech": "/assets/images/speech-winxp.a5b18330.webp",
  "system": "/assets/images/system-winxp.74879c1e.webp",
  "taskbar": "/assets/images/taskbar-winxp.46a225c9.webp",
  "text": "/assets/images/text-winxp.35e970dd.webp",
  "update": "/assets/images/update-winxp.85628670.webp",
  "volume-0": "/assets/images/sound-winxp.1ff35c0e.webp",
  "volume-100": "/assets/images/sound-winxp.1ff35c0e.webp",
  "volume-32": "/assets/images/sound-winxp.1ff35c0e.webp",
  "volume-65": "/assets/images/sound-winxp.1ff35c0e.webp",
  "volume-muted": "/assets/images/volume-muted-winxp.70d8b244.webp",
  "wordpad": "/assets/images/wordpad-winxp.1bde3c38.webp"
};
  for(const [theme,start,wallpaper] of [["winxp","/assets/images/start-button-winxp.a3485adf.webp","/assets/images/winxp.3e41719f.webp"],["winLS","/assets/images/start-button-winxp.a3485adf.webp","/assets/images/winLS.e359a90f.jpg"],["winLP","/assets/images/start-button-winL.bcbc8d89.webp","/assets/images/winLP.dcaa8b07.jpg"],["winW","/assets/images/start-button-win2k.650d501c.webp","/assets/images/winW.6a3e313e.webp"]] as const){
    for(const [key,path] of Object.entries(original))expect(sourceThemeProgramArt(theme,key),key).toBe(path);
    for(const kind of ["computer","bin","folder","file"] as const)expect(sourceShellAsset(theme,kind)).toBe(original[kind]);
    expect(sourceShellAsset(theme,"start")).toBe(start);
    expect(sourceThemeProgramArt(theme,"start")).toBe(start);
    expect(sourceShellAsset(theme,"theme")).toBe(wallpaper);
    expect(sourceShellAsset(theme,"binFull")).toBe(original["bin-full"]);
    expect(sourceThemeFileIconArtwork(theme,"folder")).toEqual({src:original.folder,exactSourceArtwork:true});
    expect(sourceThemeFileIconArtwork(theme,"file","calc").src).toBe(original.calc);
    expect(sourceThemeSpecialFolderArt(theme,"Downloads")).toBe(original.folder);
    expect(sourceThemeProgramArt(theme,"personal")).toBe(original.personalize);
    expect(sourceThemeProgramArt(theme,"__proto__")).toBeNull();
    expect(sourceThemeProgramArt(theme,"unported")).toBeNull();
  }
  expect(sourceShellAsset("winLS","start")).not.toBe(sourceShellAsset("winLP","start"));
  expect(sourceShellAsset("winxp","start")).toBe("/assets/images/start-button-winxp.a3485adf.webp");
  expect(sourceShellAsset("win2k","start")).toBe("/assets/images/start-button-win2k.650d501c.webp");
});
