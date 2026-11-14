import type {SnipRectangle} from "./model";
import {clampSnipRect} from "./model";

/** Local, permission-free DOM rasterizer corresponding to the pinned
 * snipping.js domToImage(this.rootEl). No browser privileges, remote API,
 * hidden tab capture or host screenshot permission are assumed.
 *
 * Chromium can render SVG foreignObject with inlined CSS and data images.
 * Cross-origin frames, video, pseudo-elements and tainted canvases may not
 * render faithfully. Fail visibly if the browser cannot produce a canvas.
 */
export async function captureDesktop(root:HTMLElement,requested?:SnipRectangle):Promise<HTMLCanvasElement>{
  const box=root.getBoundingClientRect();
  const width=Math.max(1,Math.ceil(box.width)),height=Math.max(1,Math.ceil(box.height));
  const area=requested?clampSnipRect(requested,{width,height}):{x:0,y:0,width,height};
  if(area.width<=0||area.height<=0)throw new Error("The selected snip is empty");
  const clone=root.cloneNode(true) as HTMLElement;
  const originals=[root,...Array.from(root.querySelectorAll("*"))];
  const copies=[clone,...Array.from(clone.querySelectorAll("*"))];
  const cached=new Map<string,Promise<string>>();
  const embed=async(link:string):Promise<string>=>{
    if(/^(data:|#)/i.test(link))return link;
    const full=new URL(link,document.baseURI);
    if(full.origin!==window.location.origin)return "";
    let task=cached.get(full.href);
    if(!task){
      task=(async()=>{
        const response=await fetch(full.href,{credentials:"same-origin"});
        if(!response.ok)throw new Error("Image asset unavailable");
        const blob=await response.blob();
        return new Promise<string>((resolve,reject)=>{
          const reader=new FileReader();
          reader.onload=()=>resolve(String(reader.result));
          reader.onerror=()=>reject(new Error("Cannot embed image asset"));
          reader.readAsDataURL(blob);
        });
      })();
      cached.set(full.href,task);
    }
    return task;
  };
  for(let i=0;i<originals.length;i++){
    const src=originals[i],dest=copies[i];
    if(!(src instanceof Element)||!(dest instanceof Element))continue;
    const computed=getComputedStyle(src);
    const style=(dest as HTMLElement|SVGElement).style;
    for(let j=0;j<computed.length;j++){
      const property=computed[j];
      style.setProperty(property,computed.getPropertyValue(property),computed.getPropertyPriority(property));
    }
    const bg=computed.backgroundImage;
    if(bg&&bg!=="none"&&bg.includes("url(")){
      const matches=[...bg.matchAll(/url\((?:"|')?([^"'()]+)(?:"|')?\)/g)];
      let rewritten=bg;
      for(const match of matches){
        let url="";
        try{url=await embed(match[1]);}catch{/* explicit missing/blocked image */}
        rewritten=rewritten.replace(match[0],url?'url("'+url+'")':"none");
      }
      style.setProperty("background-image",rewritten);
    }
    if(src instanceof HTMLImageElement&&dest instanceof HTMLImageElement){
      try{dest.src=await embed(src.currentSrc||src.src);}catch{dest.removeAttribute("src");}
    }
    if(src instanceof HTMLCanvasElement){
      try{
        const canvas=document.createElement("img");
        canvas.setAttribute("xmlns","http://www.w3.org/1999/xhtml");
        canvas.src=src.toDataURL("image/png");
        canvas.style.cssText=style.cssText;
        dest.replaceWith(canvas);
      }catch{/* tainted media is excluded rather than leaking content */}
    }
    if(src instanceof HTMLInputElement&&dest instanceof HTMLInputElement){
      dest.setAttribute("value",src.value);
      if(src.checked)dest.setAttribute("checked","checked");
      else dest.removeAttribute("checked");
    }
    if(src instanceof HTMLTextAreaElement&&dest instanceof HTMLTextAreaElement)
      dest.textContent=src.value;
  }
  clone.style.position="relative";
  clone.style.left="0";
  clone.style.top="0";
  clone.style.margin="0";
  clone.style.width=width+"px";
  clone.style.height=height+"px";
  clone.style.transform="none";
  const xml=new XMLSerializer().serializeToString(clone);
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+
    '" viewBox="0 0 '+width+' '+height+'"><foreignObject x="0" y="0" width="100%" height="100%">'+
    xml+"</foreignObject></svg>";
  const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}));
  try{
    const image=new Image();
    await new Promise<void>((resolve,reject)=>{
      image.onload=()=>resolve();
      image.onerror=()=>reject(new Error("Browser cannot render the desktop snip"));
      image.src=url;
    });
    const output=document.createElement("canvas");
    output.width=Math.ceil(area.width);output.height=Math.ceil(area.height);
    const ctx=output.getContext("2d");
    if(!ctx)throw new Error("Canvas capture is not available");
    ctx.drawImage(image,area.x,area.y,area.width,area.height,0,0,area.width,area.height);
    // Explicitly reject tainted captures now, before offering Save.
    output.toDataURL("image/png");
    return output;
  }finally{URL.revokeObjectURL(url);}
}
