import { describe, expect, it } from "vitest";
import { LegacyVolumeSession, VirtualFileStore,
  sourceMountedSearchRoots } from "./index";
import { searchFiles } from "./search";
import type { LegacyRuntimeMounts } from "./volumeSession";

const base = "/EXTERNAL/computer";
const runtime: LegacyRuntimeMounts = {
  root: base,
  desktopPath: base + "/drive0/Users/Guest/Desktop",
  trashPath: base + "/drive0/Users/Guest/Trash",
  disks: [
    {letter: "C", path: base + "/drive0", label: "System"},
    {letter: "D", path: base + "/drive1", label: "Data"}
  ]
};
async function mountedFixture() {
  const store = new VirtualFileStore();
  const volume = new LegacyVolumeSession(store, runtime);
  await volume.mount();
  // A Computer-container child is not a physical source getStats disk.
  await store.mkdir(base + "/UnlistedShadow");
  await store.write("outside", base + "/UnlistedShadow/MountedProbeOutside.txt");
  await store.write("c", base + "/drive0/MountedProbeC.txt");
  await store.write("d", base + "/drive1/MountedProbeD.txt");
  await store.mkdir(base + "/drive1/Reports");
  await store.write("nested", base + "/drive1/Reports/MountedProbeNested.txt");
  return { store, volume };
}
const search = (store:VirtualFileStore, roots:readonly string[],
  extra:Partial<import("./search").FileSearchRequest> = {}) =>
  searchFiles(store, {scope:base,rootScopes:roots,text:"mountedprobe",sourceRanked:true,
    subfolders:true,...extra});

describe("source 2e2c.b/computer.js empty in= disk roots", () => {
  it("searches every mounted source drive and excludes non-disk Computer children", async()=>{
    const {store,volume} = await mountedFixture();
    const roots = sourceMountedSearchRoots(volume);
    expect(roots).toEqual([base+"/drive0",base+"/drive1"]);
    const result = await search(store,roots);
    expect(result.files.map(entry=>entry.name).sort()).toEqual([
      "MountedProbeC.txt","MountedProbeD.txt","MountedProbeNested.txt"
    ]);
    expect(result.progress.matches).toBe(3);
    expect(result.files.some(entry=>entry.uri.includes("UnlistedShadow"))).toBe(false);
    expect((await searchFiles(store,{scope:base,text:"mountedprobe",subfolders:true}))
      .files.some(entry=>entry.uri.includes("UnlistedShadow"))).toBe(true);
  });
  it("respects sub=0 independently for each disk; an explicit folder remains a single-root search",async()=>{
    const {store,volume}=await mountedFixture();
    const roots=sourceMountedSearchRoots(volume);
    const shallow=await search(store,roots,{subfolders:false});
    expect(shallow.files.map(e=>e.name).sort()).toEqual([
      "MountedProbeC.txt","MountedProbeD.txt"
    ]);
    expect(shallow.progress.foldersScanned).toBe(2);
    const scoped=await searchFiles(store,{
      scope:base+"/drive1/Reports",text:"mountedprobe",subfolders:true
    });
    expect(scoped.files.map(e=>e.name)).toEqual(["MountedProbeNested.txt"]);
  });
  it("restricts stale/unmounted disks and never fabricates a root when no disk is supplied",async()=>{
    const {store}=await mountedFixture();
    const onlyC=new LegacyVolumeSession(store,{...runtime,disks:[runtime.disks[0]]});
    expect(sourceMountedSearchRoots(onlyC)).toEqual([base+"/drive0"]);
    expect((await search(store,sourceMountedSearchRoots(onlyC))).files
      .map(e=>e.name)).toEqual(["MountedProbeC.txt"]);
    expect(sourceMountedSearchRoots(null)).toEqual([]);
    const noDisks=new LegacyVolumeSession(store,{...runtime,disks:[]});
    expect(sourceMountedSearchRoots(noDisks)).toEqual([]);
    const none=await search(store,sourceMountedSearchRoots(noDisks));
    expect(none).toMatchObject({files:[],progress:{foldersScanned:0,
      filesScanned:0,matches:0},truncated:false});
  });
  it("validates every disk before walking and rejects missing, non-directory or overlapping roots",async()=>{
    const {store}=await mountedFixture();
    await expect(search(store,[base+"/drive0",base+"/missing"]))
      .rejects.toMatchObject({code:"ENOENT"});
    await expect(search(store,[base+"/drive0/MountedProbeC.txt"]))
      .rejects.toMatchObject({code:"ENOTDIR"});
    await expect(search(store,[base+"/drive1",base+"/drive1/Reports"]))
      .rejects.toMatchObject({code:"EINVAL"});
    const count=await search(store,[base+"/drive0",base+"/drive0"]);
    expect(count.files.map(e=>e.name)).toEqual(["MountedProbeC.txt"]);
    const abort=new AbortController();
    abort.abort();
    await expect(searchFiles(store,{scope:base,rootScopes:[]},{signal:abort.signal}))
      .rejects.toMatchObject({name:"AbortError"});
  });
  it("globally ranks across drives before applying the source result cap",async()=>{
    const {store,volume}=await mountedFixture();
    await store.write("p",base+"/drive0/Report-start.txt");
    await store.write("p",base+"/drive1/Report");
    const result=await searchFiles(store,{
      scope:base,rootScopes:sourceMountedSearchRoots(volume),
      text:"report",sourceRanked:true,subfolders:true,maxResults:1
    });
    expect(result.files.map(e=>e.name)).toEqual(["Report"]);
    expect(result.truncated).toBe(true);
    expect(result.progress.matches).toBe(3);
  });
});
