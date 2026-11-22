import {expect,test,type Page} from "@playwright/test";

/**
 * Frozen legacy-win7@26b9f0ce7 src/modules/apps/computer.js:
 * open(item) short-circuits when item.uri includes this.trashPath BEFORE
 * considering the item type. bin.js is Computer hoisted to trashPath.
 * Thus both Enter and double-click must not browse a deleted folder.
 */
async function makeRecycledTree(page:Page,theme:"win7"|"winxp"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]');
  await expect(computer).toBeVisible();
  async function createFolder(folder:string){
    await computer.getByRole("button",{name:"New folder"}).click();
    const dialog=computer.getByRole("dialog",{name:"New folder"});
    await dialog.getByRole("textbox",{name:"New folder name"}).fill(folder);
    await dialog.getByRole("button",{name:"OK"}).click();
    await expect(computer.locator('[data-test-explorer-item="'+folder+'"]'))
      .toBeVisible();
  }
  await createFolder("Source Locked Bin Folder");
  const parent=computer.locator('[data-test-explorer-item="Source Locked Bin Folder"]');
  await parent.dblclick();
  await expect(computer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(/Source Locked Bin Folder$/);
  await createFolder("Nested Original Folder");
  await computer.getByRole("button",{name:"Back"}).click();
  await expect(parent).toBeVisible();
  await parent.click();
  await computer.getByRole("button",{name:"Delete",exact:true}).click();
  await computer.getByRole("alertdialog",{name:"Confirm file operation"})
    .getByRole("button",{name:"Yes"}).click();
  await expect(parent).toHaveCount(0);
  await computer.getByRole("button",{name:/^Close /}).click();
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]');
  const deleted=bin.locator('[data-test-explorer-item="Source Locked Bin Folder"]');
  await expect(deleted).toBeVisible();
  return {bin,deleted};
}

for(const theme of ["win7","winxp","win11"] as const){
  test("source "+theme+" Recycle Bin blocks opening deleted directories by pointer and Enter, but Restore preserves tree",async({page})=>{
    const {bin,deleted}=await makeRecycledTree(page,theme);
    const address=bin.getByRole("textbox",{name:"Folder address"});
    await expect(address).toHaveValue("Recycle Bin");
    await deleted.dblclick();
    await expect(bin.getByRole("alert")).toContainText(
      "Restore this item from the Recycle Bin before opening it.");
    await expect(address).toHaveValue("Recycle Bin");
    await expect(deleted).toBeVisible();
    await expect(bin.getByRole("button",{name:"Back"})).toBeDisabled();
    await deleted.focus();
    await deleted.press("Enter");
    await expect(address).toHaveValue("Recycle Bin");
    await expect(deleted).toBeVisible();

    await deleted.click();
    await bin.getByRole("button",{name:"Restore",exact:true}).click();
    await expect(deleted).toHaveCount(0);
    await bin.getByRole("button",{name:/^Close /}).click();
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const computer=page.locator('[data-test-window="computer"]');
    const restored=computer.locator('[data-test-explorer-item="Source Locked Bin Folder"]');
    await expect(restored).toBeVisible();
    await restored.dblclick();
    await expect(computer.locator('[data-test-explorer-item="Nested Original Folder"]'))
      .toBeVisible();
  });
}
