import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-11T12:00:00.000Z"));
  await page.goto("/");
});

test("preserves legacy default boot then source-style Guest login", async ({ page }) => {
  await expect(page.locator("[data-test-logon-screen]")).toBeVisible({ timeout: 12000 });
  await expect(page.locator('[data-test-avatar="win7"]')).toBeVisible();
  await expect(page.getByText("Guest", { exact: true })).toBeVisible();
  const background = await page.locator("[data-test-logon-screen]").evaluate(
    element => getComputedStyle(element).backgroundImage
  );
  expect(background).toContain("login.85fd59c8.webp");
});

test("Guest opens the real Win7 desktop with original wallpaper and shortcuts", async ({ page }) => {
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await expect(page.locator("[data-test-main-screen]")).toBeVisible();
  await expect(page.locator('[data-test-taskbar="base"]')).toBeVisible();
  await expect(page.locator('[data-test-desktop-icon="bin"]')).toBeVisible();
  await expect(page.locator('[data-test-desktop-icon="computer"]')).toBeVisible();
  await expect(page.locator('[data-test-desktop-icon="web_contacts"]')).toBeVisible();
  const bg = await page.locator("[data-test-desktop-background]").evaluate(element =>
    getComputedStyle(element).backgroundImage);
  expect(bg).toContain("default.deccec52.webp");
  expect(await page.locator('[data-test-taskbar="base"]').evaluate(element =>
    Math.round(element.getBoundingClientRect().height))).toBe(40);
});

test("Start menu launches Computer and supports minimize, restore and close", async ({ page }) => {
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.getByRole("button", { name: "Open Start menu" }).click();
  const menu = page.locator("[data-test-start-menu]");
  await expect(menu).toBeVisible();
  await menu.locator('[data-test-program="computer"]').click();
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  await page.getByRole("button", { name: "Minimize Computer" }).click();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Switch to Computer" }).click();
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  await page.getByRole("button", { name: "Close Computer" }).click();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(0);
});

test("Guest logoff returns to login and clears running windows", async ({ page }) => {
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  await page.getByRole("button", { name: "Open Start menu" }).click();
  await page.getByRole("button", { name: "Log off" }).click();
  await expect(page.locator("[data-test-logon-screen]")).toBeVisible();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(0);
});
