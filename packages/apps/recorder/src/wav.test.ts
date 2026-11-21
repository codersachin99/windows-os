import { describe,expect,it } from "vitest";
import { encodeSourceWave,sourceRecorderTime } from "./wav";

describe("source recorder WAV and elapsed time",()=>{
  it("writes little-endian PCM wave headers and clamped samples",()=>{
    const bytes=encodeSourceWave({
      numberOfChannels:2,length:3,sampleRate:8000,
      getChannelData:(channel)=>channel===0?
        new Float32Array([-1,0,1]):new Float32Array([-.5,.5,2])
    });
    const view=new DataView(bytes.buffer);
    const tag=(at:number,len:number)=>String.fromCharCode(...bytes.subarray(at,at+len));
    expect(tag(0,4)).toBe("RIFF");
    expect(view.getUint32(4,true)).toBe(bytes.length-8);
    expect(tag(8,4)).toBe("WAVE");
    expect(tag(12,4)).toBe("fmt ");
    expect(view.getUint16(20,true)).toBe(1);
    expect(view.getUint16(22,true)).toBe(2);
    expect(view.getUint32(24,true)).toBe(8000);
    expect(view.getUint32(28,true)).toBe(32000);
    expect(view.getUint16(32,true)).toBe(4);
    expect(view.getUint16(34,true)).toBe(16);
    expect(tag(36,4)).toBe("data");
    expect(view.getUint32(40,true)).toBe(12);
    expect(bytes.length).toBe(56);
    expect(view.getInt16(44,true)).toBe(-32768);
    expect(view.getInt16(46,true)).toBe(-16384);
    expect(view.getInt16(48,true)).toBe(0);
    expect(view.getInt16(50,true)).toBe(16384);
    expect(view.getInt16(52,true)).toBe(32767);
    expect(view.getInt16(54,true)).toBe(32767);
  });
  it("rejects zero-rate, empty, or unreasonable audio dimensions",()=>{
    const build=(channels:number,length:number,sampleRate:number)=>
      ()=>encodeSourceWave({numberOfChannels:channels,length,sampleRate,
        getChannelData:()=>new Float32Array(2)});
    expect(build(0,2,44100)).toThrow();
    expect(build(1,0,44100)).toThrow();
    expect(build(1,2,0)).toThrow();
    expect(build(100,2,44100)).toThrow();
  });
  it("displays elapsed time in whole seconds",()=>{
    expect(sourceRecorderTime(0)).toBe("00:00:00");
    expect(sourceRecorderTime(9.9)).toBe("00:00:09");
    expect(sourceRecorderTime(61)).toBe("00:01:01");
    expect(sourceRecorderTime(3661)).toBe("01:01:01");
  });
});
