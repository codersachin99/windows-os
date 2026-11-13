import { expect, test } from "@playwright/test";

test("Computer search index revalidates results after Guest folder creation", async ({page}) => {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');

  await explorer.getByRole("searchbox",{name:"Search files"}).fill("IndexRefreshProbe");
  await explorer.getByRole("button",{name:"Find files"}).click();
  await expect(explorer.getByText("0 found",{exact:true})).toBeVisible();

  // Explorer remains in the same session. Creating an actual folder emits a
  // VFS change event that invalidates the parent listing and reruns Search.
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"}).fill("IndexRefreshProbe");
  await dialog.getByRole("button",{name:"OK"}).click();
  await expect(explorer.getByText("1 found",{exact:true})).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="IndexRefreshProbe"]'))
    .toBeVisible();
  await explorer.getByRole("button",{name:"Clear results"}).click();
  await expect(explorer.getByText("1 found",{exact:true})).toHaveCount(0);
});

test("source Find results use cached index and show numeric progress while searching", async ({page}) => {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.keyboard.press("Meta+f");
  const find=page.locator('[data-test-window="find"]');
  await find.getByRole("textbox",{name:"Named"}).fill("Docs");
  await find.getByRole("button",{name:"Find Now"}).click();
  const explorer=page.locator('[data-test-window="computer"]').last();
  await expect(explorer).toBeVisible();
  await expect(explorer.locator('[data-test-explorer]')).toBeVisible();
  // Search controls retain the source Computer UI after result completion.
  await expect(explorer.getByText(/\d+ found/,{exact:false})).toBeVisible();
  await expect(explorer.getByRole("progressbar",{name:"Search progress"}))
    .toHaveCount(0);
});
