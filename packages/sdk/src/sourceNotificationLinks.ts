/** Safe subset of frozen 7c5c Marked.parseInline. No HTML or remote images. */
export type SourceNotificationInlinePart={kind:"text"|"strong"|"em"|"del"|"code";text:string}|{kind:"link";text:string;href:string};
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
  // Prioritize code and literal image syntax before link/emphasis tokens.
  const pattern=/(\x60[^\x60\r\n]+\x60)|(!?\[([^\[\]\r\n]+)\]\(([^()\r\n]+)\))|(<https?:\/\/[^<>\s]+>)|(\*\*[^*\r\n]+\*\*|__[^_\r\n]+__|~~[^~\r\n]+~~)|(\*[^*\r\n]+\*|_[^_\r\n]+_)/gi;
  let offset=0;
  for(const match of value.matchAll(pattern)){
    const start=match.index??0,raw=match[0];
    text(value.slice(offset,start));
    // A preceding escape is preserved rather than interpreting this token.
    const escaped=start>0&&value[start-1]==="\\";
    if(escaped||raw.startsWith("!["))text(raw);
    else if(match[1])parts.push({kind:"code",text:raw.slice(1,-1)});
    else if(match[2]||match[5]){
      const label=match[2]?match[3]:raw.slice(1,-1);
      const href=sourceNotificationLinkUrl(match[2]?match[4]:label);
      if(href)parts.push({kind:"link",text:label,href});
      else text(raw);
    }else if(match[6])parts.push({kind:raw.startsWith("~~")?"del":"strong",text:raw.slice(2,-2)});
    else if(match[7]){
      // Do not transform underscores inside ordinary identifiers.
      if(raw.startsWith("_")&&(/\w/.test(value[start-1]??"")||/\w/.test(value[start+raw.length]??"")))text(raw);
      else parts.push({kind:"em",text:raw.slice(1,-1)});
    }
    offset=start+raw.length;
  }
  text(value.slice(offset));return parts;
}
