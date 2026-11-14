/** Original legacy-win7/src/modules/apps/plugin-embed.js
 * webpack bcdb (message protocol) + 2636 (web_ prefix).
 *
 * The legacy plugin did nothing unless VUE_APP_EMBED_ORIGINS was configured.
 * Our VITE_EMBED_ORIGINS is likewise empty by default.
 */
export const SOURCE_EMBED_VERSION="4.8.0" as const;
export const SOURCE_EMBED_PREFIX="web_" as const;
export type SourceEmbedCommand=
  |{type:"open";url:string;label:string;id:string}
  |{type:"close";id:string};

export function sourceEmbedOrigins(raw:string|undefined|null):readonly string[]{
  if(!raw)return [];
  const output=new Set<string>();
  for(const item of raw.split(",")){
    const origin=item.trim();
    if(!origin||origin==="*"||origin==="null")continue;
    try{
      const parsed=new URL(origin);
      // Source expected exact origins, not wildcards, paths or open redirects.
      if(!["http:","https:"].includes(parsed.protocol)||parsed.origin!==origin||
        parsed.username||parsed.password||parsed.search||parsed.hash)continue;
      output.add(origin);
    }catch{/* invalid configuration is ignored (never broadens permissions) */}
  }
  return [...output];
}

export function sourceEmbedUrl(raw:string):string|null{
  if(!/^https?:\/\/[^\s]+$/i.test(raw))return null;
  try{
    const url=new URL(raw);
    if(!["http:","https:"].includes(url.protocol)||!url.hostname||url.username||url.password)
      return null;
    return url.href;
  }catch{return null;}
}

/** Source 4caf.c strips extension and slugifies original title, then prefixes web_. */
export function sourceEmbedAppId(label:string):string{
  const stem=label.replace(/\.[a-z0-9]+$/i,"");
  const safe=stem.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80);
  return SOURCE_EMBED_PREFIX+(safe||"untitled");
}

export function sourceEmbedCommand(data:unknown):SourceEmbedCommand|null{
  if(!data||typeof data!=="object"||Array.isArray(data))return null;
  const object=data as Record<string,unknown>;
  if(object.type==="open"){
    const url=typeof object.url==="string"?sourceEmbedUrl(object.url.trim()):null;
    if(!url)return null;
    const title=typeof object.title==="string"?object.title.trim():"";
    const label=(title||new URL(url).host).slice(0,128);
    return {type:"open",url,label,id:sourceEmbedAppId(label)};
  }
  if(object.type==="close"){
    const id=typeof object.id==="string"?object.id.trim():"";
    // Close requests can operate ONLY on source-style web_ instances.
    return /^web_[a-z0-9](?:[a-z0-9-]{0,79})$/.test(id)?{type:"close",id}:null;
  }
  return null;
}

/** Source 99c7 supports both shorthand and nested window dimensions. */
export interface SourceWebAppDescriptor {
  key?:string;lbl?:string;w?:number;width?:number;h?:number;height?:number;
  resizable?:boolean;window?:{width?:number;height?:number;resizable?:boolean};
  target?:{path?:string};
}
export function sourceWebAppWindow(app:SourceWebAppDescriptor){
  return {
    width:app.w||app.width||app.window?.width||760,
    height:app.h||app.height||app.window?.height||520,
    resizable:app.resizable??app.window?.resizable??true
  };
}
