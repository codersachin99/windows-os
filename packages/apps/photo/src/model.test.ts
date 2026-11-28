import { describe, expect, it } from "vitest";
import type { FileEntry } from "@windows-os/filesystem";
import {
  isSourcePhotoFile, sourcePhotoMime, sourceWritablePhotoMime,
  sourcePhotoList, sourcePhotoNextPath, sourcePhotoAngle
} from "./model";

const item=(name:string,type:"directory"|"file"="file"):FileEntry=>({
  uri:"/Pictures/"+name,name,type,size:10,mtime:1
});
describe("pinned source Photo Viewer picture file behavior",()=>{
  it("accepts original picture extensions without treating arbitrary files as images",()=>{
    for(const extension of ["bmp","gif","svg","png","jpg","jpeg","jfif","webp","ico","apng"]){
      expect(isSourcePhotoFile("image."+extension)).toBe(true);
      expect(isSourcePhotoFile("image."+extension.toUpperCase())).toBe(true);
    }
    for(const extension of ["mp3","txt","exe","avif","tiff","heic","docx"]){
      expect(isSourcePhotoFile("image."+extension)).toBe(false);
    }
    expect(isSourcePhotoFile("file.customjpg")).toBe(true); // source de73 suffix predicate
    expect(sourcePhotoMime("x.JPG")).toBe("image/jpeg");
    expect(sourcePhotoMime("x.svg")).toBe("image/svg+xml");
    expect(sourceWritablePhotoMime("x.jpeg")).toBe("image/jpeg");
    expect(sourceWritablePhotoMime("x.gif")).toBeNull();
  });
  it("limits folder navigation to pictures, excluding directories and text",()=>{
    expect(sourcePhotoList([item("a.png"),item("b.jpg"),item("c.txt"),item("d.webp","directory")])
      .map(x=>x.name)).toEqual(["a.png","b.jpg"]);
  });
  it("does not navigate one picture or a missing current picture",()=>{
    expect(sourcePhotoNextPath([item("a.png")],"/Pictures/a.png",1)).toBeNull();
    expect(sourcePhotoNextPath([item("a.png"),item("b.png")],"/missing",1)).toBeNull();
  });
  it("wraps backwards and forwards using source Photo Viewer semantics",()=>{
    const files=[item("a.png"),item("b.jpg"),item("c.gif")];
    expect(sourcePhotoNextPath(files,"/Pictures/c.gif",1)).toBe("/Pictures/a.png");
    expect(sourcePhotoNextPath(files,"/Pictures/a.png",-1)).toBe("/Pictures/c.gif");
    expect(sourcePhotoNextPath(files,"/Pictures/a.png",1)).toBe("/Pictures/b.jpg");
  });
  it("rotates in source 90 degree increments preserving modulo semantics",()=>{
    expect(sourcePhotoAngle(0,-90)).toBe(-90);
    expect(sourcePhotoAngle(-90,-90)).toBe(-180);
    expect(sourcePhotoAngle(270,90)).toBe(0);
  });
});
