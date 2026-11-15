import {zipSync,unzipSync} from "fflate";
import {FileStoreError,getParentDirectory,type VirtualFileStore} from "./index";
import {SOURCE_GUEST_PROFILE} from "./sourceGuest";

/**
 * Pinned legacy-win7@4e63290d src/modules/chunks/
 * shared~plugin-embed~sandbox~system-cache~vue-app~vue-store.js, f106.
 * Ie/je in src/modules/apps/cpanel.js use this exact folder order.
 */
export const SOURCE_BACKUP_FOLDERS=[
  "Desktop","Downloads","Documents","Music","Pictures","Videos","AppData"
] as const;
export const SOURCE_BACKUP_MAX_FILES=5000;
export const SOURCE_BACKUP_MAX_BYTES=25*1024*1024;
const MAX_ARCHIVE_BYTES=30*1024*1024;
const MANIFEST="manifest.json";
const SOURCE="win7-simu";
const encoder=new TextEncoder();

export interface SourceBackupManifest{
  createdAt:string;
  target:"all";
  folders:readonly string[];
  fileCount:number;
  source:"win7-simu";
}
export interface SourceBackupProgress{
  operation:"backup"|"restore";
  phase:"start"|"processing"|"done";
  current:number;
  total:number;
  percent:number;
  message:string;
  restored?:number;
  skipped?:number;
}
type Progress=(event:SourceBackupProgress)=>void;
type SourceBackupStore=Pick<VirtualFileStore,
  "list"|"readBytes"|"stat"|"mkdir"|"createFilesAtomic">;
interface ArchiveEntry{
  name:string;
  data:Uint8Array;
}
/** Original 0e9a text/shortcut extension classifiers (u and l). */
export function sourceBackupTextFile(name:string):boolean{
  return /\.(?:txt|text|readme|md|json|xml|rtf|wpl|lnk)$/i.test(name);
}
function fail(message:string):never{
  throw new Error("Invalid backup file ("+message+").");
}
function report(
  callback:Progress|undefined,operation:SourceBackupProgress["operation"],
  phase:SourceBackupProgress["phase"],current:number,total:number,
  message:string,counts?:{restored:number;skipped:number}
):void{
  callback?.({operation,phase,current,total,
    percent:total>0?Math.round(current/total*100):0,message,...counts});
}
function isAllowedFolder(name:string):boolean{
  return SOURCE_BACKUP_FOLDERS.some(folder=>folder===name);
}
/** Resolve paths before VFS normalizeFileUri: it intentionally collapses "..".
 * ZIP inputs must reject traversal instead of normalizing it away. */
export function sourceBackupDestination(name:string):string{
  if(!name||name.startsWith("/")||name.includes("\\")||
    /[\u0000-\u001f\u007f]/.test(name)||name.includes(":"))fail("unsafe path");
  const path=name.endsWith("/")?name.slice(0,-1):name;
  const segments=path.split("/");
  if(segments.some(part=>!part||part==="."||part==="..")||
    !isAllowedFolder(segments[0]))fail("unsafe path");
  return SOURCE_GUEST_PROFILE+"/"+path;
}
function manifestFrom(data:Uint8Array):SourceBackupManifest{
  if(data.length>65536)fail("manifest too large");
  let value:unknown;
  try{value=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(data));}
  catch{fail("missing manifest");}
  if(!value||typeof value!=="object")fail("invalid manifest");
  const m=value as Record<string,unknown>;
  if(m.source!==SOURCE||m.target!=="all"||
    !Array.isArray(m.folders)||m.folders.length!==SOURCE_BACKUP_FOLDERS.length||
    m.folders.some((item,index)=>item!==SOURCE_BACKUP_FOLDERS[index])||
    typeof m.createdAt!=="string"||!Number.isFinite(Date.parse(m.createdAt))||
    typeof m.fileCount!=="number"||!Number.isSafeInteger(m.fileCount)||
    m.fileCount<0||m.fileCount>SOURCE_BACKUP_MAX_FILES)fail("invalid manifest");
  return m as unknown as SourceBackupManifest;
}

/**
 * Before calling the vetted ZIP codec, check central directory/local headers
 * for bounded sizes, supported methods, paths, case collisions and symlinks.
 * This avoids decompressing an untrusted ZIP bomb or traversing the profile.
 */
function inspectArchive(bytes:Uint8Array):{name:string;size:number;crc:number}[]{
  if(bytes.byteLength>MAX_ARCHIVE_BYTES||bytes.byteLength<22)fail("archive size");
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const u16=(at:number)=>view.getUint16(at,true);
  const u32=(at:number)=>view.getUint32(at,true);
  let end=-1;
  for(let at=bytes.length-22;at>=Math.max(0,bytes.length-65557);at--){
    if(u32(at)===0x06054b50&&at+22+u16(at+20)===bytes.length){
      end=at;break;
    }
  }
  if(end<0)fail("missing ZIP directory");
  const total=u16(end+10),length=u32(end+12),offset=u32(end+16);
  if(u16(end+4)!==0||u16(end+6)!==0||u16(end+8)!==total||
    total>SOURCE_BACKUP_MAX_FILES+1||total===0||
    length===0xffffffff||offset===0xffffffff||
    offset+length>end)fail("ZIP directory");
  const entries:{name:string;size:number;crc:number}[]=[];
  const seen=new Set<string>();
  const ranges:{start:number;end:number}[]=[];
  let position=offset,totalBytes=0,manifestCount=0;
  const decoder=new TextDecoder("utf-8",{fatal:true});
  for(let i=0;i<total;i++){
    if(position+46>offset+length||u32(position)!==0x02014b50)
      fail("ZIP entry header");
    const flags=u16(position+8),method=u16(position+10);
    const crc=u32(position+16),compressed=u32(position+20),size=u32(position+24);
    const nameLength=u16(position+28),extra=u16(position+30),comment=u16(position+32);
    const attributes=u32(position+38),localOffset=u32(position+42);
    const next=position+46+nameLength+extra+comment;
    if(next>offset+length||(flags&1)!==0||(method!==0&&method!==8)||
      size===0xffffffff||compressed===0xffffffff||
      localOffset===0xffffffff)fail("unsupported ZIP entry");
    // UNIX symlink 0120000; no archive may redirect a Guest destination.
    if((((attributes>>>16)&0xf000)===0xa000))fail("ZIP symlink");
    let name:string;
    try{name=decoder.decode(bytes.subarray(position+46,position+46+nameLength));}
    catch{fail("ZIP entry encoding");}
    if(!name||name==="manifest.json/"||name.startsWith("/")||
      name.includes("\\"))fail("unsafe path");
    if(name!==MANIFEST)sourceBackupDestination(name);
    else manifestCount++;
    const key=name.replace(/\/$/,"").toLocaleLowerCase();
    if(seen.has(key))fail("duplicate path");
    seen.add(key);
    if(size>SOURCE_BACKUP_MAX_BYTES||compressed>MAX_ARCHIVE_BYTES||
      totalBytes+size>SOURCE_BACKUP_MAX_BYTES+65536)fail("expanded size");
    totalBytes+=size;
    if(localOffset+30>offset||u32(localOffset)!==0x04034b50||
      u16(localOffset+8)!==method)fail("ZIP local header");
    const localNameLength=u16(localOffset+26);
    const localExtra=u16(localOffset+28);
    const dataStart=localOffset+30+localNameLength+localExtra;
    if(localNameLength!==nameLength||
      dataStart+compressed>offset||
      !bytes.subarray(localOffset+30,localOffset+30+nameLength)
        .every((b,j)=>b===bytes[position+46+j]))fail("ZIP local entry");
    ranges.push({start:localOffset,end:dataStart+compressed});
    entries.push({name,size,crc});
    position=next;
  }
  if(position!==offset+length||manifestCount!==1)
    fail(manifestCount?"ZIP directory":"missing manifest");
  ranges.sort((a,b)=>a.start-b.start);
  if(ranges.some((range,index)=>index>0&&range.start<ranges[index-1].end))
    fail("overlapping ZIP entries");
  return entries;
}
function checksum(bytes:Uint8Array):number{
  let crc=0xffffffff;
  for(const byte of bytes){
    crc^=byte;
    for(let bit=0;bit<8;bit++)crc=crc&1?(crc>>>1)^0xedb88320:crc>>>1;
  }
  return (crc^0xffffffff)>>>0;
}
export function sourceParseBackupArchive(bytes:Uint8Array):{
  manifest:SourceBackupManifest;files:ArchiveEntry[]
}{
  const headers=inspectArchive(bytes);
  let unpacked:Record<string,Uint8Array>;
  try{unpacked=unzipSync(bytes);}
  catch{fail("unreadable ZIP entries");}
  const files:ArchiveEntry[]=[];
  let manifest:SourceBackupManifest|undefined;
  for(const header of headers){
    const data=Object.prototype.hasOwnProperty.call(unpacked,header.name)
      ?unpacked[header.name]:undefined;
    if(!data||data.length!==header.size||checksum(data)!==header.crc)
      fail("corrupt ZIP data");
    if(header.name===MANIFEST)manifest=manifestFrom(data);
    else if(!header.name.endsWith("/"))files.push({name:header.name,data});
  }
  if(!manifest)fail("missing manifest");
  if(files.length>manifest.fileCount)fail("invalid manifest");
  return {manifest,files};
}

/** Original Ie visits only the seven known profile folders recursively,
 * archiving files (not arbitrary installed program binaries or host files). */
export async function sourceCreateBackupArchive(
  filesystem:Pick<SourceBackupStore,"list"|"readBytes">,
  options:{now?:Date;onProgress?:Progress}={}
):Promise<{name:string;archive:Uint8Array;manifest:SourceBackupManifest;size:number}>{
  const now=options.now??new Date();
  const payload:Record<string,Uint8Array>=Object.create(null);
  const files:{name:string;uri:string;size:number}[]=[];
  const visit=async(path:string,base:string,depth:number):Promise<void>=>{
    if(depth>32)throw new Error("Backup folder depth exceeds the safety limit");
    let entries:Awaited<ReturnType<typeof filesystem.list>>;
    try{entries=await filesystem.list(path);}
    catch(error){
      if(error instanceof FileStoreError&&error.code==="ENOENT")return;
      throw error;
    }
    for(const entry of entries){
      const name=base+"/"+entry.name;
      sourceBackupDestination(name);
      if(entry.type==="directory")await visit(entry.uri,name,depth+1);
      else{
        if(files.length>=SOURCE_BACKUP_MAX_FILES)
          throw new Error("Backup file count exceeds the safety limit");
        files.push({name,uri:entry.uri,size:entry.size});
      }
    }
  };
  for(const folder of SOURCE_BACKUP_FOLDERS)
    await visit(SOURCE_GUEST_PROFILE+"/"+folder,folder,0);
  const manifest:SourceBackupManifest={
    createdAt:now.toISOString(),target:"all",folders:[...SOURCE_BACKUP_FOLDERS],
    fileCount:files.length,source:SOURCE
  };
  report(options.onProgress,"backup","start",0,files.length,"Preparing backup");
  let size=0;
  for(let i=0;i<files.length;i++){
    const file=files[i];
    report(options.onProgress,"backup","processing",i,files.length,"Backing up "+file.name);
    const bytes=await filesystem.readBytes(file.uri);
    size+=bytes.byteLength;
    if(size>SOURCE_BACKUP_MAX_BYTES)throw new Error("Backup exceeds the safety size limit");
    payload[file.name]=bytes;
    report(options.onProgress,"backup","processing",i+1,files.length,"Processed "+file.name);
  }
  payload[MANIFEST]=encoder.encode(JSON.stringify(manifest,null,2));
  report(options.onProgress,"backup","processing",files.length,files.length,
    "Finalizing backup archive");
  // ZIP store method is standards-compliant and readable by original je.
  const archive=zipSync(payload,{level:0});
  if(archive.byteLength>MAX_ARCHIVE_BYTES)
    throw new Error("Backup archive exceeds the safety size limit");
  report(options.onProgress,"backup","done",files.length,files.length,"Backup completed");
  return {name:"win7simu-backup-"+now.getTime()+".zip",archive,manifest,size};
}

/** Fully inspect the untrusted archive before any writes. Existing Guest files
 * are skipped, and new files use create-only VFS operations—not writeBytes. */
export async function sourceRestoreBackupArchive(
  filesystem:Pick<SourceBackupStore,"stat"|"mkdir"|"createFilesAtomic">,
  archive:Uint8Array,options:{onProgress?:Progress}={}
):Promise<{restored:number;skipped:number}>{
  report(options.onProgress,"restore","start",0,0,"Preparing restore");
  const {files}=sourceParseBackupArchive(archive);
  let restored=0,skipped=0;
  const fresh:{path:string;content:string|Uint8Array}[]=[];
  for(let i=0;i<files.length;i++){
    const file=files[i],path=sourceBackupDestination(file.name);
    const exists=await filesystem.stat(path);
    if(exists)skipped++;
    else fresh.push({path,content:sourceBackupTextFile(file.name)
      ?new TextDecoder().decode(file.data):file.data});
    report(options.onProgress,"restore","processing",i+1,files.length,
      (exists?"Skipped ":"Restoring ")+file.name,{restored,skipped});
  }
  // Make only ancestors inside the Guest profile, never drive roots.
  const parents=new Set<string>();
  for(const file of fresh){
    let parent=getParentDirectory(file.path);
    while(parent!==SOURCE_GUEST_PROFILE){
      if(!parent.startsWith(SOURCE_GUEST_PROFILE+"/"))
        fail("unsafe path");
      parents.add(parent);
      parent=getParentDirectory(parent);
    }
  }
  // Preflight every required directory before the first filesystem write.
  // An invalid ZIP with a file occupying another entry's parent must not
  // leave partly-created directories behind.
  const targetNames=new Set(fresh.map(file=>file.path.toLocaleLowerCase()));
  const orderedParents=[...parents].sort((a,b)=>
    a.split("/").length-b.split("/").length);
  const missingParents:string[]=[];
  for(const path of orderedParents){
    if(targetNames.has(path.toLocaleLowerCase()))
      fail("file and folder collision");
    const existing=await filesystem.stat(path);
    if(existing?.type==="file")throw new Error("Restore parent is a file: "+path);
    if(!existing)missingParents.push(path);
  }
  for(const path of missingParents)await filesystem.mkdir(path);
  if(fresh.length)await filesystem.createFilesAtomic(fresh);
  restored=fresh.length;
  report(options.onProgress,"restore","done",files.length,files.length,
    "Restore completed",{restored,skipped});
  return {restored,skipped};
}
