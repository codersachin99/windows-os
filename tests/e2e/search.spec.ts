import { expect, test } from "@playwright/test";

test("Explorer recursively finds real documents from Notepad with source-style filename patterns", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]');
  await explorer.getByRole("button", { name: "New folder" }).click();
  const folder = explorer.getByRole("dialog", { name: "New folder" });
  await folder.getByRole("textbox", { name: "New folder name" }).fill("Documents");
  await folder.getByRole("button", { name: "OK" }).click();
  await expect(explorer.locator('[data-test-explorer-item="Documents"]')).toBeVisible();

  await page.getByRole("button", { name: "Open Start menu" }).click();
  await page.locator('[data-test-program="notepad"]').click();
  const note = page.locator('[data-test-window="notepad"]');
  await note.locator(".cm-content").fill("Saved in an Explorer subfolder");
  await note.getByRole("button", { name: "File", exact: true }).click();
  await note.getByRole("button", { name: /^Save Alt/ }).click();
  const dialog = note.locator('[data-test-file-dialog="save"]');
  await dialog.getByRole("button", { name: "Folder Documents" }).dblclick();
  await dialog.getByRole("textbox", { name: "File name:" }).fill("Report");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  // The floating Notepad window is above Computer. Close it before interacting
  // with Explorer's search controls; the saved file remains in shared storage.
  await note.getByRole("button", { name: /^Close / }).click();
  await expect(note).toHaveCount(0);

  await explorer.getByRole("searchbox", { name: "Search files" }).fill("report");
  await expect(explorer.locator('[data-test-explorer-item="Report.txt"]')).toHaveCount(0);
  await explorer.getByRole("checkbox", { name: "Search subfolders" }).check();
  await explorer.getByRole("button", { name: "Find files" }).click();
  await expect(explorer.locator('[data-test-explorer-item="Report.txt"]')).toBeVisible();
  await expect(explorer.getByText("1 found", { exact: true })).toBeVisible();
  await explorer.getByRole("textbox", { name: "File name pattern" }).fill("*.pdf");
  await explorer.getByRole("button", { name: "Find files" }).click();
  await expect(explorer.locator('[data-test-explorer-item="Report.txt"]')).toHaveCount(0);
  await explorer.getByRole("textbox", { name: "File name pattern" }).fill("*.txt");
  await explorer.getByRole("button", { name: "Find files" }).click();
  await expect(explorer.locator('[data-test-explorer-item="Report.txt"]')).toBeVisible();
});
