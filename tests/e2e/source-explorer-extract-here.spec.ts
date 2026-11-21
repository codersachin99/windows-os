import {readFile} from "node:fs/promises";
import {zipSync} from "fflate";
import {expect,test,type Locator,type Page} from "@playwright/test";

/** Pinned legacy-win7 main.js ExplorerItemMenu -> Extract here.
 * Only mounted Guest ZIPs are enabled; files remain inside the VFS.
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
async function extract(win:Locator,name:string){
  const archive=win.locator('[data-test-explorer-item="'+name+'"]');
  await expect(archive).toBeVisible();
  await archive.click({button:"right"});
  const menu=win.locator('[data-test-explorer-context="item"]');
  const action=menu.locator('[data-test-explorer-item-action="extract-here"]');
  await expect(action).toBeEnabled();
  await action.click();
  await expect(menu).toHaveCount(0);
}

test("Extract here creates nested binary Guest files and empty folders",async({page})=>{
  const win=await documents(page);
  const content=Buffer.from([0,255,1,4,0,250]);
  const archive=zipSync({
    "Unpacked/":new Uint8Array(0),
    "Unpacked/Source Binary.bin":new Uint8Array(content),
    "Unpacked/Empty/":new Uint8Array(0)
  });
  await win.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Packed Files.zip",mimeType:"application/zip",
      buffer:Buffer.from(archive)});
  await extract(win,"Packed Files.zip");
  const folder=win.locator('[data-test-explorer-item="Unpacked"]');
  await expect(folder).toBeVisible();
  await expect(win.locator('[data-test-explorer-item="Packed Files.zip"]'))
    .toBeVisible();
  await folder.dblclick();
  const item=win.locator('[data-test-explorer-item="Source Binary.bin"]');
  await expect(item).toBeVisible();
  await expect(win.locator('[data-test-explorer-item="Empty"]')).toBeVisible();
  await item.click({button:"right"});
  const download=page.waitForEvent("download");
  await win.locator('[data-test-explorer-context="item"]')
    .locator('[data-test-explorer-item-action="download"]').click();
  const file=await download;
  expect(file.suggestedFilename()).toBe("Source Binary.bin");
  expect(await readFile(await file.path())).toEqual(content);
});

test("Extract here refuses to overwrite existing Guest items atomically",async({page})=>{
  const win=await documents(page);
  await win.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles([
      {name:"Existing.txt",mimeType:"text/plain",buffer:Buffer.from("original")},
      {name:"Blocked.zip",mimeType:"application/zip",
        buffer:Buffer.from(zipSync({
          "New Folder/New.txt":new TextEncoder().encode("partial"),
          "Existing.txt":new TextEncoder().encode("overwrite")
        }))}
    ]);
  await extract(win,"Blocked.zip");
  await expect(win.getByRole("alert")).toContainText("already exists");
  await expect(win.locator('[data-test-explorer-item="New Folder"]')).toHaveCount(0);
  const original=win.locator('[data-test-explorer-item="Existing.txt"]');
  await expect(original).toBeVisible();
  await original.click({button:"right"});
  const event=page.waitForEvent("download");
  await win.locator('[data-test-explorer-context="item"]')
    .locator('[data-test-explorer-item-action="download"]').click();
  const file=await event;
  expect(await readFile(await file.path())).toEqual(Buffer.from("original"));
});

test("source archive item keeps unsupported RAR Extract here disabled",async({page})=>{
  const win=await documents(page);
  await win.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Unsupported.rar",mimeType:"application/octet-stream",
      buffer:Buffer.from([1,2,3])});
  await win.locator('[data-test-explorer-item="Unsupported.rar"]')
    .click({button:"right"});
  const menu=win.locator('[data-test-explorer-context="item"]');
  await expect(menu.locator('[data-test-explorer-item-action="extract-here"]'))
    .toBeDisabled();
});
