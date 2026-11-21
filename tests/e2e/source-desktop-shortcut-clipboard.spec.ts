import {expect,test,type Page,type Locator} from "@playwright/test";

const PROFILE="/EXTERNAL/computer/drive0/Users/Guest";
const DESKTOP=PROFILE+"/Desktop";
const DOCUMENTS=PROFILE+"/Documents";

/**
 * Frozen main.js DesktopItemMenu: Copy/Cut dispatch this.paths from
 * getShortcut(key).path, not the .lnk JSON file path. Both menu and keyboard
 * operations share Explorer's real Guest VFS clipboard.
 */
async function login(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function explorerDocuments(page:Page):Promise<Locator>{
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]').last();
  await expect(win).toBeVisible();
  await win.locator(".explorer-navigation__home").filter({hasText:"Documents"}).click();
  await expect(win.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(DOCUMENTS);
  return win;
}
async function linkDocument(page:Page,name:string,body:string){
  const win=await explorerDocuments(page);
  await win.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name,mimeType:"text/plain",buffer:Buffer.from(body)});
  const source=win.locator('[data-test-explorer-item="'+name+'"]');
  await expect(source).toBeVisible();
  await source.click({button:"right"});
  const menu=win.locator('[data-test-explorer-context="item"]');
  await menu.locator('[data-test-explorer-item-send-to]').click();
  await menu.locator('[data-test-explorer-item-send-to-kind="desktop"]').click();
  const stem=name.replace(/\.[^.]+$/,"");
  const shortcut=page.locator('[data-test-desktop-file="'+
    DESKTOP+"/"+stem+' - Shortcut.lnk"]');
  await expect(shortcut).toBeVisible();
  await win.getByRole("button",{name:/^Close /}).click();
  return shortcut;
}
async function pasteOnDesktop(page:Page){
  // Original shortcut clipboard is shared with the Desktop background.
  await page.locator("#desktop-icons").focus();
  await page.keyboard.press("Control+v");
}

test("Desktop source path-backed shortcut context Copy copies Guest target not .lnk",async({page})=>{
  await login(page);
  const link=await linkDocument(page,"Linked Copy.txt","exact source content");
  await link.click({button:"right"});
  const menu=page.locator('[data-test-desktop-menu]');
  await expect(menu.locator('[data-test-desktop-item-action="copy"]')).toBeEnabled();
  await menu.locator('[data-test-desktop-item-action="copy"]').click();
  await pasteOnDesktop(page);
  const copy=page.locator('[data-test-desktop-file="'+DESKTOP+"/Linked Copy.txt"+'"]');
  await expect(copy).toBeVisible();
  await expect(link).toBeVisible();
  await copy.dblclick();
  await expect(page.locator('[data-test-window="notepad"] .cm-content'))
    .toContainText("exact source content");
  const documents=await explorerDocuments(page);
  await expect(documents.locator('[data-test-explorer-item="Linked Copy.txt"]'))
    .toBeVisible();
});

test("Desktop source path-backed shortcut Ctrl+X moves real target, leaves .lnk untouched",async({page})=>{
  await login(page);
  const link=await linkDocument(page,"Linked Cut.txt","move through Guest clipboard");
  await link.click();
  await page.keyboard.press("Control+x");
  await pasteOnDesktop(page);
  const moved=page.locator('[data-test-desktop-file="'+DESKTOP+"/Linked Cut.txt"+'"]');
  await expect(moved).toBeVisible();
  await expect(link).toBeVisible();
  await moved.dblclick();
  await expect(page.locator('[data-test-window="notepad"] .cm-content'))
    .toContainText("move through Guest clipboard");
  const documents=await explorerDocuments(page);
  await expect(documents.locator('[data-test-explorer-item="Linked Cut.txt"]'))
    .toHaveCount(0);
});

test("Desktop program-only .lnk cannot enter source file clipboard through context menu",async({page})=>{
  await login(page);
  await page.locator('[data-test-desktop-upload-input]').setInputFiles({
    name:"Program Only.lnk",mimeType:"application/json",
    buffer:Buffer.from('{"exe":"calc","icon":"calc"}')
  });
  const link=page.locator('[data-test-desktop-file="'+DESKTOP+"/Program Only.lnk"+'"]');
  await expect(link).toBeVisible();
  await link.click({button:"right"});
  const menu=page.locator('[data-test-desktop-menu]');
  await expect(menu.locator('[data-test-desktop-item-action="cut"]')).toHaveCount(0);
  await expect(menu.locator('[data-test-desktop-item-action="copy"]')).toHaveCount(0);
  await page.keyboard.press("Escape");
  await link.focus();
  await page.keyboard.press("Control+c");
  await page.locator("#desktop-icons").click({button:"right",position:{x:290,y:290}});
  await expect(page.locator('[data-test-desktop-menu]').getByRole("menuitem",{name:"Paste"}))
    .toBeDisabled();
});
