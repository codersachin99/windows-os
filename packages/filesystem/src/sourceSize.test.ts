import {describe,expect,it} from "vitest";
import {sourceSizeFromBytes} from "./sourceSize";

describe("pinned 4cca.getSizeFrom byte display",()=>{
  it("retains zero and whole byte counts with the exact source label",()=>{
    expect(sourceSizeFromBytes(0)).toBe("0 bytes");
    expect(sourceSizeFromBytes(1)).toBe("1 bytes");
    expect(sourceSizeFromBytes(1023)).toBe("1023 bytes");
  });
  it("uses a binary 1024 boundary and exactly one decimal",()=>{
    expect(sourceSizeFromBytes(1024)).toBe("1.0 KB");
    expect(sourceSizeFromBytes(1536)).toBe("1.5 KB");
    expect(sourceSizeFromBytes(2048)).toBe("2.0 KB");
    expect(sourceSizeFromBytes(1024**2)).toBe("1.0 MB");
    expect(sourceSizeFromBytes(1024**3)).toBe("1.0 GB");
    expect(sourceSizeFromBytes(1024**4)).toBe("1.0 TB");
  });
  it("keeps source toFixed(1) rounding instead of decimal SI notation",()=>{
    expect(sourceSizeFromBytes(1100)).toBe("1.1 KB");
    expect(sourceSizeFromBytes(1024*1024-1)).toBe("1024.0 KB");
  });
});
