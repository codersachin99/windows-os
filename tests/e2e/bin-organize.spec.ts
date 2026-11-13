import { expect, test } from "@playwright/test";

async function openBin(page: import("@playwright/test").Page) {
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  return page.locator('[data-test-window="bin"]');
}

const sourceLabels=[
  "Cut","Copy","Paste","Undo","Redo","Select all","Layout",
  "Folder and search options","Delete","Rename",
  "Remove properties","Properties","Close"
];

test("source bin.js inherits Computer Organize menu and Close shell lifecycle", async ({page}) => {
  const bin=await openBin(page);
  await expect(bin).toBeVisible();
  const trigger=bin.getByRole("button",{name:"Organize",exact:true});
  await expect(trigger).toBeEnabled();
  await trigger.click();
  const menu=bin.getByRole("menu",{name:"Organize"});
  await expect(menu.getByRole("menuitem")).toHaveText(sourceLabels);
  await expect(menu.getByRole("separator")).toHaveCount(3);
  for(const label of sourceLabels.filter(x=>x!=="Close")) {
    await expect(menu.getByRole("menuitem",{name:label,exact:true})).toBeDisabled();
  }
  await menu.getByRole("menuitem",{name:"Close"}).click();
  await expect(bin).toHaveCount(0);
});

test("Bin Organize Delete confirms permanent deletion and protects Restore/clipboard", async ({page}) => {
  const bin=await openBin(page);
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]');
  await computer.getByRole("button",{name:"New folder"}).click();
  const create=computer.getByRole("dialog",{name:"New folder"});
  await create.getByRole("textbox",{name:"New folder name"}).fill("BinMenuDeleteProbe");
  await create.getByRole("button",{name:"OK"}).click();
  const original=computer.locator('[data-test-explorer-item="BinMenuDeleteProbe"]');
  await original.click();
  await computer.getByRole("button",{name:"Delete",exact:true}).click();
  await computer.getByRole("alertdialog",{name:"Confirm file operation"})
    .getByRole("button",{name:"Yes"}).click();
  await expect(original).toHaveCount(0);
  const recycled=bin.locator('[data-test-explorer-item="BinMenuDeleteProbe"]');
  await expect(recycled).toBeVisible();
  await recycled.click();

  const trigger=bin.getByRole("button",{name:"Organize",exact:true});
  await trigger.click();
  const menu=bin.getByRole("menu",{name:"Organize"});
  for(const label of ["Cut","Copy","Paste","Rename"]) {
    await expect(menu.getByRole("menuitem",{name:label,exact:true})).toBeDisabled();
  }
  await expect(menu.getByRole("menuitem",{name:"Delete",exact:true})).toBeEnabled();
  await menu.getByRole("menuitem",{name:"Delete",exact:true}).click();
  const confirm=bin.getByRole("alertdialog",{name:"Confirm file operation"});
  await expect(confirm).toContainText("Permanently delete");
  await confirm.getByRole("button",{name:"No"}).click();
  await expect(recycled).toBeVisible();
  await expect(bin.getByRole("button",{name:"Restore",exact:true})).toBeEnabled();

  await trigger.click();
  await menu.getByRole("menuitem",{name:"Delete",exact:true}).click();
  await confirm.getByRole("button",{name:"Yes"}).click();
  await expect(recycled).toHaveCount(0);
  await trigger.click();
  await expect(menu.getByRole("menuitem",{name:"Delete",exact:true})).toBeDisabled();
});
