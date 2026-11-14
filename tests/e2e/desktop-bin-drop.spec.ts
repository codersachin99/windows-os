import { expect, test, type Page } from "@playwright/test";
const desktop = "/EXTERNAL/computer/drive0/Users/Guest/Desktop";
async function login(page: Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function createFolder(page: Page, name: string) {
  await page.locator("#desktop-icons").click({ button: "right", position: { x: 295, y: 290 } });
  const menu = page.locator("[data-test-desktop-menu]");
  await menu.getByRole("menuitem", { name: /^New/ }).click();
  await menu.getByRole("menuitem", { name: "Folder" }).click();
  const editor = page.locator("[data-test-desktop-rename]");
  await expect(editor).toBeVisible();
  await editor.fill(name);
  await editor.press("Enter");
  const item = page.locator('[data-test-desktop-file="' + desktop + '/' + name + '"]');
  await expect(item).toBeVisible();
  return item;
}
async function dropOnBin(page: Page, item: ReturnType<Page["locator"]>) {
  const box = await item.boundingBox();
  const target = await page.locator('[data-test-desktop-icon="bin"]').boundingBox();
  if (!box || !target) throw new Error("Missing source desktop icon/drop target");
  await page.mouse.move(box.x + box.width / 2, box.y + Math.min(22, box.height / 2));
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 9 });
  await page.mouse.up();
}
test("drag a real Guest folder into desktop Bin and restore to original path", async ({ page }) => {
  await login(page);
  const file = await createFolder(page, "Recycle This");
  await dropOnBin(page, file);
  await expect(file).toHaveCount(0);
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin = page.locator('[data-test-window="bin"]');
  const recycled = bin.locator('[data-test-explorer-item="Recycle This"]');
  await expect(recycled).toBeVisible();
  await recycled.click();
  await bin.getByRole("button", { name: "Restore", exact: true }).click();
  await expect(recycled).toHaveCount(0);
  await expect(file).toBeVisible();
});
test("a selected desktop group drags to Bin as one persisted batch", async ({ page }) => {
  await login(page);
  const first = await createFolder(page, "Batch One");
  const second = await createFolder(page, "Batch Two");
  await first.click();
  await second.click({ modifiers: ["Control"] });
  await expect(first).toHaveAttribute("data-test-desktop-selected", "true");
  await expect(second).toHaveAttribute("data-test-desktop-selected", "true");
  await dropOnBin(page, second);
  await expect(first).toHaveCount(0);
  await expect(second).toHaveCount(0);
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin = page.locator('[data-test-window="bin"]');
  await expect(bin.locator('[data-test-explorer-item="Batch One"]')).toBeVisible();
  await expect(bin.locator('[data-test-explorer-item="Batch Two"]')).toBeVisible();
});
