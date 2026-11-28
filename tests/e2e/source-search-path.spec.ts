import { expect, test } from "@playwright/test";

test("source Find file-kind search opens Computer through shell:search and returns folders only", async ({page})=>{
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const original=page.locator('[data-test-window="computer"]').first();
  await original.getByRole("button",{name:"New folder"}).click();
  const folder=original.getByRole("dialog",{name:"New folder"});
  await folder.getByRole("textbox",{name:"New folder name"}).fill("SourcePathKindCheck");
  await folder.getByRole("button",{name:"OK"}).click();
  await expect(original.locator('[data-test-explorer-item="SourcePathKindCheck"]')).toBeVisible();
  await original.getByRole("button",{name:"Advanced Find"}).click();
  const find=page.locator('[data-test-window="find"]');
  await find.getByRole("textbox",{name:"Named"}).fill("SourcePathKindCheck");
  await find.getByRole("tab",{name:"Advanced"}).click();
  await find.getByRole("combobox",{name:"Of type"}).selectOption("folder");
  await find.getByRole("button",{name:"Find Now"}).click();
  const windows=page.locator('[data-test-window="computer"]');
  await expect(windows).toHaveCount(2);
  const results=windows.last();
  await expect(results.locator('[data-test-explorer-item="SourcePathKindCheck"]')).toBeVisible();
  await expect(results.getByText("1 found",{exact:true})).toBeVisible();
  await expect(original).toBeVisible();
});
