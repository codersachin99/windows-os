import {readFile} from "node:fs/promises";
import {strFromU8,unzipSync} from "fflate";
import {expect,test,type Locator,type Page} from "@playwright/test";

/** Frozen legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * src/modules/system/main.js ExplorerItemMenu: Send to > compressed-folder
 * invokes compress(paths). Verify actual mounted Guest ZIP bytes and source
 * selection/menu behavior; browser never opens a host file path.
 */
async function documents(page:Page):Promise<Locator>{
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win).toBeVisible();
  await win.locator(".explorer-navigation__home")
    .filter({hasText:"Documents"}).click();
  return win;
}
async function compress(win:Locator,item:Locator){
  await item.click({button:"right"});
  const menu=win.locator('[data-test-explorer-context="item"]');
  await expect(menu).toBeVisible();
  await menu.locator("[data-test-explorer-item-send-to]").click();
  const button=menu.locator('[data-test-explorer-item-send-to-kind="compress"]');
  await expect(button).toBeEnabled();
  await button.click();
  await expect(menu).toHaveCount(0);
}
async function downloadZip(page:Page,win:Locator,name:string){
  const zip=win.locator('[data-test-explorer-item="'+name+'"]');
  await expect(zip).toBeVisible();
  await zip.click({button:"right"});
  const menu=win.locator('[data-test-explorer-context="item"]');
  const downloaded=page.waitForEvent("download");
  await menu.locator('[data-test-explorer-item-action="download"]').click();
  const result=await downloaded;
  expect(result.suggestedFilename()).toBe(name);
  return unzipSync(new Uint8Array(await readFile(await result.path())));
}

test("original Send to Compressed folder creates real Guest ZIP with binary bytes",async({page})=>{
  const win=await documents(page);
  const bytes=Buffer.from([0,255,1,0,100,254,17]);
  await win.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Source Compressed.bin",mimeType:"application/octet-stream",
      buffer:bytes});
  const item=win.locator('[data-test-explorer-item="Source Compressed.bin"]');
  await expect(item).toBeVisible();
  await compress(win,item);
  const zipped=await downloadZip(page,win,"Source Compressed.zip");
  expect(Object.keys(zipped)).toEqual(["Source Compressed.bin"]);
  expect(Buffer.from(zipped["Source Compressed.bin"])).toEqual(bytes);
  await expect(item).toBeVisible();
});

test("original multi-item Send to ZIP is non-overwriting and packs both Guest items",async({page})=>{
  const win=await documents(page);
  await win.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles([
      {name:"Pack A.txt",mimeType:"text/plain",buffer:Buffer.from("Hello A")},
      {name:"Pack B.txt",mimeType:"text/plain",buffer:Buffer.from("Hello B")}
    ]);
  const first=win.locator('[data-test-explorer-item="Pack A.txt"]');
  const second=win.locator('[data-test-explorer-item="Pack B.txt"]');
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
  await first.click();
  await second.click({modifiers:["Control"]});
  await compress(win,first);
  const zipped=await downloadZip(page,win,"Archive.zip");
  expect(strFromU8(zipped["Pack A.txt"])).toBe("Hello A");
  expect(strFromU8(zipped["Pack B.txt"])).toBe("Hello B");
  await compress(win,first);
  const again=await downloadZip(page,win,"Archive (2).zip");
  expect(strFromU8(again["Pack A.txt"])).toBe("Hello A");
  expect(strFromU8(again["Pack B.txt"])).toBe("Hello B");
  await expect(win.locator('[data-test-explorer-item="Archive.zip"]')).toBeVisible();
});
