import { expect, test } from "@playwright/test";

async function openNotepad(page: import("@playwright/test").Page) {
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.getByRole("button", { name: "Open Start menu" }).click();
  await page.locator('[data-test-program="notepad"]').click();
  const win = page.locator('[data-test-window="notepad"]');
  await expect(win).toBeVisible();
  await expect(win.locator(".cm-content")).toBeVisible();
  return win;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Notepad keeps its CodeMirror document and unsaved state across minimize/restore", async ({ page }) => {
  const win = await openNotepad(page);
  await win.locator(".cm-content").fill("Unsaved text");
  await expect(win.locator(".windows-window__title")).toHaveText("*Untitled - Notepad");
  await win.getByRole("button", { name: /^Minimize / }).click();
  await expect(page.locator('[data-test-window="notepad"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Switch to *Untitled - Notepad" }).click();
  await expect(win.locator(".cm-content")).toContainText("Unsaved text");
  await win.getByRole("button", { name: /^Close / }).click();
  const confirm = win.getByRole("alertdialog", { name: "Save changes" });
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Cancel" }).click();
  await expect(win).toBeVisible();
  await win.getByRole("button", { name: /^Close / }).click();
  await confirm.getByRole("button", { name: "No" }).click();
  await expect(win).toHaveCount(0);
});

test("Notepad saves and reopens a shared virtual file without host-disk access", async ({ page }) => {
  const win = await openNotepad(page);
  await win.locator(".cm-content").fill("A saved document");
  await win.getByRole("button", { name: "File", exact: true }).click();
  await win.getByRole("button", { name: /^Save Alt/ }).click();
  const dialog = win.locator('[data-test-file-dialog="save"]');
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: "File name:" }).fill("notes");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(win.locator(".windows-window__title")).toHaveText("notes.txt - Notepad");
  await win.getByRole("button", { name: /^Close / }).click();
  await expect(win).toHaveCount(0);

  await page.getByRole("button", { name: "Open Start menu" }).click();
  await page.locator('[data-test-program="notepad"]').click();
  const reopened = page.locator('[data-test-window="notepad"]');
  await reopened.getByRole("button", { name: "File", exact: true }).click();
  await reopened.getByRole("button", { name: /^Open/ }).click();
  const open = reopened.locator('[data-test-file-dialog="open"]');
  await expect(open.getByRole("button", { name: "File notes.txt" })).toBeVisible();
  await open.getByRole("button", { name: "File notes.txt" }).click();
  await open.getByRole("button", { name: "Open", exact: true }).click();
  await expect(open).toHaveCount(0);
  await expect(reopened.locator(".cm-content")).toContainText("A saved document");
  await expect(reopened.locator(".windows-window__title")).toHaveText("notes.txt - Notepad");
});

test("Notepad preserves unsaved work when the window close is cancelled and supports Save on close", async ({ page }) => {
  const win = await openNotepad(page);
  await win.locator(".cm-content").fill("Save on close");
  await page.keyboard.press("Alt+F4");
  const confirm = win.getByRole("alertdialog", { name: "Save changes" });
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Yes" }).click();
  const saveAs = win.locator('[data-test-file-dialog="save"]');
  await expect(saveAs).toBeVisible();
  await saveAs.getByRole("textbox", { name: "File name:" }).fill("final");
  await saveAs.getByRole("button", { name: "Save", exact: true }).click();
  await expect(win).toHaveCount(0);
  const saved = await page.evaluate(() => localStorage.getItem("windows-os:vfs:guest:v1"));
  expect(saved).toContain('"uri":"/final.txt"');
  expect(saved).toContain("Save on close");
});
