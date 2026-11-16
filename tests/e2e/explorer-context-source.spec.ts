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
