import type {SnipRectangle} from "./model";
import {clampSnipRect} from "./model";

/**
 * Local HTML canvas screenshot of the current WindowsOS DOM.
 * Chromium taints Canvas2D when SVG foreignObject is rasterized (including
 * same-origin content), so exporting that approach produces SecurityError.
 * Paint the visible DOM directly onto Canvas2D instead: real CSS backgrounds,
 * browser layout text ranges, boxes, same-origin images and child canvases.
 *
 * Does NOT capture inaccessible cross-origin iframe pixels, native video,
 * CSS pseudo-elements/filters or all advanced transforms. Those remain
 * explicit source-parity gaps, never hidden behind synthetic image content.
 */
export async function captureDesktop(root:HTMLElement,requested?:SnipRectangle):Promise<HTMLCanvasElement>{
  const desktopRect=root.getBoundingClientRect();
  const width=Math.max(1,Math.ceil(desktopRect.width));
  const height=Math.max(1,Math.ceil(desktopRect.height));
  const area=requested?clampSnipRect(requested,{width,height}):{x:0,y:0,width,height};
  if(area.width<=0||area.height<=0)throw new Error("The selected snip is empty");
  const imageCache=new Map<string,Promise<HTMLImageElement|null>>();
  const imageFor=(path:string):Promise<HTMLImageElement|null>=>{
    let full:URL;
    try{full=new URL(path,document.baseURI);}catch{return Promise.resolve(null);}
    if(full.origin!==location.origin)return Promise.resolve(null);
    let cached=imageCache.get(full.href);
    if(!cached){
      cached=(async()=>{
        try{const img=new Image();img.src=full.href;await img.decode();return img;}
        catch{return null;}
      })();
      imageCache.set(full.href,cached);
    }
    return cached;
  };
  const canvas=document.createElement("canvas");
  canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("Browser Canvas2D is unavailable");
  const relative=(r:DOMRect|DOMRectReadOnly)=>({
    x:r.left-desktopRect.left,y:r.top-desktopRect.top,
    width:r.width,height:r.height
  });
  const fillBox=(x:number,y:number,w:number,h:number,color:string)=>{
    if(w<=0||h<=0||color==="transparent"||color==="rgba(0, 0, 0, 0)")return;
    ctx.fillStyle=color;ctx.fillRect(x,y,w,h);
  };
  const background=async(style:CSSStyleDeclaration,rect:ReturnType<typeof relative>)=>{
    const {x,y,width:w,height:h}=rect;
    fillBox(x,y,w,h,style.backgroundColor);
    const value=style.backgroundImage;
    if(!value||value==="none")return;
    const match=value.match(/url\((?:"|')?([^"'()]+)(?:"|')?\)/);
    if(match){
      const img=await imageFor(match[1]);
      if(img&&img.naturalWidth&&img.naturalHeight){
        ctx.save();
        ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
        const naturalWidth=img.naturalWidth,naturalHeight=img.naturalHeight;
        let dw=naturalWidth,dh=naturalHeight;
        const size=style.backgroundSize;
        if(size.includes("cover")||size.includes("contain")){
          const sx=w/naturalWidth,sy=h/naturalHeight;
          const scale=size.includes("cover")?Math.max(sx,sy):Math.min(sx,sy);
          dw=naturalWidth*scale;dh=naturalHeight*scale;
        }else if(size.includes("100%")){dw=w;dh=h;}
        const position=style.backgroundPosition;
        const dx=x+(position.startsWith("left")?0:(w-dw)/2);
        const dy=y+(position.includes("top")?0:(h-dh)/2);
        try{ctx.drawImage(img,dx,dy,dw,dh);}catch{/* browser denies */ }
        ctx.restore();
      }
      return;
    }
    if(value.includes("linear-gradient(")){
      const colors=value.match(/rgba?\([^)]+\)|#[0-9a-f]{3,8}/gi);
      if(colors&&colors.length>=2){
        const right=/90deg|to right/i.test(value);
        const gradient=ctx.createLinearGradient(x,y,right?x+w:x,right?y:y+h);
        gradient.addColorStop(0,colors[0]);
        gradient.addColorStop(1,colors[colors.length-1]);
        ctx.fillStyle=gradient;ctx.fillRect(x,y,w,h);
      }
    }
  };
  const borders=(style:CSSStyleDeclaration,rect:ReturnType<typeof relative>)=>{
    const {x,y,width:w,height:h}=rect;
    const edges=[
      {size:style.borderTopWidth,color:style.borderTopColor,x,y,w,h:0,direction:"top"},
      {size:style.borderBottomWidth,color:style.borderBottomColor,x,y:y+h,w,h:0,direction:"bottom"},
      {size:style.borderLeftWidth,color:style.borderLeftColor,x,y,w:0,h,direction:"left"},
      {size:style.borderRightWidth,color:style.borderRightColor,x:x+w,y,w:0,h,direction:"right"}
    ];
    for(const edge of edges){
      const size=parseFloat(edge.size);
      if(!Number.isFinite(size)||size<=0||edge.color==="transparent")continue;
      if(edge.direction==="top")fillBox(edge.x,edge.y,edge.w,size,edge.color);
      else if(edge.direction==="bottom")fillBox(edge.x,edge.y-size,edge.w,size,edge.color);
      else if(edge.direction==="left")fillBox(edge.x,edge.y,size,edge.h,edge.color);
      else fillBox(edge.x-size,edge.y,size,edge.h,edge.color);
    }
  };
  const drawText=(node:Text,style:CSSStyleDeclaration)=>{
    const text=node.textContent??"";
    if(!text.trim()||style.color==="transparent")return;
    ctx.font=style.font||[style.fontWeight,style.fontSize,style.fontFamily].join(" ");
    ctx.fillStyle=style.color;ctx.textBaseline="alphabetic";
    const re=/\S+/g;
    let match:RegExpExecArray|null;
    while((match=re.exec(text))){
      const range=document.createRange();
      range.setStart(node,match.index);
      range.setEnd(node,match.index+match[0].length);
      const rect=range.getBoundingClientRect();
      if(rect.width<=0||rect.height<=0)continue;
      const pos=relative(rect);
      let word=match[0];
      if(style.textTransform==="uppercase")word=word.toUpperCase();
      if(style.textTransform==="lowercase")word=word.toLowerCase();
      ctx.fillText(word,pos.x,pos.y+pos.height*0.81);
    }
  };
  const drawImageFit=async(node:HTMLImageElement|HTMLVideoElement,
    style:CSSStyleDeclaration,rect:ReturnType<typeof relative>)=>{
    if(rect.width<=0||rect.height<=0)return;
    let src:CanvasImageSource|null=null,nw=0,nh=0;
    if(node instanceof HTMLImageElement){
      const image=await imageFor(node.currentSrc||node.src);
      if(image){src=image;nw=image.naturalWidth;nh=image.naturalHeight;}
    }else if(node.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA){
      src=node;nw=node.videoWidth;nh=node.videoHeight;
    }
    if(!src||!nw||!nh)return;
    ctx.save();ctx.beginPath();ctx.rect(rect.x,rect.y,rect.width,rect.height);ctx.clip();
    let w=rect.width,h=rect.height;
    if(style.objectFit==="contain"||style.objectFit==="cover"){
      const sw=rect.width/nw,sh=rect.height/nh;
      const scale=style.objectFit==="contain"?Math.min(sw,sh):Math.max(sw,sh);
      w=nw*scale;h=nh*scale;
    }
    try{ctx.drawImage(src,rect.x+(rect.width-w)/2,rect.y+(rect.height-h)/2,w,h);}
    catch{/* protected media cannot be read */}
    ctx.restore();
  };
  const drawFormValue=(node:HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement,
    style:CSSStyleDeclaration,rect:ReturnType<typeof relative>)=>{
    if(node instanceof HTMLInputElement&&["checkbox","radio","range","color","hidden"].includes(node.type))return;
    const value=node instanceof HTMLSelectElement?
      (node.selectedOptions[0]?.textContent??""):node.value||(node instanceof HTMLInputElement?node.placeholder:"");
    if(!value)return;
    ctx.fillStyle=style.color;
    ctx.font=style.font||[style.fontWeight,style.fontSize,style.fontFamily].join(" ");
    ctx.textBaseline="middle";
    ctx.fillText(value,rect.x+(parseFloat(style.paddingLeft)||4),rect.y+rect.height/2);
  };
  const paint=async(node:Element):Promise<void>=>{
    const style=getComputedStyle(node);
    if(style.display==="none"||style.visibility==="hidden")return;
    const rect=relative(node.getBoundingClientRect());
    ctx.save();
    const alpha=parseFloat(style.opacity);
    if(Number.isFinite(alpha))ctx.globalAlpha*=Math.max(0,Math.min(1,alpha));
    await background(style,rect);
    borders(style,rect);
    if(node instanceof HTMLImageElement||node instanceof HTMLVideoElement){
      await drawImageFit(node,style,rect);
    }else if(node instanceof HTMLCanvasElement){
      try{ctx.drawImage(node,rect.x,rect.y,rect.width,rect.height);}catch{/* tainted content */}
    }else if(node instanceof HTMLInputElement||
      node instanceof HTMLTextAreaElement||node instanceof HTMLSelectElement){
      drawFormValue(node,style,rect);
    }else if(node instanceof SVGSVGElement){
      try{
        const markup=new XMLSerializer().serializeToString(node);
        const url=URL.createObjectURL(new Blob([markup],{type:"image/svg+xml"}));
        try{
          const svg=new Image();svg.src=url;await svg.decode();
          ctx.drawImage(svg,rect.x,rect.y,rect.width,rect.height);
        }finally{URL.revokeObjectURL(url);}
      }catch{/* unsupported nested SVG resource */}
    }else{
      const clip=/hidden|scroll|auto/.test(style.overflowX+" "+style.overflowY);
      if(clip&&rect.width>0&&rect.height>0){
        ctx.beginPath();ctx.rect(rect.x,rect.y,rect.width,rect.height);ctx.clip();
      }
      const children=Array.from(node.childNodes);
      children.sort((a,b)=>{
        if(!(a instanceof Element&&b instanceof Element))return 0;
        if(!a.classList.contains("windows-window")||!b.classList.contains("windows-window"))return 0;
        return (parseFloat(getComputedStyle(a).zIndex)||0)-(parseFloat(getComputedStyle(b).zIndex)||0);
      });
      for(const child of children){
        if(child instanceof Element)await paint(child);
        else if(child instanceof Text)drawText(child,style);
      }
    }
    ctx.restore();
  };
  await paint(root);
  canvas.toDataURL("image/png");
  if(!requested)return canvas;
  const cropped=document.createElement("canvas");
  cropped.width=Math.ceil(area.width);cropped.height=Math.ceil(area.height);
  const crop=cropped.getContext("2d");
  if(!crop)throw new Error("Unable to crop the desktop snip");
  crop.drawImage(canvas,area.x,area.y,area.width,area.height,0,0,area.width,area.height);
  cropped.toDataURL("image/png");
  return cropped;
}
