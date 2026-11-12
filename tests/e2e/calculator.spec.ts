import { expect, test, type Locator, type Page } from "@playwright/test";

async function guest(page: Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
}
async function calcByStart(page: Page): Promise<Locator> {
  await page.getByRole("button", { name: "Open Start menu" }).click();
  await page.locator('[data-test-program="calc"]').click();
  const window = page.locator('[data-test-window="calc"]');
  await expect(window.locator('[data-test-calculator]')).toBeVisible();
  return window;
}
async function press(calc: Locator, ...labels: string[]) {
  for (const label of labels) {
    await calc.locator('[data-test-calc-button="' + label + '"]').click();
  }
}

test("Calculator Standard mode matches original key order and immediate evaluation", async ({ page }) => {
  await guest(page);
  const win = await calcByStart(page);
  const keys = await win.locator('[data-test-calc-button]').allTextContents();
  expect(keys.map(k => k.trim())).toEqual([
    "MC","MR","MS","M+","M-","←","CE","C","±","√",
    "7","8","9","/","%","4","5","6","*","1/x",
    "1","2","3","-","=","0",".","+"
  ]);
  const result = win.locator('[data-test-result-input]');
  await press(win, "2", "+", "3", "*", "4", "=");
  await expect(result).toHaveValue("20");
  await press(win, "C", "9", "√");
  await expect(result).toHaveValue("3");
  await press(win, "C", "8", "/", "0", "=");
  await expect(win.locator('[data-test-calc-error-message]'))
    .toContainText("cannot divide by zero");
  await press(win, "C");
  await expect(result).toHaveValue("0");
});

test("Calculator memory, grouping, keyboard and source History menu", async ({ page }) => {
  await guest(page);
  const win = await calcByStart(page);
  const result = win.locator('[data-test-result-input]');
  await press(win, "8", "MS", "C", "2", "M+", "C", "MR");
  await expect(result).toHaveValue("10");
  await expect(win.locator('[data-test-calc-memory-indicator]')).toBeVisible();
  await press(win, "C");
  await win.locator('[data-test-calculator]').focus();
  await page.keyboard.type("12345");
  await expect(result).toHaveValue("12345");
  await win.getByRole("menuitem", { name: "View" }).click();
  await win.getByRole("menuitemcheckbox", { name: "Digit grouping" }).click();
  await expect(result).toHaveValue("12,345");
  await win.getByRole("menuitem", { name: "View" }).click();
  await win.getByRole("menuitemcheckbox", { name: "History" }).click();
  await press(win, "C", "2", "+", "3", "=");
  await expect(win.getByLabel("Calculator history")).toContainText("5");
  await win.getByRole("menuitem", { name: "View" }).click();
  await expect(win.getByRole("menuitemradio", { name: "Scientific" })).toBeDisabled();
});

test("Original source Accessories Calculator.lnk opens working native React Calculator", async ({ page }) => {
  await guest(page);
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]');
  await explorer.getByRole("button", { name: "Programs" }).click();
  await explorer.locator('[data-test-explorer-item="Accessories"]').dblclick();
  await explorer.locator('[data-test-explorer-item="Calculator.lnk"]').dblclick();
  const win = page.locator('[data-test-window="calc"]');
  const result = win.locator('[data-test-result-input]');
  await expect(result).toHaveValue("0");
  await press(win, "7", "*", "8", "=");
  await expect(result).toHaveValue("56");
});
