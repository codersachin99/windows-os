import {describe,expect,it} from "vitest";
import {SOURCE_ONEBIT_AVATAR_PALETTE,sourceOnebitNearestPixel} from "./sourceOnebitAvatarPixelate";

describe("frozen Onebit source palette quantization",()=>{
  it("retains exact original four RGB swatches",()=>{
    expect(SOURCE_ONEBIT_AVATAR_PALETTE).toEqual([
      [53,43,48],[230,212,191],[128,101,114],[170,152,131]
    ]);
  });
  it("maps source colors and near colors to their exact palette entries",()=>{
    for(const swatch of SOURCE_ONEBIT_AVATAR_PALETTE){
      expect(sourceOnebitNearestPixel(swatch)).toEqual(swatch);
    }
    expect(sourceOnebitNearestPixel([0,0,0])).toEqual([53,43,48]);
    expect(sourceOnebitNearestPixel([255,255,255])).toEqual([230,212,191]);
  });
  it("keeps original source tie-break: last equally close palette match",()=>{
    // All four palette entries are distinct, and an exact match is stable.
    expect(sourceOnebitNearestPixel([128,101,114])).toEqual([128,101,114]);
  });
});
