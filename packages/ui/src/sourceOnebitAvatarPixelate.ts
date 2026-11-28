/** Frozen legacy-win7@26b9f0ce7, webpack
 * src/modules/chunks/shared~cpanel~logon-onebit.js, modules a2e5/f830.
 * The original source renders the Guest img to a 24% canvas then maps
 * every opaque pixel to one of these four exact theme colors.
 */
export const SOURCE_ONEBIT_AVATAR_PALETTE=Object.freeze([
  [53,43,48],   // #352b30
  [230,212,191],// #e6d4bf
  [128,101,114],// #806572
  [170,152,131] // #aa9883
] as const);

export function sourceOnebitNearestPixel(
  rgb:readonly [number,number,number]
):readonly [number,number,number]{
  let best:readonly [number,number,number]=SOURCE_ONEBIT_AVATAR_PALETTE[0];
  let bestDistance=Infinity;
  for(const candidate of SOURCE_ONEBIT_AVATAR_PALETTE){
    const d=(rgb[0]-candidate[0])**2+
      (rgb[1]-candidate[1])**2+(rgb[2]-candidate[2])**2;
    // Original Pixelit chooses the later palette item on a tie.
    if(d<=bestDistance){bestDistance=d;best=candidate;}
  }
  return best;
}

/** Source Pixelit: draw image at 24% resolution with smoothing disabled,
 * restore it to the original dimensions, fit the BaseAvatar canvas size,
 * then quantize RGB without changing source alpha. Never use network APIs.
 * Fail safely to the ordinary original Guest image when canvas unsupported.
 */
export function sourceOnebitPixelateAvatar(
  img:HTMLImageElement,output:HTMLCanvasElement,size=64
):boolean{
  const width=img.naturalWidth||img.width;
  const height=img.naturalHeight||img.height;
  if(!width||!height)return false;
  const ctx=output.getContext("2d",{willReadFrequently:true});
  if(!ctx)return false;
  try{
    const scale=0.24;
    const small=document.createElement("canvas");
    small.width=width;small.height=height;
    const smallCtx=small.getContext("2d");
    if(!smallCtx)return false;
    smallCtx.drawImage(img,0,0,width*scale,height*scale);
    output.width=width;output.height=height;
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(small,0,0,width*scale,height*scale,0,0,width,height);

    // Original Pixelit.resizeImage uses the loaded image width/height and
    // whichever max limit requires scaling to the requested avatar size.
    let fit=1;
    if(width>size)fit=size/width;
    if(height>size)fit=size/height;
    if(fit<1){
      const original=document.createElement("canvas");
      original.width=width;original.height=height;
      const originalCtx=original.getContext("2d");
      if(!originalCtx)return false;
      originalCtx.drawImage(output,0,0);
      output.width=Math.max(1,Math.trunc(width*fit));
      output.height=Math.max(1,Math.trunc(height*fit));
      const resized=output.getContext("2d",{willReadFrequently:true});
      if(!resized)return false;
      resized.drawImage(original,0,0,width,height,0,0,output.width,output.height);
    }
    const final=output.getContext("2d",{willReadFrequently:true});
    if(!final)return false;
    const pixels=final.getImageData(0,0,output.width,output.height);
    const bytes=pixels.data;
    for(let i=0;i<bytes.length;i+=4){
      const color=sourceOnebitNearestPixel([bytes[i],bytes[i+1],bytes[i+2]]);
      bytes[i]=color[0];bytes[i+1]=color[1];bytes[i+2]=color[2];
      // Alpha is preserved exactly, matching the original source.
    }
    final.putImageData(pixels,0,0);
    return true;
  }catch{
    // Browsers without a usable 2D canvas must retain the source Guest img.
    return false;
  }
}
