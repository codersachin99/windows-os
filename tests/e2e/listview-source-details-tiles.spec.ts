import {expect,test,type Page} from "@playwright/test";

async function openComputer(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win).toBeVisible();
  return win;
}
async function setView(win:ReturnType<Page["locator"]>,value:"Details"|"Tiles"){
  await win.getByRole("button",{name:"View",exact:true}).click();
  const menu=win.getByRole("menu",{name:"View options"});
  await menu.getByRole("menuitemradio",{name:value,exact:true}).click();
}
test("source listview-tiles inherits file row with actual source extra and navigation",async({page})=>{
  const win=await openComputer(page);
  await expect(win.locator('[data-test-source-listview="tiles"]')).toBeVisible();
  await win.getByRole("button",{name:"New folder"}).click();
  const create=win.getByRole("dialog",{name:"New folder"});
  await create.getByRole("textbox",{name:"New folder name"}).fill("TilesLegacy");
  await create.getByRole("button",{name:"OK"}).click();
  const row=win.locator('[data-test-explorer-item="TilesLegacy"]');
  await expect(row).toBeVisible();
  await expect(row.locator(".listview__item-extra")).toHaveText(["File folder"]);
  await expect(row).toHaveClass(/listview__item/);
  await row.click();
  await expect(row).toHaveClass(/is-selected/);
  await row.dblclick();
  await expect(win.getByRole("textbox",{name:"Folder address"})).toHaveValue("/TilesLegacy");
});
test("source Details and Tiles share extra component while preserving selection and file operations",async({page})=>{
  const win=await openComputer(page);
  await win.getByRole("button",{name:"New folder"}).click();
  const create=win.getByRole("dialog",{name:"New folder"});
  await create.getByRole("textbox",{name:"New folder name"}).fill("DetailsLegacy");
  await create.getByRole("button",{name:"OK"}).click();
  await setView(win,"Details");
  await expect(win.locator('[data-test-source-listview="details"]')).toHaveClass(/has-details/);
  const row=win.locator('[data-test-explorer-item="DetailsLegacy"]');
  await expect(row.locator(".listview__item-extra")).toHaveCount(3);
  await expect(row.locator(".listview__item-extra").nth(1)).toHaveText("File folder");
  await row.click();
  await expect(row).toHaveClass(/is-selected/);
  await setView(win,"Tiles");
  await expect(win.locator('[data-test-source-listview="tiles"]')).toHaveClass(/has-tiles/);
  await expect(row.locator(".listview__item-extra")).toHaveText(["File folder"]);
  await expect(row).toHaveClass(/is-selected/);
  await win.getByRole("button",{name:"Delete",exact:true}).click();
  const confirm=win.getByRole("alertdialog",{name:"Confirm file operation"});
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button",{name:"No",exact:true}).click();
  await expect(row).toBeVisible();
});
