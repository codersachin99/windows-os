import {readFile} from "node:fs/promises";
import {strFromU8,unzipSync} from "fflate";
import {expect,test,type Page} from "@playwright/test";

const DESKTOP="/EXTERNAL/computer/drive0/Users/Guest/Desktop";

/** Pinned legacy-win7@26b9f0ce7 src/modules/system/main.js
 * DesktopItemMenu: Send to > compressed-folder invokes compress(paths).
 * Verify actual Guest Desktop menu/ZIP bytes, not a fake shell operation.
 */
async function logon(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}

async function zipSelected(page:Page,name:string){
  const item=page.locator('[data-test-desktop-file="'+DESKTOP+"/"+name+'"]');
  await expect(item).toBeVisible();
  await item.click({button:"right"});
  const parent=page.locator('[data-test-desktop-menu]')
    .locator('[data-test-desktop-item-action="send-to"]');
  await expect(parent).toBeEnabled();
  await parent.focus();
  await parent.press("ArrowRight");
  const submenu=page.locator('[data-test-desktop-send-to-submenu]');
  await expect(submenu).toBeVisible();
  const compressed=submenu.locator('[data-test-desktop-send-to-kind="compress"]');
  await expect(compressed).toBeFocused();
  return compressed;
}

async function downloadDesktopZip(page:Page,name:string){
  const icon=page.locator('[data-test-desktop-file="'+DESKTOP+"/"+name+'"]');
  await expect(icon).toBeVisible();
  await icon.click({button:"right"});
  const menu=page.locator('[data-test-desktop-menu]');
  const download=page.waitForEvent("download");
  await menu.locator('[data-test-desktop-item-action="download"]').click();
  const result=await download;
  expect(result.suggestedFilename()).toBe(name);
  return unzipSync(new Uint8Array(await readFile(await result.path())));
}

test("Desktop Send to compressed ZIP preserves original Guest binary bytes and keyboard submenu",async({page})=>{
  await logon(page);
  const bytes=Buffer.from([0,255,7,0,100,254,17]);
  await page.locator('[data-test-desktop-upload-input]').setInputFiles({
    name:"Desktop Binary.bin",mimeType:"application/octet-stream",buffer:bytes
  });
  const icon=page.locator('[data-test-desktop-file="'+DESKTOP+'/Desktop Binary.bin"]');
  await expect(icon).toBeVisible();
  const compressed=await zipSelected(page,"Desktop Binary.bin");
  await compressed.press("ArrowLeft");
  const parent=page.locator('[data-test-desktop-item-action="send-to"]');
  await expect(parent).toBeFocused();
  await expect(page.locator('[data-test-desktop-send-to-submenu]')).toHaveCount(0);
  await parent.press("ArrowRight");
  await page.locator('[data-test-desktop-send-to-kind="compress"]').click();
  await expect(page.locator('[data-test-desktop-menu]')).toHaveCount(0);
  const unpacked=await downloadDesktopZip(page,"Desktop Binary.zip");
  expect(Object.keys(unpacked)).toEqual(["Desktop Binary.bin"]);
  expect(Buffer.from(unpacked["Desktop Binary.bin"])).toEqual(bytes);
  await expect(icon).toBeVisible();
});

test("Desktop multi-selection packs two files and keeps distinct collision-safe archives",async({page})=>{
  await logon(page);
  await page.locator('[data-test-desktop-upload-input]').setInputFiles([
    {name:"Desktop Pack A.txt",mimeType:"text/plain",buffer:Buffer.from("Alpha")},
    {name:"Desktop Pack B.txt",mimeType:"text/plain",buffer:Buffer.from("Beta")}
  ]);
  const first=page.locator('[data-test-desktop-file="'+DESKTOP+'/Desktop Pack A.txt"]');
  const second=page.locator('[data-test-desktop-file="'+DESKTOP+'/Desktop Pack B.txt"]');
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
  for(const archive of ["Archive.zip","Archive (2).zip"]){
    await first.click();
    await second.click({modifiers:["Control"]});
    await expect(first).toHaveAttribute("data-test-desktop-selected","true");
    await expect(second).toHaveAttribute("data-test-desktop-selected","true");
    const compressed=await zipSelected(page,"Desktop Pack A.txt");
    await compressed.click();
    const entries=await downloadDesktopZip(page,archive);
    expect(strFromU8(entries["Desktop Pack A.txt"])).toBe("Alpha");
    expect(strFromU8(entries["Desktop Pack B.txt"])).toBe("Beta");
  }
  await expect(page.locator('[data-test-desktop-file="'+DESKTOP+'/Archive.zip"]')).toBeVisible();
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
});
