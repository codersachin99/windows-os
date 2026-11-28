import {sourceNotificationInline} from "@windows-os/sdk";

/** Shared safe React projection of inline notification tokens. */
export function SourceNotificationInline({body,onOpen}:{body:string;onOpen?:()=>void}){
  return <>{sourceNotificationInline(body).map((part,i)=>{
    switch(part.kind){
      case "link":return <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" onClick={onOpen}>{part.text}</a>;
      case "strong":return <strong key={i}>{part.text}</strong>;
      case "em":return <em key={i}>{part.text}</em>;
      case "del":return <del key={i}>{part.text}</del>;
      case "code":return <code key={i}>{part.text}</code>;
      default:return part.text;
    }
  })}</>;
}
