import { expect, test } from "@playwright/test";

test("default source Win7 hides XP/3.1 classic search entry buttons", async ({page}) => {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]');
  await expect(explorer.getByRole("searchbox", { name:"Search files" })).toBeVisible();
  await expect(explorer.getByRole("button", { name:"Search Companion" })).toHaveCount(0);
  await expect(explorer.getByRole("button", { name:"Search dialog" })).toHaveCount(0);
  // Existing Advanced Find is an explicitly recorded migration-era affordance.
  await expect(explorer.getByRole("button", { name:"Advanced Find" })).toBeVisible();
});
