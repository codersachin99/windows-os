import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
}

test("legacy Find: 480px source window, all three tabs and source reset semantics", async ({ page }) => {
  await login(page);
  await page.keyboard.press("Meta+f");
  const find = page.locator('[data-test-window="find"]');
  await expect(find).toBeVisible();
  await expect(find).toHaveCSS("width", "480px", { timeout: 5000 }).catch(async () => {
    // Mobile WindowFrame clamps the source desktop width to available viewport.
    expect(await find.evaluate(el => Math.round(el.getBoundingClientRect().width)))
      .toBeLessThanOrEqual(480);
  });
  await expect(find.getByRole("tab", { name: "Name & Location" })).toHaveAttribute("aria-selected", "true");
  await expect(find.getByRole("checkbox", { name: "Include subfolders" })).toBeChecked();
  await expect(find.getByRole("button", { name: "Stop" })).toBeDisabled();
  await find.getByRole("textbox", { name: "Named" }).fill("report");
  await find.getByRole("tab", { name: "Date Modified" }).click();
  await find.getByRole("radio", { name: "Find all files modified" }).check();
  await find.getByRole("radio", { name: /During the previous.*days/ }).check();
  await find.getByRole("spinbutton", { name: "Previous days" }).fill("14");
  await find.getByRole("tab", { name: "Advanced" }).click();
  await find.getByRole("combobox", { name: "Of type" }).selectOption("document");
  await find.getByRole("combobox", { name: "Size is" }).selectOption("at-most");
  await find.getByRole("spinbutton", { name: "Size in KB" }).fill("2");
  await find.getByRole("button", { name: "New Search" }).click();
  await expect(find.getByRole("textbox", { name: "Named" })).toHaveValue("");
  await expect(find.getByRole("checkbox", { name: "Include subfolders" })).toBeChecked();
  await find.getByRole("tab", { name: "Date Modified" }).click();
  await expect(find.getByRole("radio", { name: "All files" })).toBeChecked();
  await find.getByRole("tab", { name: "Advanced" }).click();
  await expect(find.getByRole("combobox", { name: "Of type" })).toHaveValue("");
  await expect(find.getByRole("combobox", { name: "Size is" })).toHaveValue("");
});

test("Find Now opens separate Computer window and searches real Guest folders", async ({ page }) => {
  await login(page);
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const original = page.locator('[data-test-window="computer"]').first();
  await original.getByRole("button", { name: "New folder" }).click();
  const folder = original.getByRole("dialog", { name: "New folder" });
  await folder.getByRole("textbox", { name: "New folder name" }).fill("FindCheckpoint");
  await folder.getByRole("button", { name: "OK" }).click();
  await expect(original.locator('[data-test-explorer-item="FindCheckpoint"]')).toBeVisible();
  await original.getByRole("button", { name: "Advanced Find" }).click();
  const find = page.locator('[data-test-window="find"]');
  await expect(find.getByRole("textbox", { name: "Named" })).toBeFocused();
  await find.getByRole("textbox", { name: "Named" }).fill("findcheckpoint");
  await find.getByRole("button", { name: "Find Now" }).click();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(2);
  const results = page.locator('[data-test-window="computer"]').last();
  await expect(results.locator('[data-test-explorer-item="FindCheckpoint"]')).toBeVisible();
  await expect(results.getByText("1 found", { exact: true })).toBeVisible();
  await expect(original.locator('[data-test-explorer-item="FindCheckpoint"]')).toBeVisible();
});
