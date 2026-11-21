import {zipSync, type Zippable} from "fflate";
import {
  FileStoreError, getFileName, getParentDirectory, normalizeFileUri,
  type VirtualFileStore
} from "./index";
import {SOURCE_COMPUTER_ROOT} from "./sourceGuest";

/**
 * Frozen legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776:
 * src/modules/system/main.js ExplorerItemMenu -> Send to ->
 * Compressed (zipped) folder invokes compress(this.paths).
 *
 * This is a bounded **Guest VFS only** implementation of that existing
 * source command. Never read browser/host filesystem paths, overwrite a
 * destination, or publish a partial archive if any source cannot be read.
 */
export const SOURCE_GUEST_ZIP_MAX_BYTES=32*1024*1024;
export const SOURCE_GUEST_ZIP_MAX_ITEMS=2048;
export const SOURCE_GUEST_ZIP_MAX_DEPTH=64;
type ArchiveStore=Pick<VirtualFileStore,
  "stat"|"list"|"readBytes"|"createFilesAtomic">;

export function sourceCanCompressSelection(folder:string,paths:readonly string[]):boolean{
  if(!folder.startsWith(SOURCE_COMPUTER_ROOT+"/")||!paths.length)return false;
  try {
    if(folder!==normalizeFileUri(folder))return false;
    return paths.every(path=>
      path===normalizeFileUri(path)&&getParentDirectory(path)===folder);
  }catch{return false;}
}

export async function createSourceGuestArchive(
  store:ArchiveStore,folder:string,paths:readonly string[]
):Promise<string>{
  const selected=[...new Set(paths)];
  if(!sourceCanCompressSelection(folder,selected))
    throw new FileStoreError("EINVAL","Select items within one mounted Guest folder");
  const folderItem=await store.stat(folder);
  if(folderItem?.type!=="directory")
    throw new FileStoreError("ENOTDIR","Archive destination is not a Guest folder");
  const entries:Zippable={};
  let count=0,totalBytes=0;
  const visited=new Set<string>();
  async function collect(path:string,relative:string,depth:number):Promise<void>{
    if(depth>SOURCE_GUEST_ZIP_MAX_DEPTH)
      throw new FileStoreError("EINVAL","Archive directory nesting limit exceeded");
    if(visited.has(path))return;
    visited.add(path);
    if(++count>SOURCE_GUEST_ZIP_MAX_ITEMS)
      throw new FileStoreError("EINVAL","Archive item count limit exceeded");
    const item=await store.stat(path);
    if(!item||item.originalPath||path!==normalizeFileUri(path))
      throw new FileStoreError("ENOENT","Archive source item is unavailable");
    if(item.type==="directory"){
      entries[relative+"/"]=new Uint8Array(0);
      const children=await store.list(path);
      for(const child of children){
        if(getParentDirectory(child.uri)!==path||child.name!==getFileName(child.uri))
          throw new FileStoreError("EINVAL","Invalid Guest archive entry path");
        await collect(child.uri,relative+"/"+child.name,depth+1);
      }
    }else{
      if(totalBytes+item.size>SOURCE_GUEST_ZIP_MAX_BYTES)
        throw new FileStoreError("EINVAL","Guest ZIP exceeds the 32 MiB safety limit");
      const bytes=await store.readBytes(path);
      totalBytes+=bytes.byteLength;
      if(totalBytes>SOURCE_GUEST_ZIP_MAX_BYTES)
        throw new FileStoreError("EINVAL","Guest ZIP exceeds the 32 MiB safety limit");
      entries[relative]=bytes;
    }
  }
  for(const path of selected)await collect(path,getFileName(path),0);
  // The source creates a ZIP in the current directory. Use one file's
  // stem or Archive for multiple items, preserving existing names and
  // allocating a non-overwriting suffix before the atomic Guest write.
  const first=getFileName(selected[0]);
  const single=selected.length===1;
  const rootItem=await store.stat(selected[0]);
  const stem=single
    ?rootItem?.type==="file" ? first.replace(/\.[^.]+$/,"") :first
    :"Archive";
  const base=(stem.replace(/[\\/:*?"<>|\x00-\x1f]/g,"").trim()||"Archive")
    .slice(0,140);
  const taken=new Set((await store.list(folder)).map(item=>item.name.toLowerCase()));
  let destination="";
  for(let index=1;index<=9999;index++){
    const name=base+(index===1?"":" ("+index+")")+".zip";
    if(!taken.has(name.toLowerCase())){destination=folder+"/"+name;break;}
  }
  if(!destination)
    throw new FileStoreError("EEXIST","No available ZIP file name");
  const bytes=zipSync(entries,{level:6});
  await store.createFilesAtomic([{path:destination,content:bytes}]);
  return destination;
}
