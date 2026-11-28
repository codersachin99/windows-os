import {readFile} from "node:fs/promises";
import {expect,test,type Locator,type Page} from "@playwright/test";

const PROFILE="/EXTERNAL/computer/drive0/Users/Guest";
const DESKTOP=PROFILE+"/Desktop";
const DOCUMENTS=PROFILE+"/Documents";

/** Frozen legacy-win7 main.js DesktopItemMenu.deleteShortcut() delegates
 * deleteItems(this.paths); original this.paths refers to getShortcut(key).path,
 * not the Explorer-created Desktop .lnk backing document.
 */
async function login(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function documents(page:Page):Promise<Locator>{
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]').last();
  await expect(win).toBeVisible();
  await win.locator(".explorer-navigation__home").filter({hasText:"Documents"}).click();
  await expect(win.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(DOCUMENTS);
  return win;
}
test("Desktop path-backed shortcut Delete recycles its real Guest target and retains the link",async({page})=>{
  await login(page);
  const win=await documents(page);
  const bytes=Buffer.from([0,254,17,0,128,88]);
  await win.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Delete Linked.bin",mimeType:"application/octet-stream",buffer:bytes
  });
  const document=win.locator('[data-test-explorer-item="Delete Linked.bin"]');
  await expect(document).toBeVisible();
  await document.click({button:"right"});
  const explorerMenu=win.locator('[data-test-explorer-context="item"]');
  await explorerMenu.locator('[data-test-explorer-item-send-to]').click();
  await explorerMenu.locator('[data-test-explorer-item-send-to-kind="desktop"]').click();
  const link=page.locator('[data-test-desktop-file="'+DESKTOP+
    '/Delete Linked - Shortcut.lnk"]');
  await expect(link).toBeVisible();
  await win.getByRole("button",{name:/^Close /}).click();

  await link.click({button:"right"});
  const menu=page.locator('[data-test-desktop-menu]');
  await expect(menu.locator('[data-test-desktop-item-action="delete"]')).toBeEnabled();
  await menu.locator('[data-test-desktop-item-action="delete"]').click();
  const confirmation=page.getByRole("alertdialog",{name:"Confirm desktop deletion"});
  await expect(confirmation).toContainText("1 selected item");
  await confirmation.getByRole("button",{name:"Yes"}).click();
  await expect(link).toBeVisible();

  const docCheck=await documents(page);
  await expect(docCheck.locator('[data-test-explorer-item="Delete Linked.bin"]'))
    .toHaveCount(0);
  await docCheck.getByRole("button",{name:/^Close /}).click();
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]').last();
  const recycled=bin.locator('[data-test-explorer-item="Delete Linked.bin"]');
  await expect(recycled).toBeVisible();
  await expect(bin.locator('[data-test-explorer-item="Delete Linked - Shortcut.lnk"]'))
    .toHaveCount(0);
  await recycled.click({button:"right"});
  await bin.locator('[data-test-explorer-context="item"]')
    .getByRole("menuitem",{name:"Restore"}).click();
  await expect(recycled).toHaveCount(0);
  await bin.getByRole("button",{name:/^Close /}).click();

  const restored=await documents(page);
  const file=restored.locator('[data-test-explorer-item="Delete Linked.bin"]');
  await expect(file).toBeVisible();
  await file.click({button:"right"});
  const download=page.waitForEvent("download");
  await restored.locator('[data-test-explorer-context="item"]')
    .locator('[data-test-explorer-item-action="download"]').click();
  expect(await readFile(await (await download).path())).toEqual(bytes);
  await expect(link).toBeVisible();
});

test("Desktop program-only .lnk disables Delete and keyboard Delete cannot recycle its JSON",async({page})=>{
  await login(page);
  await page.locator('[data-test-desktop-upload-input]').setInputFiles({
    name:"Program Only No Delete.lnk",mimeType:"application/json",
    buffer:Buffer.from('{"exe":"calc","icon":"calc"}')
  });
  const link=page.locator('[data-test-desktop-file="'+DESKTOP+
    '/Program Only No Delete.lnk"]');
  await expect(link).toBeVisible();
  await link.click({button:"right"});
  const menu=page.locator('[data-test-desktop-menu]');
  await expect(menu.locator('[data-test-desktop-item-action="delete"]'))
    .toBeDisabled();
  await page.keyboard.press("Escape");
  await link.click();
  await page.keyboard.press("Delete");
  await expect(page.getByRole("alertdialog",{name:"Confirm desktop deletion"}))
    .toHaveCount(0);
  await expect(link).toBeVisible();
});
