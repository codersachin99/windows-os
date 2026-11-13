import { describe, expect, it } from "vitest";
import { matchesSourceKind } from "./search";
import type { FileEntry } from "./index";

const file=(name:string):FileEntry=>({uri:"/"+name,name,type:"file",size:1,mtime:1});
function accepts(kind:NonNullable<import("./search").FileSearchRequest["kind"]>, yes:string[], no:string[]) {
  for(const name of yes) expect(matchesSourceKind(file(name),kind),kind+" "+name).toBe(true);
  for(const name of no) expect(matchesSourceKind(file(name),kind),kind+" "+name).toBe(false);
}

describe("exact pinned 0e9a/de73 file-kind predicate extensions",()=>{
  it("document combines source plain-text, rtf and pdf only",()=>{
    accepts("document",["a.txt","a.text","a.readme","a.md","a.json","a.xml",
      "a.rtf","a.wpl","a.pdf"],["a.docx","a.doc","a.odt","a.csv","a.ini"]);
  });
  it("picture, music and movie use the source de73 mime extension lists",()=>{
    accepts("picture",["a.bmp","a.gif","a.svg","a.png","a.jpg","a.jpeg",
      "a.jfif","a.webp","a.ico","a.apng"],["a.tiff","a.avif","a.heic"]);
    accepts("music",["a.webm","a.wav","a.ogg","a.mp3","a.wma","a.aac",
      "a.m4a","a.flac","a.mid"],["a.aiff","a.opus"]);
    accepts("video",["a.webm","a.ogv","a.ogm","a.mp4","a.mpg","a.mpeg",
      "a.wmv","a.avi","a.mov"],["a.mkv","a.3gp"]);
    expect(matchesSourceKind(file("music.webm"),"music")).toBe(true);
    expect(matchesSourceKind(file("movie.webm"),"movie")).toBe(true);
  });
  it("playlist, program, link and webpage follow original helper functions",()=>{
    accepts("playlist",["a.wpl"],["a.m3u","a.m3u8","a.pls"]);
    accepts("program",["a.exe","a.msi","a.apk"],["a.bat","a.cmd","a.com"]);
    accepts("link",["a.lnk"],["a.url","a.website"]);
    // Source /(?:html|htm)$/ deliberately also matches the mhtml suffix.
    accepts("webpage",["a.htm","a.html","a.mhtml"],["a.mht"]);
    expect(matchesSourceKind({...file("some"),type:"directory"},"folder")).toBe(true);
    expect(matchesSourceKind({...file("some"),type:"directory"},"document")).toBe(false);
  });
  it("retains source suffix test and filename case normalization",()=>{
    expect(matchesSourceKind(file("file.customjpg"),"picture")).toBe(true);
    expect(matchesSourceKind(file("file.JPEG"),"picture")).toBe(true);
    expect(matchesSourceKind(file("no_extension"),"picture")).toBe(false);
  });
});
