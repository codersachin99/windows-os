import {readFile} from "node:fs/promises";
import {zipSync} from "fflate";
import {expect,test,type Locator,type Page} from "@playwright/test";

const PROFILE="/EXTERNAL/computer/drive0/Users/Guest";
const DESKTOP=PROFILE+"/Desktop";
const DOCUMENTS=PROFILE+"/Documents";

/**
 * Frozen main.js DesktopItemMenu: extract-here uses shortcut.path.
 * Verify both real Desktop ZIP icons and original source .lnk path targets;
 * all writes stay inside the shared Guest VFS.
 */
async function logon(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function desktopMenu(page:Page,path:string):Promise<Locator>{
  const icon=page.locator('[data-test-desktop-file="'+path+'"]');
  await expect(icon).toBeVisible();
  await icon.click({button:"right"});
  const menu=page.locator('[data-test-desktop-menu]');
  await expect(menu).toBeVisible();
  return menu;
}
async function extractDesktop(page:Page,path:string){
  const menu=await desktopMenu(page,path);
  const action=menu.locator('[data-test-desktop-item-action="extract-here"]');
  await expect(action).toBeEnabled();
  await action.click();
  await expect(menu).toHaveCount(0);
}
async function documents(page:Page){
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]').last();
  await expect(win).toBeVisible();
  await win.locator(".explorer-navigation__home").filter({hasText:"Documents"}).click();
  await expect(win.getByRole("textbox",{name:"Folder address"})).toHaveValue(DOCUMENTS);
  return win;
}
async function downloadFile(page:Page,win:Locator,name:string){
  const item=win.locator('[data-test-explorer-item="'+name+'"]');
  await expect(item).toBeVisible();
  await item.click({button:"right"});
  const menu=win.locator('[data-test-explorer-context="item"]');
  const downloaded=page.waitForEvent("download");
  await menu.locator('[data-test-explorer-item-action="download"]').click();
  return readFile(await (await downloaded).path());
}

test("Desktop Extract here restores nested binary Guest files and original ZIP",async({page})=>{
  await logon(page);
  const bytes=Buffer.from([0,255,16,0,254,2,128]);
  const archive=zipSync({
    "Desktop Restored/":new Uint8Array(0),
    "Desktop Restored/Exact.bin":new Uint8Array(bytes),
    "Desktop Restored/Note.txt":new TextEncoder().encode("Hello Desktop ZIP"),
    "Desktop Restored/Empty/":new Uint8Array(0)
  });
  await page.locator('[data-test-desktop-upload-input]').setInputFiles({
    name:"Desktop Restore.zip",mimeType:"application/zip",buffer:Buffer.from(archive)
  });
  const zipPath=DESKTOP+"/Desktop Restore.zip";
  const menu=await desktopMenu(page,zipPath);
  await expect(menu.locator("[data-test-desktop-item-action]")).toHaveText([
    "Open","Extract here","Send to ▸","Download","Cut","Copy",
    "Delete","Rename","Properties"
  ]);
  await menu.locator('[data-test-desktop-item-action="extract-here"]').click();
  await expect(page.locator('[data-test-desktop-file="'+DESKTOP+'/Desktop Restored"]'))
    .toBeVisible();
  await expect(page.locator('[data-test-desktop-file="'+zipPath+'"]')).toBeVisible();
  await page.locator('[data-test-desktop-file="'+DESKTOP+'/Desktop Restored"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').last();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(DESKTOP+"/Desktop Restored");
  expect(await downloadFile(page,explorer,"Exact.bin")).toEqual(bytes);
  await expect(explorer.locator('[data-test-explorer-item="Empty"]')).toBeVisible();
  await explorer.locator('[data-test-explorer-item="Note.txt"]').dblclick();
  await expect(page.locator('[data-test-window="notepad"] .cm-content'))
    .toContainText("Hello Desktop ZIP");
});

test("Desktop ZIP Extract here rejects collisions without partial Guest folders",async({page})=>{
  await logon(page);
  await page.locator('[data-test-desktop-upload-input]').setInputFiles([
    {name:"Original.txt",mimeType:"text/plain",buffer:Buffer.from("untouched")},
    {name:"Desktop Conflict.zip",mimeType:"application/zip",buffer:Buffer.from(zipSync({
      "Partial Folder/new.txt":new TextEncoder().encode("must not appear"),
      "Original.txt":new TextEncoder().encode("overwrite attempt")
    }))}
  ]);
  await extractDesktop(page,DESKTOP+"/Desktop Conflict.zip");
  await expect(page.locator('#desktop-icons [role="alert"]'))
    .toContainText("already exists");
  await expect(page.locator('[data-test-desktop-file="'+DESKTOP+'/Partial Folder"]'))
    .toHaveCount(0);
  const menu=await desktopMenu(page,DESKTOP+"/Original.txt");
  const downloaded=page.waitForEvent("download");
  await menu.locator('[data-test-desktop-item-action="download"]').click();
  expect(await readFile(await (await downloaded).path())).toEqual(Buffer.from("untouched"));
});

test("Desktop Extract here respects archive extension and single-selection predicates",async({page})=>{
  await logon(page);
  await page.locator('[data-test-desktop-upload-input]').setInputFiles([
    {name:"Source Unsupported.rar",mimeType:"application/octet-stream",buffer:Buffer.from([1,2,3])},
    {name:"Source Plain.txt",mimeType:"text/plain",buffer:Buffer.from("text")},
    {name:"Source Test.zip",mimeType:"application/zip",buffer:Buffer.from(zipSync({
      "contents.txt":new TextEncoder().encode("ok")
    }))}
  ]);
  let menu=await desktopMenu(page,DESKTOP+"/Source Unsupported.rar");
  await expect(menu.locator('[data-test-desktop-item-action="extract-here"]'))
    .toBeDisabled();
  await page.keyboard.press("Escape");
  menu=await desktopMenu(page,DESKTOP+"/Source Plain.txt");
  await expect(menu.locator('[data-test-desktop-item-action="extract-here"]'))
    .toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.locator('[data-test-desktop-file="'+DESKTOP+'/Source Test.zip"]').click();
  await page.locator('[data-test-desktop-file="'+DESKTOP+'/Source Plain.txt"]')
    .click({modifiers:["Control"]});
  menu=await desktopMenu(page,DESKTOP+"/Source Test.zip");
  await expect(menu.locator('[data-test-desktop-item-action="extract-here"]'))
    .toHaveCount(0);
});

test("Desktop path-backed ZIP shortcut extracts into its real Documents parent",async({page})=>{
  await logon(page);
  const win=await documents(page);
  await win.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Linked Archive.zip",mimeType:"application/zip",buffer:Buffer.from(zipSync({
      "Linked Result.txt":new TextEncoder().encode("Shortcut archive result")
    }))
  });
  const zip=win.locator('[data-test-explorer-item="Linked Archive.zip"]');
  await expect(zip).toBeVisible();
  await zip.click({button:"right"});
  const context=win.locator('[data-test-explorer-context="item"]');
  await context.locator('[data-test-explorer-item-send-to]').click();
  await context.locator('[data-test-explorer-item-send-to-kind="desktop"]').click();
  const shortcutPath=DESKTOP+"/Linked Archive - Shortcut.lnk";
  const shortcut=page.locator('[data-test-desktop-file="'+shortcutPath+'"]');
  await expect(shortcut).toBeVisible();
  // The Computer window can cover a newly created desktop icon; close it
  // before invoking the *real* shortcut context menu, as a user would.
  await win.getByRole("button",{name:/^Close /}).click();
  const menu=await desktopMenu(page,shortcutPath);
  await expect(menu.locator('[data-test-desktop-item-action="extract-here"]'))
    .toBeEnabled();
  await menu.locator('[data-test-desktop-item-action="extract-here"]').click();
  const reopened=await documents(page);
  await expect(reopened.locator('[data-test-explorer-item="Linked Result.txt"]')).toBeVisible();
  expect(await downloadFile(page,reopened,"Linked Result.txt"))
    .toEqual(Buffer.from("Shortcut archive result"));
  await expect(shortcut).toBeVisible();
  await expect(reopened.locator('[data-test-explorer-item="Linked Archive.zip"]'))
    .toBeVisible();
});
