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
