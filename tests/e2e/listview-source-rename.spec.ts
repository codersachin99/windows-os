import {expect,test,type Page} from "@playwright/test";

async function openComputer(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win).toBeVisible();
  return win;
}
async function newFolder(win:ReturnType<Page["locator"]>,name:string){
  await win.getByRole("button",{name:"New folder"}).click();
  const dialog=win.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"}).fill(name);
  await dialog.getByRole("button",{name:"OK"}).click();
  const item=win.locator('[data-test-explorer-item="'+name+'"]');
  await expect(item).toBeVisible();
  return item;
}
test("Win7 source F2 starts an inline list-item rename with 30 character input and commits on Enter",async({page})=>{
  const win=await openComputer(page);
  const old=await newFolder(win,"InlineSourceOld");
  await old.click();
  await page.keyboard.press("F2");
  const rename=win.locator('[data-test-source-listview-rename]');
  await expect(rename).toBeVisible();
  await expect(rename).toBeFocused();
  await expect(rename).toHaveAttribute("maxlength","30");
  await expect(rename).toHaveValue("InlineSourceOld");
  await rename.fill("InlineSourceNew");
  await rename.press("Enter");
  await expect(rename).toHaveCount(0);
  await expect(old).toHaveCount(0);
  const updated=win.locator('[data-test-explorer-item="InlineSourceNew"]');
  await expect(updated).toBeVisible();
  await expect(updated).toHaveAttribute("data-test-listview-item","directory");
});
test("Win7 source context Rename, Escape, blur commit, and original popup clickout",async({page})=>{
  const win=await openComputer(page);
  const entry=await newFolder(win,"ContextSourceOld");
  await entry.click();
  await entry.click({button:"right"});
  const menu=win.getByRole("menu",{name:"File actions"});
  await expect(menu).toBeVisible();
  await menu.getByRole("menuitem",{name:"Rename",exact:true}).click();
  const rename=win.locator('[data-test-source-listview-rename]');
  await expect(rename).toBeVisible();
  await rename.fill("DoNotCommit");
  await rename.press("Escape");
  await expect(rename).toHaveCount(0);
  await expect(entry).toBeVisible();
  await expect(win.locator('[data-test-explorer-item="DoNotCommit"]')).toHaveCount(0);
  await entry.click({button:"right"});
  await expect(menu).toBeVisible();
  // Original clickout excludes the active popup; it must remain actionable.
  await menu.getByRole("menuitem",{name:"Copy",exact:true}).click();
  await expect(menu).toHaveCount(0);
  await entry.click({button:"right"});
  await menu.getByRole("menuitem",{name:"Rename",exact:true}).click();
  await expect(rename).toBeVisible();
  await rename.fill("ContextSourceNew");
  // The original source commits renaming on blur, not only via Enter.
  await win.getByRole("button",{name:"New folder"}).click();
  await expect(win.locator('[data-test-explorer-item="ContextSourceNew"]')).toBeVisible();
  const folderDialog=win.getByRole("dialog",{name:"New folder"});
  await folderDialog.getByRole("button",{name:"Cancel"}).click();
  await expect(folderDialog).toHaveCount(0);
});
