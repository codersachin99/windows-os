import {describe,expect,it,vi} from "vitest";
import {SourceTaskbarPins,SOURCE_TASKBAR_PINS_KEY} from "./sourceTaskbarPins";
const storage=(value:string|null=null)=>{
  let stored=value;
  return {
    getItem:vi.fn((key:string)=>key===SOURCE_TASKBAR_PINS_KEY?stored:null),
    setItem:vi.fn((key:string,next:string)=>{if(key===SOURCE_TASKBAR_PINS_KEY)stored=next;})
  };
};
describe("original source taskbar pinnedPrograms state",()=>{
  it("toggles registered-style IDs, notifies subscribers and persists order",()=>{
    const backing=storage();
    const pins=new SourceTaskbarPins(backing);
    const listener=vi.fn();const unsub=pins.subscribe(listener);
    expect(pins.toggle("computer")).toBe(true);
    expect(pins.toggle("notepad")).toBe(true);
    expect(pins.toggle("computer")).toBe(false);
    expect(pins.snapshot()).toEqual(["notepad"]);
    expect(listener).toHaveBeenCalledTimes(3);
    expect(new SourceTaskbarPins(backing).snapshot()).toEqual(["notepad"]);
    unsub();pins.toggle("calc");
    expect(listener).toHaveBeenCalledTimes(3);
  });
  it("rejects invalid persistent data and never writes invalid IDs",()=>{
    const pins=new SourceTaskbarPins(storage(
      '["computer","computer","BAD ID",3,"notepad"]'));
    expect(pins.snapshot()).toEqual(["computer","notepad"]);
    expect(pins.toggle("../unsafe")).toBe(false);
    expect(pins.snapshot()).toEqual(["computer","notepad"]);
    expect(new SourceTaskbarPins(storage("not json")).snapshot()).toEqual([]);
  });
  it("continues in memory when localStorage cannot write",()=>{
    const pins=new SourceTaskbarPins({
      getItem:()=>null,setItem:()=>{throw Error("Storage forbidden");}
    });
    expect(pins.toggle("cmd")).toBe(true);
    expect(pins.contains("cmd")).toBe(true);
  });
});
