import {expect,test,type Page} from "@playwright/test";

async function login(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
}
async function openPlayer(page:Page){
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-program="player"]').click();
  const player=page.locator('[data-test-window="player"]');
  await expect(player).toBeVisible();
  return player;
}
async function seedPicture(page:Page){
  await page.evaluate(()=>{
    const key="windows-os:vfs:guest:v1";
    const state=JSON.parse(localStorage.getItem(key)||"null") as
      {version:number;entries:Array<{uri:string;type:string;bytes?:string;mtime:number}>}|null;
    if(!state||state.version!==1)throw new Error("Guest VFS has not been initialized");
    const canvas=document.createElement("canvas");canvas.width=4;canvas.height=3;
    const ctx=canvas.getContext("2d");
    if(!ctx)throw new Error("No Canvas in test");
    ctx.fillStyle="#fe1234";ctx.fillRect(0,0,4,3);
    const data=canvas.toDataURL("image/png").split(",")[1];
    state.entries.push({uri:"/PlayerCanvas.png",type:"file",bytes:data,mtime:Date.now()});
    localStorage.setItem(key,JSON.stringify(state));
  });
}
async function seedWav(page:Page){
  await page.evaluate(()=>{
    const key="windows-os:vfs:guest:v1";
    const state=JSON.parse(localStorage.getItem(key)||"null") as
      {version:number;entries:Array<{uri:string;type:string;bytes?:string;mtime:number}>}|null;
    if(!state||state.version!==1)throw new Error("Guest VFS has not been initialized");
    const rate=8000,seconds=4,frames=rate*seconds;
    const data=new ArrayBuffer(44+frames*2),view=new DataView(data);
    const mark=(at:number,text:string)=>{
      for(let i=0;i<text.length;i++)view.setUint8(at+i,text.charCodeAt(i));
    };
    mark(0,"RIFF");view.setUint32(4,36+frames*2,true);mark(8,"WAVE");
    mark(12,"fmt ");view.setUint32(16,16,true);view.setUint16(20,1,true);
    view.setUint16(22,1,true);view.setUint32(24,rate,true);
    view.setUint32(28,rate*2,true);view.setUint16(32,2,true);
    view.setUint16(34,16,true);mark(36,"data");view.setUint32(40,frames*2,true);
    for(let i=0;i<frames;i++)
      view.setInt16(44+i*2,Math.round(Math.sin((i/rate)*440*Math.PI*2)*1000),true);
    const bytes=new Uint8Array(data);
    let binary="";
    for(let i=0;i<bytes.length;i+=8000)binary+=String.fromCharCode(...bytes.slice(i,i+8000));
    state.entries.push({uri:"/PlayerTone.wav",type:"file",bytes:btoa(binary),mtime:Date.now()});
    localStorage.setItem(key,JSON.stringify(state));
  });
}
async function relogin(page:Page){
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
}

test("source Media Player starts stopped with source libraries, menus and disabled controls",async({page})=>{
  await login(page);
  const player=await openPlayer(page);
  await expect(player).toContainText("Library");
  await expect(player).toContainText("Music");
  await expect(player).toContainText("No items in this library");
  await expect(player.getByRole("button",{name:"Play",exact:true})).toBeDisabled();
  await expect(player.getByRole("button",{name:"Stop"})).toBeDisabled();
  await expect(player.getByRole("button",{name:"Stream"})).toBeDisabled();
  await player.getByRole("button",{name:"Organize"}).click();
  await expect(player.getByRole("menuitem",{name:"Options"})).toBeDisabled();
  await player.getByRole("menuitem",{name:"Manage libraries"}).click();
  await expect(player.getByRole("menuitem",{name:"Music"})).toBeVisible();
  await expect(player.getByRole("menuitem",{name:"Videos"})).toBeVisible();
  await expect(player.getByRole("menuitem",{name:"Pictures"})).toBeVisible();
});

test("source Player opens a real PNG from Guest VFS and displays its pixels",async({page})=>{
  await login(page);
  await seedPicture(page);
  await relogin(page);
  const player=await openPlayer(page);
  await player.getByRole("button",{name:"Organize"}).click();
  await player.getByRole("menuitem",{name:"Manage libraries"}).click();
  await player.getByRole("menuitem",{name:"Pictures"}).click();
  const dialog=page.locator('[data-test-file-dialog="open"]');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("File name:").fill("PlayerCanvas.png");
  await dialog.getByRole("button",{name:"Open",exact:true}).click();
  await expect(dialog).toHaveCount(0);
  const image=player.locator('[data-test-player-picture]');
  await expect(image).toBeVisible();
  await expect(image).toHaveJSProperty("naturalWidth",4);
  await expect(image).toHaveJSProperty("naturalHeight",3);
  await expect(player.locator('[data-test-player-row]')).toContainText("PlayerCanvas.png");
  await expect(player.getByRole("button",{name:"Play",exact:true})).toBeEnabled();
});

test("source Explorer associates WAV with Media Player; real audio supports mute and volume",async({page})=>{
  await login(page);
  await seedWav(page);
  await relogin(page);
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  await expect(explorer).toBeVisible();
  await explorer.locator('[data-test-explorer-item="PlayerTone.wav"]').dblclick();
  const player=page.locator('[data-test-window="player"]');
  await expect(player).toBeVisible();
  const audio=player.locator('[data-test-player-audio]');
  await expect(audio).toHaveAttribute("src",/^blob:/);
  await expect.poll(async()=>{
    return await audio.evaluate((el:HTMLAudioElement)=>Number.isFinite(el.duration)&&el.duration>0);
  }).toBe(true);
  await player.getByRole("button",{name:"Mute"}).click();
  await expect(audio).toHaveJSProperty("muted",true);
  const volume=player.getByRole("slider",{name:"Volume"});
  const playerWidth=await player.locator('[data-test-player]').evaluate(node=>node.clientWidth);
  if(playerWidth>=400){
    await expect(volume).toBeVisible();
    await volume.focus();
    await volume.press("Home");
    await volume.press("ArrowRight");
    await expect(audio).toHaveJSProperty("volume",0.01);
  }else{
    // The original player.js hides extended controls below 400px.
    await expect(volume).toHaveCount(0);
    await expect(audio).toHaveJSProperty("volume",1);
  }
  await player.getByRole("button",{name:"Play",exact:true}).click();
  await expect(player.getByRole("button",{name:"Pause"})).toBeVisible({timeout:10000});
  await player.getByRole("button",{name:"Pause"}).click();
  await expect(player.getByRole("button",{name:"Play",exact:true})).toBeVisible();
  await player.getByRole("button",{name:"Stop"}).click();
  await expect(audio).toHaveJSProperty("currentTime",0);
});
