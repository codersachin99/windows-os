import { test, expect } from "@playwright/test";

async function desktop(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
}
async function computer(page: import("@playwright/test").Page) {
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const windows = page.locator('[data-test-window="computer"]');
  return windows.last();
}
async function folder(win: import("@playwright/test").Locator, name: string) {
  await win.getByRole("button", { name: "New folder" }).click();
  const form = win.getByRole("dialog", { name: "New folder" });
  await form.getByRole("textbox", { name: "New folder name" }).fill(name);
  await form.getByRole("button", { name: "OK" }).click();
  await expect(win.locator('[data-test-explorer-item="' + name + '"]')).toBeVisible();
}
test("Explorer Cut/Copy/Paste uses the same persistent virtual files, never host files", async ({ page }) => {
  await desktop(page);
  await page.getByRole("button", { name: "Open Start menu" }).click();
  await page.locator('[data-test-program="notepad"]').click();
  const note = page.locator('[data-test-window="notepad"]');
  await note.locator(".cm-content").fill("shared via clipboard");
  await note.getByRole("button", { name: "File", exact: true }).click();
  await note.getByRole("button", { name: /^Save Alt/ }).click();
  const save = note.locator('[data-test-file-dialog="save"]');
  await save.getByRole("textbox", { name: "File name:" }).fill("source");
  await save.getByRole("button", { name: "Save", exact: true }).click();
  await expect(save).toHaveCount(0);
  await note.getByRole("button", { name: /^Close / }).click();

  const win = await computer(page);
  await folder(win, "Copied");
  await folder(win, "Moved");
  await win.locator('[data-test-explorer-item="source.txt"]').click();
  await win.getByRole("button", { name: "Copy", exact: true }).click();
  await win.locator('[data-test-explorer-item="Copied"]').dblclick();
  await win.getByRole("button", { name: "Paste", exact: true }).click();
  await expect(win.locator('[data-test-explorer-item="source.txt"]')).toBeVisible();
  await win.getByRole("button", { name: "Back" }).click();
  await expect(win.locator('[data-test-explorer-item="source.txt"]')).toBeVisible();

  await win.locator('[data-test-explorer-item="source.txt"]').click();
  await win.getByRole("button", { name: "Cut", exact: true }).click();
  await win.locator('[data-test-explorer-item="Moved"]').dblclick();
  await win.getByRole("button", { name: "Paste", exact: true }).click();
  await expect(win.locator('[data-test-explorer-item="source.txt"]')).toBeVisible();
  await win.getByRole("button", { name: "Back" }).click();
  await expect(win.locator('[data-test-explorer-item="source.txt"]')).toHaveCount(0);
  await win.locator('[data-test-explorer-item="Copied"]').dblclick();
  await expect(win.locator('[data-test-explorer-item="source.txt"]')).toBeVisible();
});

test("Explorer prevents overwriting existing files during paste", async ({ page }) => {
  await desktop(page);
  const win = await computer(page);
  await folder(win, "A");
  await folder(win, "B");
  await win.locator('[data-test-explorer-item="A"]').click();
  await win.getByRole("button", { name: "Copy", exact: true }).click();
  await win.getByRole("button", { name: "Paste", exact: true }).click();
  await expect(win.getByRole("alert")).toContainText("Cannot paste into the same file");
  await expect(win.locator('[data-test-explorer-item="A"]')).toHaveCount(1);
});
