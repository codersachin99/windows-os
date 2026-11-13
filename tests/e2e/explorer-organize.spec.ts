import { expect, test } from "@playwright/test";

async function openComputer(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  return page.locator('[data-test-window="computer"]');
}

test("source Organize menu has original commands, separators, and selection gates", async ({page}) => {
  const explorer=await openComputer(page);
  const trigger=explorer.getByRole("button",{name:"Organize",exact:true});
  await trigger.click();
  const menu=explorer.getByRole("menu",{name:"Organize"});
  await expect(menu).toBeVisible();
  const expected=["Cut","Copy","Paste","Undo","Redo","Select all","Layout",
    "Folder and search options","Delete","Rename","Remove properties","Properties","Close"];
  await expect(menu.getByRole("menuitem")).toHaveText(expected);
  await expect(menu.getByRole("separator")).toHaveCount(3);
  for(const item of ["Cut","Copy","Paste","Undo","Redo","Select all","Layout",
    "Folder and search options","Delete","Rename","Remove properties","Properties"]) {
    await expect(menu.getByRole("menuitem",{name:item,exact:true})).toBeDisabled();
  }
  await expect(menu.getByRole("menuitem",{name:"Close"})).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);

  await explorer.getByRole("button",{name:"New folder"}).click();
  const prompt=explorer.getByRole("dialog",{name:"New folder"});
  await prompt.getByRole("textbox",{name:"New folder name"}).fill("SourceOrganizeProbe");
  await prompt.getByRole("button",{name:"OK"}).click();
  const folder=explorer.locator('[data-test-explorer-item="SourceOrganizeProbe"]');
  await expect(folder).toBeVisible();
  await folder.click();
  await trigger.click();
  for(const item of ["Cut","Copy","Delete","Rename"]) {
    await expect(menu.getByRole("menuitem",{name:item,exact:true})).toBeEnabled();
  }
  await expect(menu.getByRole("menuitem",{name:"Paste"})).toBeDisabled();
  await menu.getByRole("menuitem",{name:"Copy"}).click();
  await expect(menu).toHaveCount(0);
  await expect(explorer.getByText("copy 1",{exact:false})).toBeVisible();
  await trigger.click();
  await expect(menu.getByRole("menuitem",{name:"Paste"})).toBeEnabled();
  await menu.getByRole("menuitem",{name:"Rename"}).click();
  const rename=explorer.getByRole("dialog",{name:"Rename"});
  await rename.getByRole("textbox",{name:"Rename item"}).fill("OrganizeRenamed");
  await rename.getByRole("button",{name:"OK"}).click();
  await expect(explorer.locator('[data-test-explorer-item="OrganizeRenamed"]')).toBeVisible();
});

test("source Organize Delete uses existing confirmation; Close uses shell lifecycle", async ({page}) => {
  const explorer=await openComputer(page);
  await explorer.getByRole("button",{name:"New folder"}).click();
  const create=explorer.getByRole("dialog",{name:"New folder"});
  await create.getByRole("textbox",{name:"New folder name"}).fill("OrganizeDeleteProbe");
  await create.getByRole("button",{name:"OK"}).click();
  const folder=explorer.locator('[data-test-explorer-item="OrganizeDeleteProbe"]');
  await folder.click();
  await explorer.getByRole("button",{name:"Organize",exact:true}).click();
  await explorer.getByRole("menu",{name:"Organize"})
    .getByRole("menuitem",{name:"Delete"}).click();
  const dialog=explorer.getByRole("alertdialog",{name:"Confirm file operation"});
  await expect(dialog).toContainText("Recycle Bin");
  await dialog.getByRole("button",{name:"Yes"}).click();
  await expect(folder).toHaveCount(0);

  await explorer.getByRole("button",{name:"Organize",exact:true}).click();
  await explorer.getByRole("menu",{name:"Organize"})
    .getByRole("menuitem",{name:"Close"}).click();
  await expect(explorer).toHaveCount(0);
});

test("Organize supports keyboard arrows, Escape, and outside click dismissal", async ({page}) => {
  const explorer=await openComputer(page);
  const trigger=explorer.getByRole("button",{name:"Organize",exact:true});
  await trigger.click();
  const menu=explorer.getByRole("menu",{name:"Organize"});
  await expect(menu.getByRole("menuitem",{name:"Close"})).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(menu.getByRole("menuitem",{name:"Close"})).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await explorer.getByRole("searchbox",{name:"Search files"}).click();
  await expect(menu).toHaveCount(0);
});
