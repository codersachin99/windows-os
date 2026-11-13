import { expect, test } from "@playwright/test";

async function desktop(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  return page.locator('[data-test-window="computer"]');
}
async function newFolder(explorer: import("@playwright/test").Locator, label: string) {
  await explorer.getByRole("button", { name: "New folder" }).click();
  const dialog = explorer.getByRole("dialog", { name: "New folder" });
  await dialog.getByRole("textbox", { name: "New folder name" }).fill(label);
  await dialog.getByRole("button", { name: "OK" }).click();
  await expect(explorer.locator('[data-test-explorer-item="' + label + '"]')).toBeVisible();
}

test("original child Search Dialog searches parent Computer without another window", async ({ page }) => {
  const explorer = await desktop(page);
  await newFolder(explorer, "DialogOnlyTarget");
  await explorer.getByRole("button", { name: "Search dialog" }).click();
  const search = explorer.locator('[data-test-search-dialog]');
  await expect(search).toBeVisible();
  await expect(search.getByRole("textbox", { name: "Search for" })).toHaveValue("*.*");
  await expect(search.getByRole("textbox", { name: "Search for" })).toBeFocused();
  await expect(search.getByRole("checkbox", { name: "Search all subdirectories" })).toBeChecked();
  await expect(search.getByRole("button", { name: /Minimize|Maximize/ })).toHaveCount(0);
  await search.getByRole("button", { name: "Cancel" }).click();
  await expect(search).toHaveCount(0);
  await explorer.getByRole("button", { name: "Search dialog" }).click();
  await search.getByRole("textbox", { name: "Search for" }).fill("dialogonlytarget");
  await search.getByRole("button", { name: "OK" }).click();
  await expect(search).toHaveCount(0);
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(1);
  await expect(explorer.locator('[data-test-explorer-item="DialogOnlyTarget"]')).toBeVisible();
  await expect(explorer.getByText("1 found", { exact: true })).toBeVisible();
});

test("original Search Companion sidebar replaces navigation and searches same Computer", async ({ page }) => {
  const explorer = await desktop(page);
  await newFolder(explorer, "CompanionOnlyTarget");
  await explorer.getByRole("button", { name: "Search Companion" }).click();
  const companion = explorer.locator('[data-test-search-companion]');
  await expect(companion).toBeVisible();
  await expect(explorer.locator(".explorer-navigation")).toHaveCount(0);
  await expect(companion.getByRole("textbox", { name: "All or part of the file name" })).toHaveValue("");
  await companion.getByRole("textbox", { name: "All or part of the file name" }).fill("companiononlytarget");
  await companion.getByText("When was it modified?").click();
  await expect(companion.getByRole("radio", { name: "Don't remember" }).first()).toBeChecked();
  await companion.getByText("What size is it?").click();
  await companion.getByText("More advanced options").click();
  await expect(companion.getByRole("checkbox", { name: "Search subfolders" })).toBeChecked();
  await companion.getByRole("button", { name: "Search", exact: true }).click();
  await expect(explorer.locator('[data-test-explorer-item="CompanionOnlyTarget"]')).toBeVisible();
  await expect(explorer.getByText("1 found", { exact: true })).toBeVisible();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(1);
  await companion.getByRole("button", { name: "Back" }).click();
  await expect(companion).toHaveCount(0);
  await expect(explorer.locator(".explorer-navigation")).toBeVisible();
});
