import {describe,it,expect} from "vitest";
import {sourceDesktopShortcut,sourceHotkeyAcceptsTarget} from "./sourceDesktopHotkeys";

const key=(letter:string,options:Partial<{
  altKey:boolean;ctrlKey:boolean;metaKey:boolean;shiftKey:boolean;
  target:EventTarget|null
}>={})=>({
  key:letter,altKey:true,ctrlKey:false,metaKey:false,shiftKey:false,
  target:null,...options
});
describe("original source main.js we hotkeys and hotkey.js editable filter",()=>{
  it("matches exactly the four source shell actions",()=>{
    expect(sourceDesktopShortcut(key("D"))).toBe("minimize-all");
    expect(sourceDesktopShortcut(key("w"))).toBe("toggle-start");
    expect(sourceDesktopShortcut(key("E"))).toBe("open-computer");
    expect(sourceDesktopShortcut(key("r"))).toBe("open-run");
    expect(sourceDesktopShortcut(key("l"))).toBeNull();
    expect(sourceDesktopShortcut(key("Tab",{shiftKey:true}))).toBeNull();
  });
  it("rejects other modifier chords and bare typing",()=>{
    expect(sourceDesktopShortcut(key("d",{altKey:false}))).toBeNull();
    expect(sourceDesktopShortcut(key("d",{ctrlKey:true}))).toBeNull();
    expect(sourceDesktopShortcut(key("d",{metaKey:true}))).toBeNull();
    expect(sourceDesktopShortcut(key("d",{shiftKey:true}))).toBeNull();
  });
  it("does not steal typing from editable input, textarea, select or contenteditable",()=>{
    for(const tagName of ["INPUT","TEXTAREA","SELECT"]){
      const target={tagName,readOnly:false} as unknown as EventTarget;
      expect(sourceHotkeyAcceptsTarget(target)).toBe(false);
      expect(sourceDesktopShortcut(key("e",{target}))).toBeNull();
      expect(sourceHotkeyAcceptsTarget({tagName,readOnly:true} as unknown as EventTarget)).toBe(true);
    }
    const content={tagName:"DIV",isContentEditable:true} as unknown as EventTarget;
    expect(sourceHotkeyAcceptsTarget(content)).toBe(false);
    expect(sourceDesktopShortcut(key("w",{target:content}))).toBeNull();
    expect(sourceDesktopShortcut(key("w",{target:{tagName:"BUTTON"} as unknown as EventTarget}))).toBe("toggle-start");
  });
});
