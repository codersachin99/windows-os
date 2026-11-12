import { expect, test, type Page } from "@playwright/test";

const desktop = "/EXTERNAL/computer/drive0/Users/Guest/Desktop";

async function login(page: Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function newItem(page: Page, type: string) {
  const desktopArea = page.locator("#desktop-icons");
  await desktopArea.click({ button: "right", position: { x: 295, y: 290 } });
  const menu = page.locator("[data-test-desktop-menu]");
  await menu.getByRole("menuitem", { name: /^New/ }).click();
  await menu.getByRole("menuitem", { name: type, exact: true }).click();
}

test("desktop New Folder creates actual Guest folder and immediately offers source rename", async ({ page }) => {
  await login(page);
  await newItem(page, "Folder");
  const editor = page.locator("[data-test-desktop-rename]");
  await expect(editor).toBeVisible();
  await expect(editor).toHaveValue("New folder");
  await editor.fill("Project Documents");
  await editor.press("Enter");
  await expect(page.locator('[data-test-desktop-file="' + desktop + '/Project Documents"]'))
    .toBeVisible();
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await expect(page.locator('[data-test-desktop-file="' + desktop + '/Project Documents"]'))
    .toBeVisible();
});

test("desktop New Text Document creates a real TXT that opens in native Notepad", async ({ page }) => {
  await login(page);
  await newItem(page, "Text Document");
  const editor = page.locator("[data-test-desktop-rename]");
  await expect(editor).toHaveValue("New Text Document");
  await editor.fill("Meeting");
  await editor.press("Enter");
  const file = page.locator('[data-test-desktop-file="' + desktop + '/Meeting.txt"]');
  await expect(file).toBeVisible();
  await file.dblclick();
  await expect(page.locator('[data-test-window="notepad"]').first()).toBeVisible();
});

test("desktop shortcut wizard writes a source JSON .lnk that launches migrated Calculator", async ({ page }) => {
  await login(page);
  await newItem(page, "Shortcut");
  const dialog = page.getByRole("dialog", { name: "Create desktop shortcut" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox", { name: "Shortcut program" }).selectOption("calc");
  await dialog.getByRole("textbox", { name: "Shortcut name" }).fill("Desk Calculator");
  await dialog.getByRole("button", { name: "Create", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const link = page.locator('[data-test-desktop-file="' + desktop + '/Desk Calculator.lnk"]');
  await expect(link).toBeVisible();
  await link.dblclick();
  await expect(page.locator('[data-test-window="calc"]').first()).toBeVisible();
});

test("desktop shortcut creation rejects case-insensitive duplicates without overwriting", async ({ page }) => {
  await login(page);
  await newItem(page, "Shortcut");
  let dialog = page.getByRole("dialog", { name: "Create desktop shortcut" });
  await dialog.getByRole("textbox", { name: "Shortcut name" }).fill("Unique Link");
  await dialog.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.locator('[data-test-desktop-file="' + desktop + '/Unique Link.lnk"]'))
    .toBeVisible();
  await newItem(page, "Shortcut");
  dialog = page.getByRole("dialog", { name: "Create desktop shortcut" });
  await dialog.getByRole("textbox", { name: "Shortcut name" }).fill("unique link");
  await dialog.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.locator("#desktop-icons [role=alert]"))
    .toContainText("already exists");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(page.locator('[data-test-desktop-file="' + desktop + '/Unique Link.lnk"]'))
    .toBeVisible();
});

test("desktop New Rich Text Document creates an RTF file without claiming WordPad parity", async ({ page }) => {
  await login(page);
  await newItem(page, "Rich Text Document");
  await expect(page.locator("[data-test-desktop-rename]"))
    .toHaveValue("New Rich Text Document");
  await page.locator("[data-test-desktop-rename]").press("Enter");
  await expect(page.locator('[data-test-desktop-file="' + desktop + '/New Rich Text Document.rtf"]'))
    .toBeVisible();
});
