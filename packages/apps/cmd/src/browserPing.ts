/** Pinned legacy cmd.js module a3be/3b61. Browser Ping.js sends an image
 * to host + "/favicon.ico?" + Date.now(), with a four-second timeout.
 * Source URL normalization is restricted here to safe HTTP(S) origins. */
export function sourceCmdPingImageUrl(target:string,nonce:number):string{
  const raw=target.trim();
  if(!raw||/\s/.test(raw))throw new Error("Invalid ping target");
  if(/^[a-z][a-z\d+.-]*:\/\//i.test(raw)&&!/^https?:\/\//i.test(raw))
    throw new Error("Only HTTP(S) ping targets are allowed");
  const url=new URL(/^https?:\/\//i.test(raw)?raw:"https://"+raw);
  if(!["http:","https:"].includes(url.protocol)||url.username||url.password)
    throw new Error("Invalid ping URL");
  return url.origin+"/favicon.ico?"+nonce;
}
/** A successful browser image load indicates reachability of that image,
 * not ICMP reachability of the entire machine. No host subprocess. */
export function sourceCmdBrowserPing(target:string):Promise<number>{
  return new Promise<number>((resolve,reject)=>{
    try{
      const url=sourceCmdPingImageUrl(target,Date.now());
      const picture=new Image();
      const started=Date.now();
      let finished=false;
      let timer=0;
      const finish=(error?:Error)=>{
        if(finished)return;
        finished=true;
        window.clearTimeout(timer);
        picture.onload=null;
        picture.onerror=null;
        if(error)reject(error);
        else resolve(Date.now()-started);
      };
      timer=window.setTimeout(()=>finish(new Error("Ping timed out")),4000);
      picture.onload=()=>finish();
      picture.onerror=()=>finish(new Error("Ping failed"));
      picture.src=url;
    }catch(error){reject(error);}
  });
}
