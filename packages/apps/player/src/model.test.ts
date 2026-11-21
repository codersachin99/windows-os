import {describe,it,expect} from "vitest";
import {SOURCE_PLAYER_LIBRARIES,SOURCE_PLAYER_INITIAL,SOURCE_PLAYER_STATES,
  sourcePlayerKind,sourcePlayerMime,sourcePlayerClock,sourcePlayerStep,
  sourcePlayerEffectiveVolume,sourcePlayerShowsAllControls} from "./model";
describe("pinned Media Player 9b15 contracts",()=>{
  it("preserves source initial library/control state",()=>{
    expect(SOURCE_PLAYER_LIBRARIES).toEqual(["music","videos","pictures"]);
    expect(SOURCE_PLAYER_INITIAL).toMatchObject({library:"music",showList:false,current:-1,
      currentTime:-1,duration:null,isRandom:false,isLoop:false,muted:false,volume:100,state:0});
    expect(SOURCE_PLAYER_STATES).toEqual({Stop:0,Play:1,Pause:2});
  });
  it("routes local media extensions and rejects unknown executable types",()=>{
    expect(sourcePlayerKind("demo.mp3")).toBe("music");
    expect(sourcePlayerKind("MOVIE.MP4")).toBe("videos");
    expect(sourcePlayerKind("Picture.png")).toBe("pictures");
    expect(sourcePlayerKind("script.exe")).toBeNull();
    expect(sourcePlayerMime("demo.mp3")).toBe("audio/mpeg");
    expect(sourcePlayerMime("movie.webm")).toBe("video/webm");
    expect(sourcePlayerMime("readme.txt")).toBeNull();
  });
  it("formats source media clock only when duration > 0",()=>{
    expect(sourcePlayerClock(null)).toBeNull();
    expect(sourcePlayerClock(0)).toBeNull();
    expect(sourcePlayerClock(65.9)).toBe("01:05");
    expect(sourcePlayerClock(3661)).toBe("01:01:01");
  });
  it("wraps previous/next and scales local/system volume",()=>{
    expect(sourcePlayerStep(0,3,-1)).toBe(2);
    expect(sourcePlayerStep(2,3,1)).toBe(0);
    expect(sourcePlayerStep(0,0,1)).toBe(-1);
    expect(sourcePlayerEffectiveVolume(50,80)).toBe(0.4);
    expect(sourcePlayerEffectiveVolume(150)).toBe(1);
    expect(sourcePlayerShowsAllControls(399)).toBe(false);
    expect(sourcePlayerShowsAllControls(400)).toBe(true);
  });
});
