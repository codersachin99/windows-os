import { expect, test, type Locator } from "@playwright/test";

async function createFolder(explorer:Locator, name:string) {
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"}).fill(name);
  await dialog.getByRole("button",{name:"OK"}).click();
  await expect(explorer.locator('[data-test-explorer-item="'+name+'"]')).toBeVisible();
}

test("source Find Computer scope searches mounted drive0 but excludes non-disk Computer node",async({page})=>{
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();

  // Reconstruct the exact source getStats distinction: /EXTERNAL/computer
  // itself may contain ordinary VFS children that are NOT mounted disks.
  await explorer.locator('[data-test-explorer-item="EXTERNAL"]').dblclick();
  await explorer.locator('[data-test-explorer-item="computer"]').dblclick();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue("/EXTERNAL/computer");
  await createFolder(explorer,"MountedScopeProbeOutside");
  await explorer.getByRole("button",{name:"System (C:)"}).click();
  await createFolder(explorer,"MountedScopeProbeInside");

  await page.keyboard.press("Meta+f");
  const find=page.locator('[data-test-window="find"]');
  await expect(find).toBeVisible();
  await find.getByRole("combobox",{name:"Look in"}).selectOption({label:"Computer"});
  await find.getByRole("textbox",{name:"Named"}).fill("Mountedscopeprobe");
  await find.getByRole("button",{name:"Find Now"}).click();
  const windows=page.locator('[data-test-window="computer"]');
  await expect(windows).toHaveCount(2);
  const results=windows.last();
  await expect(results.locator('[data-test-explorer-item="MountedScopeProbeInside"]'))
    .toBeVisible();
  await expect(results.locator('[data-test-explorer-item="MountedScopeProbeOutside"]'))
    .toHaveCount(0);
  await expect(results.getByText("1 found",{exact:true})).toBeVisible();
});
