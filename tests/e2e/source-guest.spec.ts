import { expect, test } from "@playwright/test";

test("first-run Guest has source System C: and special folders in Computer", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]');
  await expect(explorer.getByRole("button", { name: "System (C:)" })).toBeVisible();
  await expect(explorer.getByRole("button", { name: "Desktop" })).toBeVisible();
  await expect(explorer.getByRole("button", { name: "Documents" })).toBeVisible();
  await expect(explorer.getByRole("button", { name: "DVD RW Drive (Z:)" })).toBeDisabled();

  await explorer.getByRole("button", { name: "System (C:)" }).click();
  await expect(explorer.getByRole("textbox", { name: "Folder address" }))
    .toHaveValue("/EXTERNAL/computer/drive0");
  await expect(explorer.locator('[data-test-explorer-item="Program Files"]')).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="Users"]')).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="Windows"]')).toBeVisible();

  await explorer.getByRole("button", { name: "Documents" }).click();
  await expect(explorer.getByRole("textbox", { name: "Folder address" }))
    .toHaveValue("/EXTERNAL/computer/drive0/Users/Guest/Documents");
  await explorer.getByRole("button", { name: "Back" }).click();
  await expect(explorer.getByRole("textbox", { name: "Folder address" }))
    .toHaveValue("/EXTERNAL/computer/drive0");
});

test("Explorer background and item context menus use shared folder commands", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]');
  await explorer.getByRole("button", { name: "Documents" }).click();

  await explorer.getByRole("region", { name: "Folder contents" }).click({ button: "right", position: { x: 180, y: 80 } });
  const menu = explorer.locator('[data-test-explorer-context="background"]');
  await expect(menu.getByRole("menuitem", { name: "New folder" })).toBeVisible();
  await menu.getByRole("menuitem", { name: "New folder" }).click();
  const create = explorer.getByRole("dialog", { name: "New folder" });
  await create.getByRole("textbox", { name: "New folder name" }).fill("Archive");
  await create.getByRole("button", { name: "OK" }).click();
  const item = explorer.locator('[data-test-explorer-item="Archive"]');
  await expect(item).toBeVisible();

  await item.click({ button: "right" });
  const actions = explorer.locator('[data-test-explorer-context="item"]');
  await expect(actions.getByRole("menuitem", { name: "Open" })).toBeVisible();
  await expect(actions.getByRole("menuitem", { name: "Copy" })).toBeVisible();
  await actions.getByRole("menuitem", { name: "Rename" }).click();
  const rename = explorer.getByRole("dialog", { name: "Rename" });
  await rename.getByRole("textbox", { name: "Rename item" }).fill("Renamed Archive");
  await rename.getByRole("button", { name: "OK" }).click();
  await expect(explorer.locator('[data-test-explorer-item="Renamed Archive"]')).toBeVisible();
  await expect(item).toHaveCount(0);

  await explorer.locator('[data-test-explorer-item="Renamed Archive"]').click({ button: "right" });
  await page.keyboard.press("Escape");
  await expect(explorer.locator('[data-test-explorer-context]')).toHaveCount(0);
});
