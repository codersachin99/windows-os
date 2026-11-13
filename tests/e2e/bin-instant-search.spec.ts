import { expect, test } from "@playwright/test";

test("Win7 Bin inherits Computer instant search and clearing preserves Restore", async ({page}) => {
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]');
  await computer.getByRole("button",{name:"New folder"}).click();
  const dialog=computer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"}).fill("BinInstantProbe");
  await dialog.getByRole("button",{name:"OK"}).click();
  const original=computer.locator('[data-test-explorer-item="BinInstantProbe"]');
  await expect(original).toBeVisible();
  await original.click();
  await computer.getByRole("button",{name:"Delete",exact:true}).click();
  await computer.getByRole("alertdialog",{name:"Confirm file operation"})
    .getByRole("button",{name:"Yes"}).click();
  await expect(original).toHaveCount(0);

  // Open Bin after Computer so its window is above the Computer while testing
  // real hit-testing and shell interactions (not forced Playwright clicks).
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]');
  const search=bin.getByRole("searchbox",{name:"Search files"});
  const item=bin.locator('[data-test-explorer-item="BinInstantProbe"]');
  await expect(item).toBeVisible();
  await expect(search).toHaveAttribute("placeholder","Search Recycle Bin");
  await expect(bin.getByRole("button",{name:"Find files"})).toHaveCount(0);
  await expect(bin.getByRole("button",{name:"Clear results"})).toHaveCount(0);

  await search.fill("BinInstantProbe");
  await expect(bin.getByText("1 found",{exact:true})).toBeVisible();
  await expect(bin.getByRole("navigation",{name:"Folder path"})
    .getByText("Search Results in Recycle Bin",{exact:true})).toBeVisible();
  await expect(item).toBeVisible();

  await search.fill("NoSuchRecycledFile");
  await expect(bin.getByText("0 found",{exact:true})).toBeVisible();
  await expect(item).toHaveCount(0);
  await search.fill("");
  await expect(bin.getByText("0 found",{exact:true})).toHaveCount(0);
  await expect(bin.getByRole("navigation",{name:"Folder path"})
    .getByRole("button",{name:"Recycle Bin",exact:true})).toBeVisible();
  await expect(item).toBeVisible();
  await item.click();
  await bin.getByRole("button",{name:"Restore",exact:true}).click();
  await expect(item).toHaveCount(0);
  await expect(original).toBeVisible();
});
