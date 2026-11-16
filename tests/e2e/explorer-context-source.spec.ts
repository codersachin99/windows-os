import {expect,test,type Page} from "@playwright/test";

async function openFolder(page:Page,app:"computer"|"bin"){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="'+app+'"]').dblclick();
  const win=page.locator('[data-test-window="'+app+'"]');
  await expect(win).toBeVisible();
  return win;
}
async function openBackgroundMenu(win:ReturnType<Page["locator"]>){
  const listing=win.locator(".explorer-content");
  await expect(listing).toBeVisible();
  const bounds=await listing.boundingBox();
  expect(bounds).not.toBeNull();
  await listing.click({button:"right",position:{
    x:Math.max(10,bounds!.width-12),
    y:Math.max(10,bounds!.height-12)
  }});
  const menu=win.locator('[data-test-explorer-context="background"]');
  await expect(menu).toBeVisible();
  return menu;
}
test("source Computer background View context uses shared eight mode contract",async({page})=>{
  const computer=await openFolder(page,"computer");
  const menu=await openBackgroundMenu(computer);
  await menu.locator("[data-test-explorer-context-view]").click();
  const modes=menu.getByRole("menuitemradio");
  await expect(modes).toHaveCount(8);
  await expect(modes).toHaveText([
    /Extra large icons/,/Large icons/,/Medium icons/,/Small icons/,
    /List/,/Details/,/Tiles/,/Content/
  ]);
  await expect(menu.locator('[data-test-explorer-context-mode="tiles"]'))
    .toHaveAttribute("aria-checked","true");
  await menu.locator('[data-test-explorer-context-mode="extra-large-icons"]').click();
  await expect(computer.locator(".explorer-list")).toHaveClass(/is-extra/);
  await expect(menu).toHaveCount(0);
});
test("source Computer Copy path and Upload use virtual mounted directory",async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,"clipboard",{configurable:true,value:{
      writeText:async(text:string)=>{
        (window as unknown as {copiedExplorerPath?:string}).copiedExplorerPath=text;
      }
    }});
  });
  const computer=await openFolder(page,"computer");
  let menu=await openBackgroundMenu(computer);
  await menu.locator("[data-test-explorer-context-copy-path]").click();
  expect(await page.evaluate(()=>
    (window as unknown as {copiedExplorerPath?:string}).copiedExplorerPath
  )).toBe("/");
  menu=await openBackgroundMenu(computer);
  await expect(menu.locator("[data-test-explorer-context-upload]")).toBeEnabled();
  await menu.locator("[data-test-explorer-context-upload]").click();
  await computer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Explorer Context Note.txt",mimeType:"text/plain",
      buffer:Buffer.from("Original Explorer source context")});
  await expect(computer.locator('[data-test-explorer-item="Explorer Context Note.txt"]'))
    .toBeVisible();
});
test("source Bin context retains View/Copy path but forbids upload and paste",async({page})=>{
  const bin=await openFolder(page,"bin");
  const menu=await openBackgroundMenu(bin);
  await expect(menu.locator("[data-test-explorer-context-copy-path]")).toBeEnabled();
  await expect(menu.locator("[data-test-explorer-context-upload]")).toBeDisabled();
  await expect(menu.getByRole("menuitem",{name:"Paste"})).toHaveCount(0);
  await expect(menu.getByRole("menuitem",{name:"New folder"})).toHaveCount(0);
  await expect(menu.getByRole("menuitem",{name:"Empty Recycle Bin"})).toBeDisabled();
  await menu.locator("[data-test-explorer-context-view]").click();
  await expect(menu.getByRole("menuitemradio")).toHaveCount(8);
  await expect(menu).toBeVisible();
});

test("pinned Computer New submenu creates source folder, TXT and RTF in Guest VFS",async({page})=>{
  const computer=await openFolder(page,"computer");
  const expected=[
    ["folder","New folder"],
    ["richtext","New Rich Text Document.rtf"],
    ["text","New Text Document.txt"]
  ] as const;
  for(const [kind,filename] of expected){
    const menu=await openBackgroundMenu(computer);
    await menu.locator("[data-test-explorer-context-new]").click();
    await expect(menu.locator("[data-test-explorer-context-new-kind]")).toHaveText([
      "Folder","Rich Text Document","Text Document"
    ]);
    await menu.locator('[data-test-explorer-context-new-kind="'+kind+'"]').click();
    const item=computer.locator('[data-test-explorer-item="'+filename+'"]');
    await expect(item).toBeVisible();
    // Win7 source offers immediate inline rename on created items.
    const editor=item.locator("input");
    if(await editor.count())await editor.press("Enter");
    await expect(item).toBeVisible();
  }
  const paths=await page.evaluate(()=>{
    const raw=JSON.parse(localStorage.getItem("windows-os:vfs:guest:v1")||"{}") as {
      entries:{uri:string;content?:string;type:string}[]
    };
    return raw.entries.filter(entry=>entry.uri.includes("New ")).map(entry=>({
      uri:entry.uri,content:entry.content
    }));
  });
  expect(paths.some(p=>p.uri.endsWith("/New folder"))).toBe(true);
  expect(paths.some(p=>p.uri.endsWith("/New Rich Text Document.rtf")&&
    p.content?.startsWith("{\\\\rtf1\\\\ansi"))).toBe(true);
  expect(paths.some(p=>p.uri.endsWith("/New Text Document.txt")&&p.content===""))
    .toBe(true);
});
