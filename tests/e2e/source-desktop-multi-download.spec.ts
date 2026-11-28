import {readFile} from "node:fs/promises";
import {zipSync} from "fflate";
import {expect,test,type Download,type Page} from "@playwright/test";

const DESKTOP="/EXTERNAL/computer/drive0/Users/Guest/Desktop";

/** Frozen main.js DesktopItemMenu Download calls download(downloadablePaths).
 * Browser events must carry ALL selected eligible Guest bytes. A program-only
 * .lnk is excluded, but a source path-backed .lnk downloads its real
 * referenced Guest target, not the .lnk JSON file.
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

test("Desktop path-backed shortcut Download emits exact original Guest ZIP target bytes",async({page})=>{
  await logon(page);
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]').last();
  await expect(win).toBeVisible();
  await win.locator(".explorer-navigation__home").filter({hasText:"Documents"}).click();
  const zip=Buffer.from(zipSync({
    "Original.txt":new TextEncoder().encode("source shortcut target bytes")
  }));
  await win.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Shortcut Target.zip",mimeType:"application/zip",buffer:zip
  });
  const archived=win.locator('[data-test-explorer-item="Shortcut Target.zip"]');
  await expect(archived).toBeVisible();
  await archived.click({button:"right"});
  const context=win.locator('[data-test-explorer-context="item"]');
  await context.locator('[data-test-explorer-item-send-to]').click();
  await context.locator('[data-test-explorer-item-send-to-kind="desktop"]').click();
  const link=item(page,"Shortcut Target - Shortcut.lnk");
  await expect(link).toBeVisible();
  await win.getByRole("button",{name:/^Close /}).click();
  await link.click({button:"right"});
  const menu=page.locator('[data-test-desktop-menu]');
  const download=menu.locator('[data-test-desktop-item-action="download"]');
  await expect(download).toBeEnabled();
  const resultEvent=page.waitForEvent("download");
  await download.click();
  const result=await resultEvent;
  expect(result.suggestedFilename()).toBe("Shortcut Target.zip");
  expect(await readFile(await result.path())).toEqual(zip);
  await expect(link).toBeVisible();
});
