/**
 * Original computer.js.describe parses shortcut JSON for display independently
 * from executable launch validation. Its JSON parse failure uses icon=file.
 */
export function sourceShortcutIconValue(text:string):string|null{
  try{
    const source:unknown=JSON.parse(text);
    if(!source||typeof source!=="object"||Array.isArray(source))return null;
    const icon=(source as Record<string,unknown>).icon;
    return typeof icon==="string"&&icon.length>0?icon:null;
  }catch{
    return "file";
  }
}

/** One source-compatible reader for original text-backed .lnk JSON and
 * browser-uploaded UTF-8 binary Guest VFS entries. Invalid UTF-8 rejects
 * safely and never becomes an executable or an untrusted script.
 */
export async function readSourceShortcutText(
  store:{read(path:string):Promise<string>;readBytes(path:string):Promise<Uint8Array>},
  path:string
):Promise<string>{
  try{return await store.read(path);}
  catch{
    return new TextDecoder("utf-8",{fatal:true}).decode(await store.readBytes(path));
  }
}
