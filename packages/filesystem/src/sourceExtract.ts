import {unzipSync} from "fflate";
import {
  FileStoreError, getParentDirectory, normalizeFileUri, type VirtualFileStore
} from "./index";
import {
  SOURCE_GUEST_ZIP_MAX_BYTES, SOURCE_GUEST_ZIP_MAX_DEPTH,
  SOURCE_GUEST_ZIP_MAX_ITEMS
} from "./sourceArchive";
import {SOURCE_COMPUTER_ROOT} from "./sourceGuest";

/**
 * Pinned legacy-win7 main.js ExplorerItemMenu "Extract here" invokes the
 * source extractHere(path) handler. Only genuine ZIP files inside the mounted
 * Guest VFS are supported in this slice. RAR/7z/tar/gz remain disabled.
 * No host path, silent overwrite, partial extraction or traversal is allowed.
 */
type ExtractStore=Pick<VirtualFileStore,
  "stat"|"readBytes"|"createTreeAtomic">;
type TreeMember=
  | {path:string;type:"directory"}
  | {path:string;type:"file";content:Uint8Array};

export function sourceCanExtractGuestZip(folder:string,archivePath:string):boolean{
  try{
    return folder.startsWith(SOURCE_COMPUTER_ROOT+"/") &&
      folder===normalizeFileUri(folder) &&
      archivePath===normalizeFileUri(archivePath) &&
      getParentDirectory(archivePath)===folder &&
      /\.zip$/i.test(archivePath);
  }catch{return false;}
}

function safeZipName(name:string):{parts:string[];directory:boolean}{
  const directory=name.endsWith("/");
  if(!name || name.startsWith("/") || name.includes("\\") ||
     /[\x00-\x1f\x7f:]/.test(name)){
    throw new FileStoreError("EINVAL","Unsafe ZIP member path");
  }
  const parts=name.split("/");
  if(directory)parts.pop();
  if(!parts.length || parts.length>SOURCE_GUEST_ZIP_MAX_DEPTH ||
     parts.some(part=>!part || part==="." || part===".." || /[. ]$/.test(part) ||
       ["__proto__","constructor","prototype"].includes(part.toLowerCase()))){
    throw new FileStoreError("EINVAL","Unsafe ZIP member nesting");
  }
  return {parts,directory};
}

export async function extractSourceGuestZip(
  store:ExtractStore,folder:string,archivePath:string
):Promise<string[]>{
  if(!sourceCanExtractGuestZip(folder,archivePath)){
    throw new FileStoreError("EINVAL","Choose a ZIP in the mounted Guest folder");
  }
  const destination=await store.stat(folder);
  const archive=await store.stat(archivePath);
  if(destination?.type!=="directory" || !archive || archive.type!=="file" ||
     archive.originalPath){
    throw new FileStoreError("ENOENT","Guest ZIP or destination is unavailable");
  }
  if(archive.size>SOURCE_GUEST_ZIP_MAX_BYTES){
    throw new FileStoreError("EINVAL","Guest ZIP is over the 32 MiB safety limit");
  }
  const bytes=await store.readBytes(archivePath);
  if(bytes.byteLength>SOURCE_GUEST_ZIP_MAX_BYTES){
    throw new FileStoreError("EINVAL","Guest ZIP is over the 32 MiB safety limit");
  }

  let count=0,totalBytes=0;
  const seenZipEntries=new Set<string>();
  // fflate's filter visits ZIP metadata before inflating the member. Reject
  // archive bombs by limiting claimed uncompressed bytes before allocation.
  const extracted=unzipSync(bytes,{filter:info=>{
    if(++count>SOURCE_GUEST_ZIP_MAX_ITEMS){
      throw new FileStoreError("EINVAL","ZIP item count safety limit exceeded");
    }
    const {parts,directory}=safeZipName(info.name);
    const key=parts.join("/").toLowerCase();
    if(seenZipEntries.has(key)){
      throw new FileStoreError("EEXIST","Duplicate ZIP member name");
    }
    seenZipEntries.add(key);
    if(!directory){
      if(!Number.isSafeInteger(info.originalSize) || info.originalSize<0 ||
         totalBytes+info.originalSize>SOURCE_GUEST_ZIP_MAX_BYTES){
        throw new FileStoreError("EINVAL","ZIP expansion safety limit exceeded");
      }
      totalBytes+=info.originalSize;
    }
    return true;
  }});
  const tree=new Map<string,TreeMember>();
  const lowerNames=new Map<string,string>();
  let actualBytes=0;

  function stageDirectory(parts:readonly string[]):void{
    const relative=parts.join("/");
    const key=relative.toLowerCase();
    const existing=lowerNames.get(key);
    if(existing && existing!==relative){
      throw new FileStoreError("EEXIST","ZIP includes ambiguous folder names");
    }
    const prior=tree.get(relative);
    if(prior?.type==="file"){
      throw new FileStoreError("EEXIST","ZIP file/directory path conflict");
    }
    if(!prior)tree.set(relative,{path:folder+"/"+relative,type:"directory"});
    lowerNames.set(key,relative);
  }

  for(const [name,content] of Object.entries(extracted)){
    const {parts,directory}=safeZipName(name);
    for(let i=1;i<parts.length;i++)stageDirectory(parts.slice(0,i));
    if(directory){
      stageDirectory(parts);
      continue;
    }
    const relative=parts.join("/");
    const key=relative.toLowerCase();
    if(lowerNames.has(key)){
      throw new FileStoreError("EEXIST","ZIP file/directory name collision");
    }
    actualBytes+=content.byteLength;
    if(actualBytes>SOURCE_GUEST_ZIP_MAX_BYTES){
      throw new FileStoreError("EINVAL","ZIP expansion safety limit exceeded");
    }
    tree.set(relative,{path:folder+"/"+relative,type:"file",content});
    lowerNames.set(key,relative);
  }
  if(!tree.size)throw new FileStoreError("EINVAL","The ZIP contains no files");
  if(tree.size>SOURCE_GUEST_ZIP_MAX_ITEMS){
    throw new FileStoreError("EINVAL","ZIP extracted tree safety limit exceeded");
  }
  // A single create-only VFS transaction covers implicit folders, explicit
  // empty folders and exact binary contents; no user file can be overwritten.
  await store.createTreeAtomic([...tree.values()]);
  const roots=[...new Set([...tree.keys()].map(name=>name.split("/")[0]))];
  return roots.map(name=>folder+"/"+name);
}
