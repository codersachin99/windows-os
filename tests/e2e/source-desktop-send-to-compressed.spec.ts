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

test("Desktop path-backed .lnk compresses real Documents target, not shortcut JSON",async({page})=>{
  await logon(page);
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]').last();
  await expect(win).toBeVisible();
  await win.locator(".explorer-navigation__home").filter({hasText:"Documents"}).click();
  const bytes=Buffer.from([0,255,18,0,254,7,99]);
  await win.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Source Archive Target.bin",mimeType:"application/octet-stream",buffer:bytes
  });
  const target=win.locator('[data-test-explorer-item="Source Archive Target.bin"]');
  await expect(target).toBeVisible();
  await target.click({button:"right"});
  const explorerMenu=win.locator('[data-test-explorer-context="item"]');
  await explorerMenu.locator('[data-test-explorer-item-send-to]').click();
  await explorerMenu.locator('[data-test-explorer-item-send-to-kind="desktop"]').click();
  const link=page.locator('[data-test-desktop-file="'+DESKTOP+
    '/Source Archive Target - Shortcut.lnk"]');
  await expect(link).toBeVisible();
  await win.getByRole("button",{name:/^Close /}).click();
  const compressed=await zipSelected(page,"Source Archive Target - Shortcut.lnk");
  await compressed.click();
  // Original shortcut.path points into Documents. The shared ZIP writer
  // must publish beside that target, not place JSON or archive on Desktop.
  await expect(page.locator('[data-test-desktop-file="'+DESKTOP+
    '/Source Archive Target.zip"]')).toHaveCount(0);
  await expect(link).toBeVisible();
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const docs=page.locator('[data-test-window="computer"]').last();
  await docs.locator(".explorer-navigation__home").filter({hasText:"Documents"}).click();
  const zipped=docs.locator('[data-test-explorer-item="Source Archive Target.zip"]');
  await expect(zipped).toBeVisible();
  await expect(docs.locator('[data-test-explorer-item="Source Archive Target.bin"]'))
    .toBeVisible();
  await zipped.click({button:"right"});
  const popup=docs.locator('[data-test-explorer-context="item"]');
  const download=page.waitForEvent("download");
  await popup.locator('[data-test-explorer-item-action="download"]').click();
  const actual=unzipSync(new Uint8Array(await readFile(await (await download).path())));
  expect(Object.keys(actual)).toEqual(["Source Archive Target.bin"]);
  expect(Buffer.from(actual["Source Archive Target.bin"])).toEqual(bytes);
});

test("Desktop program-only .lnk hides source compressed Send to without shortcut.path",async({page})=>{
  await logon(page);
  await page.locator('[data-test-desktop-upload-input]').setInputFiles({
    name:"Program Without Path.lnk",mimeType:"application/json",
    buffer:Buffer.from('{"exe":"calc","icon":"calc"}')
  });
  const icon=page.locator('[data-test-desktop-file="'+DESKTOP+
    '/Program Without Path.lnk"]');
  await expect(icon).toBeVisible();
  await icon.click({button:"right"});
  const menu=page.locator('[data-test-desktop-menu]');
  await expect(menu.locator('[data-test-desktop-item-action="send-to"]')).toHaveCount(0);
  await expect(menu.locator('[data-test-desktop-item-action="copy"]')).toHaveCount(0);
  await expect(menu.locator('[data-test-desktop-item-action="cut"]')).toHaveCount(0);
  await expect(icon).toBeVisible();
});
