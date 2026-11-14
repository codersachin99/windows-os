import { describe, expect, it } from "vitest";
import {
  STICKY_COLORS, STICKY_STORAGE_KEY, sourceStickyDefault,
  sourceStickyMove, sourceStickyRandomColor, sourceStickyResize,
  sourceStickyRecords, loadSourceStickyNotes, saveSourceStickyNotes,
  type StickyNote
} from "./model";

function guestStorage() {
  const saved = new Map<string, string>();
  return {
    getItem:(key:string)=>saved.get(key)??null,
    setItem:(key:string,value:string)=>{saved.set(key,value);}
  };
}
const viewport = {width:1024,height:768};

describe("pinned source Sticky Notes model and Guest persistence",()=>{
  it("opens one centered yellow 200x200 note when no saved notes exist",()=>{
    const storage=guestStorage();
    const notes=loadSourceStickyNotes(storage,viewport);
    expect(notes).toEqual([{id:1,x:412,y:284,w:200,h:200,color:"yellow",content:""}]);
    expect(storage.getItem(STICKY_STORAGE_KEY)).toBeNull();
    expect(sourceStickyDefault({width:320,height:480})).toMatchObject({
      x:60,y:140,w:200,h:200,color:"yellow",content:""
    });
  });
  it("keeps source six-color order and random choice, with yellow as initial",()=>{
    expect(STICKY_COLORS).toEqual(["blue","green","pink","purple","white","yellow"]);
    expect(sourceStickyRandomColor(()=>0)).toBe("blue");
    expect(sourceStickyRandomColor(()=>.17)).toBe("green");
    expect(sourceStickyRandomColor(()=>.999)).toBe("yellow");
  });
  it("persists only original x/y/w/h/color/content fields and order, not React IDs",()=>{
    const storage=guestStorage();
    const first=loadSourceStickyNotes(storage,viewport)[0];
    const ordered:StickyNote[]=[
      {...first,id:10,content:"Saved café 😀"},
      {...first,id:11,x:125,y:85,w:270,h:175,color:"blue",content:"next"}
    ];
    saveSourceStickyNotes(storage,ordered);
    const serialized=storage.getItem(STICKY_STORAGE_KEY);
    expect(JSON.parse(serialized!)).toEqual({notes:[
      {x:412,y:284,w:200,h:200,color:"yellow",content:"Saved café 😀"},
      {x:125,y:85,w:270,h:175,color:"blue",content:"next"}
    ]});
    expect(sourceStickyRecords(ordered).every(x=>!("id" in x))).toBe(true);
    expect(loadSourceStickyNotes(storage,viewport).map(x=>x.content))
      .toEqual(["Saved café 😀","next"]);
  });
  it("source reopening an empty persisted selection yields a fresh yellow note",()=>{
    const storage=guestStorage();
    saveSourceStickyNotes(storage,[]);
    const recovered=loadSourceStickyNotes(storage,viewport);
    expect(recovered).toHaveLength(1);
    expect(recovered[0]).toMatchObject({id:1,color:"yellow",content:""});
  });
  it("rejects malformed saved state instead of silently replacing user data",()=>{
    const storage=guestStorage();
    storage.setItem(STICKY_STORAGE_KEY,"{bad");
    expect(()=>loadSourceStickyNotes(storage,viewport)).toThrow("Stored Sticky Notes");
    expect(storage.getItem(STICKY_STORAGE_KEY)).toBe("{bad");
    storage.setItem(STICKY_STORAGE_KEY,JSON.stringify({notes:[
      {x:0,y:0,w:200,h:200,color:"red",content:"invalid"}
    ]}));
    expect(()=>loadSourceStickyNotes(storage,viewport)).toThrow("Stored Sticky Notes");
  });
  it("moves notes within desktop bounds without losing source size and color",()=>{
    const original={...sourceStickyDefault(viewport),color:"purple" as const,content:"hello"};
    expect(sourceStickyMove(original,40,55,viewport)).toMatchObject({
      x:452,y:339,w:200,h:200,color:"purple",content:"hello"
    });
    expect(sourceStickyMove(original,3000,3000,viewport)).toMatchObject({
      x:824,y:528,w:200,h:200
    });
    expect(sourceStickyMove(original,-3000,-3000,viewport)).toMatchObject({x:0,y:0});
  });
  it("resizes from all four edges respecting 150x100 minimum and viewport",()=>{
    const original={x:100,y:100,w:200,h:200,color:"yellow" as const,content:"hello"};
    expect(sourceStickyResize(original,"se",30,50,viewport))
      .toMatchObject({x:100,y:100,w:230,h:250});
    expect(sourceStickyResize(original,"nw",35,40,viewport))
      .toMatchObject({x:135,y:140,w:165,h:160});
    expect(sourceStickyResize(original,"nw",500,500,viewport))
      .toMatchObject({x:150,y:200,w:150,h:100});
    expect(sourceStickyResize(original,"sw",-1000,0,viewport)).toMatchObject({x:0,w:300});
  });
  it("clamps saved positions and dimensions to a tiny mobile viewport",()=>{
    const storage=guestStorage();
    storage.setItem(STICKY_STORAGE_KEY,JSON.stringify({notes:[
      {x:500,y:700,w:450,h:450,color:"white",content:"mobile"}
    ]}));
    expect(loadSourceStickyNotes(storage,{width:240,height:320})[0])
      .toMatchObject({x:0,y:0,w:240,h:280,color:"white",content:"mobile"});
  });
  it("propagates persistent storage failures without editing a stale snapshot",()=>{
    const storage={
      getItem:(_:string)=>null,
      setItem:(_:string,__:string)=>{throw new Error("QuotaExceeded");}
    };
    expect(()=>saveSourceStickyNotes(storage,loadSourceStickyNotes(storage,viewport)))
      .toThrow("QuotaExceeded");
  });
});
