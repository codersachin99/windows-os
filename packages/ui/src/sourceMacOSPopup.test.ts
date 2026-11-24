import {describe,it,expect} from "vitest";
import {sourceMacOSPopupTransition} from "./sourceMacOSPopup";
describe("source macOS single popup ownership",()=>{
  it("replaces the previous owner when another popup opens",()=>{
    const apple=sourceMacOSPopupTransition(null,"apple",true);
    const network=sourceMacOSPopupTransition(apple,"network",true);
    expect(network).toBe("network");
    expect(sourceMacOSPopupTransition(network,"spotlight",true)).toBe("spotlight");
  });
  it("does not let a late close dismiss a newer popup",()=>{
    expect(sourceMacOSPopupTransition("datetime","spotlight",false)).toBe("datetime");
    expect(sourceMacOSPopupTransition("datetime","datetime",false)).toBeNull();
  });
});
