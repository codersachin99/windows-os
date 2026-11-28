import {expect,test,type Page} from "@playwright/test";

async function embedSession(page:Page){
  await page.goto("/");
  await page.evaluate(()=>{
    const main=window as typeof window & {__embedEvents?:unknown[]};
    main.__embedEvents=[];
    const child=document.createElement("iframe");
    child.setAttribute("data-test-embed-parent","");
    child.src="/?theme=win7";
    child.style.cssText="position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483000;border:0";
    window.addEventListener("message",event=>{
      if(event.source===child.contentWindow)main.__embedEvents!.push(event.data);
    });
    document.body.append(child);
  });
  const view=page.frameLocator('[data-test-embed-parent]');
  await view.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(view.locator('[data-test-main-screen]')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>{
    const events=(window as typeof window&{__embedEvents?:Array<{type:string;version?:string}>})
      .__embedEvents??[];
    return events.some(e=>e.type==="ready"&&e.version==="4.8.0");
  })).toBe(true);
  return view;
}
const send=async(page:Page,message:object)=>{
  await page.evaluate(data=>{
    const iframe=document.querySelector<HTMLIFrameElement>('[data-test-embed-parent]');
    iframe?.contentWindow?.postMessage(data,window.location.origin);
  },message);
};

test("source embed plugin is disabled for top-level windows and never opens arbitrary web apps",async({page})=>{
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.evaluate(()=>window.postMessage({
    type:"open",url:"https://example.org/",title:"Top Level Unsafe"
  },window.location.origin));
  await expect(page.locator('[data-test-window="web_top-level-unsafe"]')).toHaveCount(0);
});
test("source parent bridge opens one valid web iframe, acknowledges and reports Close",async({page})=>{
  const view=await embedSession(page);
  await send(page,{type:"open",url:"https://example.org/allowed",title:"Portal Test"});
  const viewer=view.locator('[data-test-window="web_portal-test"]');
  await expect(viewer).toBeVisible();
  await expect(viewer.locator('[data-test-source-webapp-frame]'))
    .toHaveAttribute("src","https://example.org/allowed");
  await expect(viewer.locator('.windows-window__titlebar img'))
    .toHaveAttribute("src","/assets/images/internet.b27ef7d7.webp");
  await expect.poll(()=>page.evaluate(()=>{
    const events=(window as typeof window&{__embedEvents?:Array<{type:string;id?:string}>})
      .__embedEvents??[];
    return events.some(e=>e.type==="opened"&&e.id==="web_portal-test");
  })).toBe(true);
  await send(page,{type:"open",url:"https://example.org/allowed",title:"Portal Test"});
  await expect(view.locator('[data-test-window="web_portal-test"]')).toHaveCount(1);
  await send(page,{type:"close",id:"web_portal-test"});
  await expect(viewer).toHaveCount(0);
  await expect.poll(()=>page.evaluate(()=>{
    const events=(window as typeof window&{__embedEvents?:Array<{type:string;id?:string}>})
      .__embedEvents??[];
    return events.some(e=>e.type==="closed"&&e.id==="web_portal-test");
  })).toBe(true);
});
test("original bridge refuses unsafe schemes, fake origins and closing native apps",async({page})=>{
  const view=await embedSession(page);
  await send(page,{type:"open",url:"javascript:alert(1)",title:"Bad Script"});
  await send(page,{type:"open",url:"https://name:secret@example.org",title:"Credentials"});
  await expect(view.locator('[data-test-window="web_bad-script"]')).toHaveCount(0);
  await expect(view.locator('[data-test-window="web_credentials"]')).toHaveCount(0);
  await view.locator('[data-test-desktop-icon="computer"]').dblclick();
  await expect(view.locator('[data-test-window="computer"]')).toBeVisible();
  await send(page,{type:"close",id:"computer"});
  await expect(view.locator('[data-test-window="computer"]')).toBeVisible();
  await page.frameLocator('[data-test-embed-parent]').locator('[data-test-main-screen]')
    .evaluate(el=>{
      const child=el.ownerDocument.defaultView;
      if(!child)return;
      child.dispatchEvent(new MessageEvent("message",{
        origin:"https://not-allowed.example",source:child.parent,
        data:{type:"open",url:"https://example.org",title:"Forged Origin"}
      }));
    });
  await expect(view.locator('[data-test-window="web_forged-origin"]')).toHaveCount(0);
});
