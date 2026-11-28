import {describe,expect,it} from "vitest";
import {
  LEGACY_REVISION,sourceWin7StartLibraryArtwork,sourceWin7StartLibraryIcon
} from "./index";

describe("byte-identical pinned source Win7 library preview artwork",()=>{
  it("maps frozen source icon keys to original hashed WebP images",()=>{
    expect(LEGACY_REVISION).toBe("26b9f0ce7a1665dee89a7c81824bec09e2c75776");
    expect(sourceWin7StartLibraryArtwork).toEqual({
      documents:{
        standard:"/assets/images/start-docs.68e567fd.webp",
        base:"/assets/images/start-docs-base.d4ace145.svg"
      },
      pictures:{
        standard:"/assets/images/start-pics.90cdea88.webp",
        base:"/assets/images/start-pics-base.b5f2d859.svg"
      },
      music:{
        standard:"/assets/images/start-music.7d1b9e60.webp",
        base:"/assets/images/start-music-base.74611945.svg"
      }
    });
    for(const theme of ["win7","winvista","aero-1"]){
      for(const key of ["documents","pictures","music"] as const){
        expect(sourceWin7StartLibraryIcon(theme,key))
          .toBe(sourceWin7StartLibraryArtwork[key].standard);
      }
    }
  });
  it("uses pinned original Basic SVG variants without substituting emoji",()=>{
    for(const theme of ["basic-1","basic-2","basic-3","basic-4"]){
      for(const key of ["documents","pictures","music"] as const){
        expect(sourceWin7StartLibraryIcon(theme,key))
          .toBe(sourceWin7StartLibraryArtwork[key].base);
      }
    }
  });
});
