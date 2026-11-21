import {expect,test,type Page} from "@playwright/test";
async function makeDeletedFolder(page:Page,theme:"win7"|"winxp"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]');
  await computer.getByRole("button",{name:"New folder"}).click();
  const dialog=computer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"})
    .fill("Bin Source Context "+theme);
  await dialog.getByRole("button",{name:"OK"}).click();
  const entry=computer.locator('[data-test-explorer-item="Bin Source Context '+theme+'"]');
  await expect(entry).toBeVisible();
  await entry.click();
  await computer.getByRole("button",{name:"Delete",exact:true}).click();
  await computer.getByRole("alertdialog",{name:"Confirm file operation"})
    .getByRole("button",{name:"Yes"}).click();
  await expect(entry).toHaveCount(0);
  await computer.getByRole("button",{name:/^Close /}).click();
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]');
  const recycled=bin.locator('[data-test-explorer-item="Bin Source Context '+theme+'"]');
  await expect(recycled).toBeVisible();
  return {bin,recycled};
}
test("source Bin context has exactly Restore, Delete and disabled Properties",async({page})=>{
  const {bin,recycled}=await makeDeletedFolder(page,"win7");
  await recycled.click({button:"right"});
  const menu=bin.locator('[data-test-explorer-context="item"]');
  await expect(menu.getByRole("menuitem")).toHaveText(["Restore","Delete","Properties"]);
  await expect(menu.getByRole("menuitem",{name:"Restore"})).toBeEnabled();
  await expect(menu.getByRole("menuitem",{name:"Properties"})).toBeDisabled();
  await menu.getByRole("menuitem",{name:"Restore"}).click();
  await expect(recycled).toHaveCount(0);
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  await expect(page.locator('[data-test-window="computer"]')
    .locator('[data-test-explorer-item="Bin Source Context win7"]')).toBeVisible();
});
test("source Bin item Delete uses real permanent-confirmation lifecycle",async({page})=>{
  const {bin,recycled}=await makeDeletedFolder(page,"winxp");
  await recycled.click({button:"right"});
  const menu=bin.locator('[data-test-explorer-context="item"]');
  await menu.getByRole("menuitem",{name:"Delete",exact:true}).click();
  const confirmation=bin.getByRole("alertdialog",{name:"Confirm file operation"});
  await expect(confirmation).toContainText("Permanently delete");
  await confirmation.getByRole("button",{name:"No"}).click();
  await expect(recycled).toBeVisible();
  await recycled.click({button:"right"});
  await menu.getByRole("menuitem",{name:"Delete",exact:true}).click();
  await confirmation.getByRole("button",{name:"Yes"}).click();
  await expect(recycled).toHaveCount(0);
});
