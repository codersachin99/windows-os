import {readFile} from "node:fs/promises";
import {expect,test,type Download,type Page} from "@playwright/test";

const DESKTOP="/EXTERNAL/computer/drive0/Users/Guest/Desktop";

/** Frozen main.js DesktopItemMenu Download calls download(downloadablePaths).
 * Browser events must carry ALL real selected eligible Guest bytes, never only
 * the right-clicked file or a path-backed/system .lnk.
 */
async function logon(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
const item=(page:Page,name:string)=>page.locator(
  '[data-test-desktop-file="'+DESKTOP+"/"+name+'"]'
);

test("Desktop multi-selection Download includes both source file paths",async({page})=>{
  await logon(page);
  await page.locator("[data-test-desktop-upload-input]").setInputFiles([
    {name:"Select First.txt",mimeType:"text/plain",buffer:Buffer.from("first file")},
    {name:"Select Second.bin",mimeType:"application/octet-stream",
      buffer:Buffer.from([0,255,17,0,254])}
  ]);
  const first=item(page,"Select First.txt");
  const second=item(page,"Select Second.bin");
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
  await first.click();
  await second.click({modifiers:["Control"]});
  const downloads:Download[]=[];
  page.on("download",download=>downloads.push(download));
  await first.click({button:"right"});
  const menu=page.locator('[data-test-desktop-menu]');
  await expect(menu.locator('[data-test-desktop-item-action="open"]')).toHaveCount(0);
  await expect(menu.locator('[data-test-desktop-item-action="download"]')).toBeEnabled();
  await menu.locator('[data-test-desktop-item-action="download"]').click();
  await expect.poll(()=>downloads.length,{timeout:12000}).toBe(2);
  const bytes=new Map<string,Buffer>();
  for(const download of downloads)bytes.set(
    download.suggestedFilename(),await readFile(await download.path())
  );
  expect(bytes.get("Select First.txt")).toEqual(Buffer.from("first file"));
  expect(bytes.get("Select Second.bin")).toEqual(Buffer.from([0,255,17,0,254]));
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
});

test("Desktop multi-selection Download excludes .lnk even if shortcut is right-clicked",async({page})=>{
  await logon(page);
  await page.locator("[data-test-desktop-upload-input]").setInputFiles([
    {name:"Download Only.txt",mimeType:"text/plain",buffer:Buffer.from("only real data")},
    {name:"Selected Program.lnk",mimeType:"application/json",
      buffer:Buffer.from('{"exe":"calc","icon":"calc"}')}
  ]);
  const file=item(page,"Download Only.txt");
  const link=item(page,"Selected Program.lnk");
  await expect(file).toBeVisible();
  await expect(link).toBeVisible();
  await file.click();
  await link.click({modifiers:["Control"]});
  await link.click({button:"right"});
  const menu=page.locator('[data-test-desktop-menu]');
  await expect(menu.locator('[data-test-desktop-item-action="download"]')).toBeEnabled();
  const downloads:Download[]=[];
  page.on("download",download=>downloads.push(download));
  await menu.locator('[data-test-desktop-item-action="download"]').click();
  await expect.poll(()=>downloads.length,{timeout:10000}).toBe(1);
  expect(downloads[0].suggestedFilename()).toBe("Download Only.txt");
  expect(await readFile(await downloads[0].path())).toEqual(Buffer.from("only real data"));
  await expect(link).toBeVisible();
});
