import { expect, test } from "@playwright/test";

test("Win7 source search types directly into scoped results without Find button", async ({page}) => {
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  const search=explorer.getByRole("searchbox",{name:"Search files"});
  await expect(explorer.getByRole("button",{name:"Find files"})).toHaveCount(0);
  await expect(search).toHaveAttribute("placeholder","Search Computer");
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"}).fill("InstantSearchProbe");
  await dialog.getByRole("button",{name:"OK"}).click();
  await expect(explorer.locator('[data-test-explorer-item="InstantSearchProbe"]')).toBeVisible();
  await search.fill("InstantSearchProbe");
  await expect(explorer.getByText("1 found",{exact:true})).toBeVisible();
  await expect(explorer.getByRole("navigation",{name:"Folder path"})
    .getByText("Search Results in Computer",{exact:true})).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="InstantSearchProbe"]')).toBeVisible();
  await search.fill("");
  await expect(explorer.getByText("1 found",{exact:true})).toHaveCount(0);
  await expect(explorer.getByRole("navigation",{name:"Folder path"})
    .getByRole("button",{name:"Computer",exact:true})).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="InstantSearchProbe"]')).toBeVisible();
});

test("Win7 source instant search debounces typing and follows current folder scope", async ({page}) => {
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  await explorer.getByRole("button",{name:"System (C:)",exact:true}).click();
  const search=explorer.getByRole("searchbox",{name:"Search files"});
  await expect(search).toHaveAttribute("placeholder","Search System (C:)");
  await search.fill("usr");
  await search.fill("Users");
  await expect(explorer.getByText("1 found",{exact:true})).toBeVisible();
  await expect(explorer.getByRole("navigation",{name:"Folder path"})
    .getByText("Search Results in System (C:)",{exact:true})).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="Users"]')).toBeVisible();
  await search.fill("");
  await expect(explorer.getByRole("navigation",{name:"Folder path"})
    .getByRole("button",{name:"System (C:)",exact:true})).toBeVisible();
  await expect(explorer.getByRole("button",{name:"Find files"})).toHaveCount(0);
});
