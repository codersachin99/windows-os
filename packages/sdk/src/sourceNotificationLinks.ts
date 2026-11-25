/** Restricted inline notification syntax, confirmed by frozen update-notification-body.
 * Deliberately does not interpret arbitrary HTML or full Markdown. */
export type SourceNotificationInlinePart={kind:"text";text:string}|{kind:"link";text:string;href:string};
export function sourceNotificationLinkUrl(value:string):string|undefined{
  if(!/^https?:\/\//i.test(value)||/[\s\u0000-\u001f\u007f\\]/.test(value))return undefined;
  try{
    const url=new URL(value);
    if((url.protocol!=="https:"&&url.protocol!=="http:")||!url.hostname||url.username||url.password)return undefined;
    return url.href;
  }catch{return undefined;}
}
export function sourceNotificationInline(value:string):SourceNotificationInlinePart[]{
  const parts:SourceNotificationInlinePart[]=[];
  const text=(value:string)=>{
    if(!value)return;
    const last=parts[parts.length-1];
    if(last?.kind==="text")last.text+=value;
    else parts.push({kind:"text",text:value});
  };
  const pattern=/\[([^\[\]\r\n]+)\]\(([^()\r\n]+)\)/g;
  let offset=0;
  for(const match of value.matchAll(pattern)){
    const start=match.index??0;
    text(value.slice(offset,start));
    const href=sourceNotificationLinkUrl(match[2]);
    if(href)parts.push({kind:"link",text:match[1],href});
    else text(match[0]);
    offset=start+match[0].length;
  }
  text(value.slice(offset));return parts;
}
