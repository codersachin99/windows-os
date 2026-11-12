import { expect, test, type Locator, type Page } from "@playwright/test";

const desktop = "/EXTERNAL/computer/drive0/Users/Guest/Desktop";

async function login(page: Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await expect(page.locator("#desktop-icons")).toBeVisible();
}

async function newFolder(page: Page, name: string): Promise<Locator> {
  await page.locator("#desktop-icons").click({ button: "right", position: { x: 280, y: 290 } });
  const menu = page.locator("[data-test-desktop-menu]");
  await menu.getByRole("menuitem", { name: /^New/ }).click();
  await menu.getByRole("menuitem", { name: "Folder", exact: true }).click();
  const rename = page.locator("[data-test-desktop-rename]");
  await expect(rename).toBeVisible();
  await rename.fill(name);
  await rename.press("Enter");
  const icon = page.locator('[data-test-desktop-file="' + desktop + "/" + name + '"]');
  await expect(icon).toBeVisible();
  return icon;
}
async function openExplorer(page: Page) {
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]').last();
  await expect(explorer).toBeVisible();
  return explorer;
}
async function newExplorerFolder(explorer: Locator, name: string) {
  await explorer.getByRole("button", { name: "New folder" }).click();
  const modal = explorer.getByRole("dialog", { name: "New folder" });
  await modal.getByRole("textbox", { name: "New folder name" }).fill(name);
  await modal.getByRole("button", { name: "OK" }).click();
  await expect(explorer.locator('[data-test-explorer-item="' + name + '"]')).toBeVisible();
}

test("Desktop Ctrl+C copies a real folder into Explorer Documents using the shared clipboard", async ({ page }) => {
  await login(page);
  const icon = await newFolder(page, "Desktop Project");
  await icon.click();
  await page.keyboard.press("Control+c");
  const explorer = await openExplorer(page);
  await explorer.getByRole("button", { name: "Documents", exact: true }).click();
  await explorer.getByRole("button", { name: "Paste", exact: true }).click();
  await expect(explorer.locator('[data-test-explorer-item="Desktop Project"]')).toBeVisible();
  await expect(icon).toBeVisible();
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await expect(page.locator('[data-test-desktop-file="' + desktop + '/Desktop Project"]')).toBeVisible();
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const fresh = page.locator('[data-test-window="computer"]').last();
  await fresh.getByRole("button", { name: "Documents", exact: true }).click();
  await expect(fresh.locator('[data-test-explorer-item="Desktop Project"]')).toBeVisible();
});

test("Explorer Ctrl+X moves a folder to Desktop with keyboard Ctrl+V and clears cut clipboard", async ({ page }) => {
  await login(page);
  const explorer = await openExplorer(page);
  await explorer.getByRole("button", { name: "Documents", exact: true }).click();
  await newExplorerFolder(explorer, "Incoming Notes");
  const item = explorer.locator('[data-test-explorer-item="Incoming Notes"]');
  await item.click();
  await page.keyboard.press("Control+x");
  await explorer.getByRole("button", { name: /^Close / }).click();
  await page.locator("#desktop-icons").focus();
  await page.keyboard.press("Control+v");
  const moved = page.locator('[data-test-desktop-file="' + desktop + '/Incoming Notes"]');
  await expect(moved).toBeVisible();
  await page.locator("#desktop-icons").click({ button: "right", position: { x: 280, y: 290 } });
  await expect(page.locator("[data-test-desktop-menu]").getByRole("menuitem", { name: "Paste" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await openExplorer(page);
  const next = page.locator('[data-test-window="computer"]').last();
  await next.getByRole("button", { name: "Documents", exact: true }).click();
  await expect(next.locator('[data-test-explorer-item="Incoming Notes"]')).toHaveCount(0);
});

test("Desktop context Copy uses the shared clipboard and does not overwrite existing targets", async ({ page }) => {
  await login(page);
  const icon = await newFolder(page, "Shared Reference");
  await icon.click({ button: "right" });
  await page.locator("[data-test-desktop-menu]").getByRole("menuitem", { name: "Copy", exact: true }).click();
  const explorer = await openExplorer(page);
  await explorer.getByRole("button", { name: "Documents", exact: true }).click();
  await explorer.getByRole("button", { name: "Paste", exact: true }).click();
  await expect(explorer.locator('[data-test-explorer-item="Shared Reference"]')).toBeVisible();
  await explorer.getByRole("button", { name: "Paste", exact: true }).click();
  await expect(explorer.getByRole("alert")).toContainText("Destination already exists");
  await expect(explorer.locator('[data-test-explorer-item="Shared Reference"]')).toHaveCount(1);
});

test("Desktop Delete confirms a selected group and ignores built-in system icons", async ({ page }) => {
  await login(page);
  const first = await newFolder(page, "Keep A");
  const second = await newFolder(page, "Keep B");
  await first.click();
  await second.click({ modifiers: ["Control"] });
  await page.locator('[data-test-desktop-icon="computer"]').click({ modifiers: ["Control"] });
  await expect(first).toHaveAttribute("data-test-desktop-selected", "true");
  await expect(second).toHaveAttribute("data-test-desktop-selected", "true");
  await page.keyboard.press("Delete");
  let confirm = page.getByRole("alertdialog", { name: "Confirm desktop deletion" });
  await expect(confirm).toContainText("2 selected items");
  await confirm.getByRole("button", { name: "No" }).click();
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
  // Keyboard focus belongs to the last clicked icon.
  await page.keyboard.press("Delete");
  confirm = page.getByRole("alertdialog", { name: "Confirm desktop deletion" });
  await confirm.getByRole("button", { name: "Yes" }).click();
  await expect(first).toHaveCount(0);
  await expect(second).toHaveCount(0);
  await expect(page.locator('[data-test-desktop-icon="computer"]')).toBeVisible();
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin = page.locator('[data-test-window="bin"]');
  await expect(bin.locator('[data-test-explorer-item="Keep A"]')).toBeVisible();
  await expect(bin.locator('[data-test-explorer-item="Keep B"]')).toBeVisible();
});

test("Desktop context Delete shows confirmation rather than silently removing a file", async ({ page }) => {
  await login(page);
  const file = await newFolder(page, "Do Not Delete");
  await file.click({ button: "right" });
  await page.locator("[data-test-desktop-menu]").getByRole("menuitem", { name: "Delete" }).click();
  const confirm = page.getByRole("alertdialog", { name: "Confirm desktop deletion" });
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "No" }).click();
  await expect(file).toBeVisible();
});
