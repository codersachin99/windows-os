import {expect,it} from "vitest";
import {sourceShellWallpaper,sourceIsSystemWallpaper,sourceIsSolidThemeWallpaper} from "./index";

const original=[
  ["winvista","/assets/images/winvista.d80b2f4f.webp"],
  ["macos","/assets/images/macos.54af5cd4.webp"],
  ["chromeos","/assets/images/chromeos.eaca6e72.webp"],
  ["ubuntu","/assets/images/ubuntu.3588c6cf.webp"],
  ["kubuntu","/assets/images/kubuntu.618268f7.webp"],
  ["winLS","/assets/images/winLS.e359a90f.jpg"],
  ["winLP","/assets/images/winLP.dcaa8b07.jpg"],
  ["aeroNoir","/assets/images/aeroNoir.237e6377.webp"],
  ["oxygen","/assets/images/oxygen.414aed47.svg"],
  ["winW","/assets/images/winW.6a3e313e.webp"],
  ["winxpG","/assets/images/autumn.41774694.webp"],
  ["winxpR","/assets/images/follows.3e030a12.webp"],
  ["winxpS","/assets/images/azul.3af33f73.webp"],
  ["winxpZ","/assets/images/ascent.7c62e722.webp"]
] as const;
it("uses pinned source 3b8c desktop defaults rather than Windows 7 fallback",()=>{
  for(const [theme,path] of original){
    expect(sourceShellWallpaper(theme),theme).toBe(path);
    expect(sourceIsSystemWallpaper(path),theme).toBe(true);
  }
  for(const [theme,color] of [["base","#fffd"],["onebit","#352b30"],["win31","#bfbdc0"],["win95","#007d7b"],["win98","#57a8a8"],["win2k","#3b6ea4"]]){
    expect(sourceShellWallpaper(theme)).toBe(color);
    expect(sourceIsSolidThemeWallpaper(color)).toBe(true);
    expect(sourceIsSystemWallpaper(color)).toBe(false);
  }
  expect(sourceShellWallpaper("__proto__")).toBe("/assets/images/default.deccec52.webp");
  expect(sourceIsSystemWallpaper("/assets/images/nonexistent.webp")).toBe(false);
});
