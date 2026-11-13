import { expect, test } from "@playwright/test";

test("Win7 breadcrumb clicks follow original Computer/disk/folder paths and preserve history", async ({page}) => {
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  const path=explorer.getByRole("navigation",{name:"Folder path"});
  await expect(path.getByRole("button",{name:"Computer"})).toBeVisible();
  await expect(path.locator(".explorer-address__source-icon")).toHaveCSS("width","18px");
  // Navigate via the existing source C: mount, not an invented host directory.
  await explorer.getByRole("button",{name:"System (C:)",exact:true}).click();
  await expect(path.getByRole("button",{name:"System (C:)",exact:true})).toBeVisible();
  await expect(path.getByRole("button",{name:"System (C:)",exact:true}))
    .toHaveAttribute("aria-current","location");
  await explorer.locator('[data-test-explorer-item="Users"]').dblclick();
  await explorer.locator('[data-test-explorer-item="Guest"]').dblclick();
  await explorer.locator('[data-test-explorer-item="Documents"]').dblclick();
  await expect(path.getByRole("button",{name:"Documents"})).toBeVisible();
  await expect(path.getByRole("button",{name:"Documents"}))
    .toHaveAttribute("aria-current","location");
  await path.getByRole("button",{name:"Users",exact:true}).click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue("/EXTERNAL/computer/drive0/Users");
  await explorer.getByRole("button",{name:"Back"}).click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue("/EXTERNAL/computer/drive0/Users/Guest/Documents");
  await path.getByRole("button",{name:"Computer",exact:true}).click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue("/EXTERNAL/computer");
});

test("Win7 25px address refresh keeps location/history and existing folder data", async ({page}) => {
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  const location=explorer.locator(".explorer-address__location-wrapper");
  const reload=explorer.getByRole("button",{name:"Reload current folder"});
  await expect(location).toHaveCSS("height","25px");
  await expect(reload).toBeVisible();
  await expect(reload).toHaveCSS("width","25px");
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"}).fill("RefreshPathProbe");
  await dialog.getByRole("button",{name:"OK"}).click();
  await expect(explorer.locator('[data-test-explorer-item="RefreshPathProbe"]')).toBeVisible();
  await reload.click();
  await expect(explorer.locator('[data-test-explorer-item="RefreshPathProbe"]')).toBeVisible();
  await expect(explorer.getByRole("textbox",{name:"Folder address"})).toHaveValue("Computer");
  await expect(explorer.getByRole("navigation",{name:"Folder path"})).toBeVisible();
});

test("Win7 source AddressbarItem renders 16px disclosure per segment and exact refresh art", async ({page}) => {
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  const path=explorer.getByRole("navigation",{name:"Folder path"});
  await expect(path.getByRole("button",{name:"Folder icon"})).toBeVisible();
  await expect(path.getByRole("button",{name:"Show sibling folders"})).toHaveCount(1);
  await expect(path.locator(".explorer-address__source-dropdown")).toHaveCSS("width","16px");
  // Source 3b99 refreshIcon is themeData.icon["fileexplorer-refresh"].
  const refresh=explorer.getByRole("button",{name:"Reload current folder"});
  await expect(refresh.locator("img")).toHaveAttribute(
    "src","/assets/images/fileexplorer-refresh.7f376545.webp");
  await expect(refresh.locator("img")).toHaveCSS("width","16px");
  const response=await page.request.get("/assets/images/fileexplorer-refresh.7f376545.webp");
  expect(response.ok()).toBe(true);
  // In the original Vue component the disclosure has no event listener.
  await path.getByRole("button",{name:"Show sibling folders"}).click();
  await expect(path.getByRole("button",{name:"Computer"})).toBeVisible();
  await expect(explorer.getByRole("textbox",{name:"Folder address"})).toHaveAttribute("readonly","");
  await expect(explorer.getByRole("textbox",{name:"Folder address"})).toHaveAttribute("tabindex","-1");
  await explorer.getByRole("button",{name:"System (C:)",exact:true}).click();
  const labels=path.locator(".explorer-address__source-item");
  await expect(labels).toHaveCount(2);
  await expect(path.getByRole("button",{name:"Show sibling folders"})).toHaveCount(2);
});
