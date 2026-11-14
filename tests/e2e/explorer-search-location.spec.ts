import { expect, test } from "@playwright/test";

test("ordinary Computer search uses original static Search Results in scoped disk label", async ({page}) => {
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  await explorer.getByRole("button",{name:"System (C:)",exact:true}).click();
  await expect(explorer.getByRole("navigation",{name:"Folder path"})
    .getByRole("button",{name:"System (C:)",exact:true})).toBeVisible();
  await explorer.getByRole("searchbox",{name:"Search files"}).fill("Program");
  await expect(explorer.getByText(/\d+ found/)).toBeVisible();
  const path=explorer.getByRole("navigation",{name:"Folder path"});
  await expect(path.getByText("Search Results in System (C:)",{exact:true})).toBeVisible();
  await expect(path.getByRole("button",{name:"Show sibling folders"})).toHaveCount(1);
  await expect(path.locator(".explorer-address__source-static")).toBeVisible();
  await expect(path.locator(".explorer-address__source-crumb:is(button)")).toHaveCount(0);
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue("/EXTERNAL/computer/drive0");
  await explorer.getByRole("searchbox",{name:"Search files"}).fill("");
  await expect(path.getByRole("button",{name:"System (C:)",exact:true})).toBeVisible();
});

test("classic Find opens Computer with non-clickable Search Results location and search icon", async ({page}) => {
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  await page.locator('[data-test-window="computer"]')
    .getByRole("button",{name:"Advanced Find"}).click();
  const find=page.locator('[data-test-window="find"]');
  await find.getByRole("textbox",{name:"Named"}).fill("Documents");
  await find.getByRole("button",{name:"Find Now"}).click();
  const explorer=page.locator('[data-test-window="computer"]').last();
  await expect(explorer.getByText(/\d+ found/)).toBeVisible();
  const path=explorer.getByRole("navigation",{name:"Folder path"});
  await expect(path.getByText("Search Results",{exact:true})).toBeVisible();
  await expect(path.getByRole("button",{name:"Show sibling folders"})).toHaveCount(1);
  await expect(path.locator(".explorer-address__source-static")).toBeVisible();
  await expect(path.locator(".explorer-address__source-crumb:is(button)")).toHaveCount(0);
  await expect(path.locator(".explorer-address__source-icon")).toHaveAttribute("src",/search/i);
});
