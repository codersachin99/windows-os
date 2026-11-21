import { expect, test } from "@playwright/test";

test("Computer and Notepad share persistent files and original TXT association", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.getByRole("button", { name: "Open Start menu" }).click();
  await page.locator('[data-test-program="notepad"]').click();
  const note = page.locator('[data-test-window="notepad"]');
  await expect(note.locator(".cm-content")).toBeVisible();
  await note.locator(".cm-content").fill("Shared between applications");
  await note.getByRole("button", { name: "File", exact: true }).click();
  await note.getByRole("button", { name: /^Save Alt/ }).click();
  const dialog = note.locator('[data-test-file-dialog="save"]');
  await dialog.getByRole("textbox", { name: "File name:" }).fill("shared");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await note.getByRole("button", { name: /^Close / }).click();

  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]');
  await expect(explorer.locator('[data-test-explorer-item="shared.txt"]')).toBeVisible();
  await explorer.locator('[data-test-explorer-item="shared.txt"]').dblclick();
  const reopened = page.locator('[data-test-window="notepad"]');
  await expect(reopened.locator(".cm-content")).toContainText("Shared between applications");
  await expect(reopened.locator(".windows-window__title")).toHaveText("shared.txt - Notepad");
});

test("Computer creates folders and maintains navigation history", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]');
  await expect(explorer.locator('[data-test-explorer]')).toBeVisible();
  await explorer.getByRole("button", { name: "New folder" }).click();
  const modal = explorer.getByRole("dialog", { name: "New folder" });
  await modal.getByRole("textbox", { name: "New folder name" }).fill("Documents");
  await modal.getByRole("button", { name: "OK" }).click();
  await expect(explorer.locator('[data-test-explorer-item="Documents"]')).toBeVisible();
  await explorer.locator('[data-test-explorer-item="Documents"]').dblclick();
  await expect(explorer.getByRole("textbox", { name: "Folder address" })).toHaveValue("/Documents");
  await explorer.getByRole("button", { name: "Back" }).click();
  await expect(explorer.getByRole("textbox", { name: "Folder address" })).toHaveValue("Computer");
  await explorer.getByRole("button", { name: "Forward" }).click();
  await expect(explorer.getByRole("textbox", { name: "Folder address" })).toHaveValue("/Documents");
});
