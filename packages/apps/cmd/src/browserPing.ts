/** Browser-only reachability probe. Source cmd.js uses a 4-second browser
 * ping.js/image transport, NOT native ICMP. No host process or OS network API.
 * Reachability depends on the remote origin serving a public icon image. */
export function sourceCmdBrowserPing(target:string):Promise<number>{
  return new Promise<number>((resolve,reject)=>{
    try{
      const raw=target.trim();
      if(!raw||/\s/.test(raw))throw new Error("Invalid ping target");
      if(/^[a-z][a-z\d+.-]*:\/\//i.test(raw)&&!/^https?:\/\//i.test(raw))
        throw new Error("Only HTTP(S) ping targets are allowed");
      const destination=new URL(/^https?:\/\//i.test(raw)?raw:"https://"+raw);
      if(!["http:","https:"].includes(destination.protocol)||destination.username||
        destination.password)throw new Error("Invalid ping URL");
      destination.pathname="/favicon.ico";
      destination.search="";
      destination.hash="";
      destination.searchParams.set("source-cmd-ping",String(Date.now()));
      const picture=new Image();
      const start=performance.now();
      let done=false;
      let timer=0;
      const finish=(error?:Error)=>{
        if(done)return;
        done=true;
        window.clearTimeout(timer);
        picture.onload=null;
        picture.onerror=null;
        if(error)reject(error);
        else resolve(performance.now()-start);
      };
      timer=window.setTimeout(()=>finish(new Error("Ping timed out")),4000);
      picture.onload=()=>finish();
      picture.onerror=()=>finish(new Error("Ping failed"));
      picture.src=destination.href;
    }catch(error){reject(error);}
  });
}
