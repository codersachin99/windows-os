import {describe,expect,it} from "vitest";
import {sourceCpanelUseWin7Nav} from "./ControlPanelApp";

describe("source theme-scoped Control Panel navigation",()=>{
  it("uses original 27px Win7 sprite only in the Win7 theme",()=>{
    expect(sourceCpanelUseWin7Nav("win7")).toBe(true);
    for(const skin of ["winxp","win11","win10","winvista","win31","win95","win98"] as const){
      expect(sourceCpanelUseWin7Nav(skin)).toBe(false);
    }
  });
});
