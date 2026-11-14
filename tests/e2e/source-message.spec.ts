import {expect,test,type Page} from "@playwright/test";

async function openComputer(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]');
  await expect(computer).toBeVisible();
  return computer;
}
async function makeFolder(win:ReturnType<Page["locator"]>,name:string){
  await win.getByRole("button",{name:"New folder"}).click();
  const dialog=win.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"}).fill(name);
  await dialog.getByRole("button",{name:"OK"}).click();
  const item=win.locator('[data-test-explorer-item="'+name+'"]');
  await expect(item).toBeVisible();
  return item;
}
async function deleteSelected(win:ReturnType<Page["locator"]>){
  await win.getByRole("button",{name:"Delete",exact:true}).click();
  const dialog=win.getByRole("alertdialog",{name:"Confirm file operation"});
  await expect(dialog).toBeVisible();
  return dialog;
}
test("original message-confirm has source yes/no markers and No is the default",async({page})=>{
  const win=await openComputer(page);
  const file=await makeFolder(win,"MessageConfirmKeep");
  await file.click();
  const dialog=await deleteSelected(win);
  await expect(dialog).toContainText("Move the selected items to the Recycle Bin?");
  await expect(dialog.locator(".source-message__icon"))
    .toHaveAttribute("src","/assets/images/warning.cce1fd36.webp");
  await expect(dialog.locator('[data-test-confirm-answer="yes"]')).toHaveText("Yes");
  const no=dialog.locator('[data-test-confirm-answer="no"]');
  await expect(no).toHaveText("No");
  await expect(no).toBeFocused();
  await no.click();
  await expect(dialog).toHaveCount(0);
  await expect(file).toBeVisible();
  await file.click();
  await deleteSelected(win);
  await page.keyboard.press("Escape");
  await expect(win.getByRole("alertdialog",{name:"Confirm file operation"})).toHaveCount(0);
  await expect(file).toBeVisible();
});
test("source confirmation Yes moves a real folder into the Recycle Bin",async({page})=>{
  const win=await openComputer(page);
  const file=await makeFolder(win,"MessageConfirmDelete");
  await file.click();
  const dialog=await deleteSelected(win);
  await dialog.locator('[data-test-confirm-answer="yes"]').click();
  await expect(dialog).toHaveCount(0);
  await expect(file).toHaveCount(0);
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]');
  await expect(bin).toBeVisible();
  await expect(bin.locator('[data-test-explorer-item="MessageConfirmDelete"]')).toBeVisible();
});
