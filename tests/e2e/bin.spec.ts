import { expect, test } from "@playwright/test";

const fixture = {
  version: 1,
  runtime: {
    root: "/source/system",
    disks: [{ letter: "C", path: "/source/system/disk-1", label: "System" }],
    desktopPath: "/source/system/disk-1/users/Guest/Desktop",
    trashPath: "/source/system/disk-1/$trash",
    user: { folder: "Guest", name: "Guest" }
  }
};

test("Bin shares source-provided trashPath with Computer and restores files without data loss", async ({ page }) => {
  // This fixture supplies source-shaped runtime values explicitly. The
  // application itself has no invented C: or Recycle Bin defaults.
  await page.addInitScript(data => {
    localStorage.setItem("windows-os:legacy-source-mounts:guest:v1", JSON.stringify(data));
  }, fixture);
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.getByRole("button", { name: "Open Start menu" }).click();
  await page.locator('[data-test-program="notepad"]').click();
  const note = page.locator('[data-test-window="notepad"]');
  await note.locator(".cm-content").fill("Recovered by Recycle Bin");
  await note.getByRole("button", { name: "File", exact: true }).click();
  await note.getByRole("button", { name: /^Save Alt/ }).click();
  const save = note.locator('[data-test-file-dialog="save"]');
  await save.getByRole("textbox", { name: "File name:" }).fill("recoverable");
  await save.getByRole("button", { name: "Save", exact: true }).click();
  await expect(save).toHaveCount(0);
  await note.getByRole("button", { name: /^Close / }).click();

  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]');
  const item = explorer.locator('[data-test-explorer-item="recoverable.txt"]');
  await expect(item).toBeVisible();
  await item.click();
  await expect(explorer.getByRole("button", { name: "Delete", exact: true })).toBeEnabled();
  await explorer.getByRole("button", { name: "Delete", exact: true }).click();
  const confirm = explorer.getByRole("alertdialog", { name: "Confirm file operation" });
  await confirm.getByRole("button", { name: "Yes" }).click();
  await expect(item).toHaveCount(0);

  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin = page.locator('[data-test-window="bin"]');
  await expect(bin.locator('[data-test-recycle-bin="unmounted"]')).toHaveCount(0);
  const recycled = bin.locator('[data-test-explorer-item="recoverable.txt"]');
  await expect(recycled).toBeVisible();
  await recycled.click();
  await bin.getByRole("button", { name: "Restore", exact: true }).click();
  await expect(recycled).toHaveCount(0);
  await expect(item).toBeVisible();

  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  await expect(page.locator('[data-test-window="computer"] [data-test-explorer-item="recoverable.txt"]')).toBeVisible();
});

test("unconfigured Bin does not fabricate source disks or claim items are empty", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin = page.locator('[data-test-window="bin"]');
  await expect(bin.locator('[data-test-recycle-bin="unmounted"]')).toBeVisible();
  await expect(bin).toContainText("source Recycle Bin volume has not been mounted");
});
