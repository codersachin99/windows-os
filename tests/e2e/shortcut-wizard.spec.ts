import { expect, test, type Locator, type Page } from "@playwright/test";

const desktop = "/EXTERNAL/computer/drive0/Users/Guest/Desktop";

async function login(page: Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function launchWizard(page: Page): Promise<Locator> {
  await page.locator("#desktop-icons").click({ button: "right", position: { x: 285, y: 290 } });
  const menu = page.locator("[data-test-desktop-menu]");
  await menu.getByRole("menuitem", { name: /^New/ }).click();
  await menu.getByRole("menuitem", { name: "Shortcut", exact: true }).click();
  const win = page.locator('[data-test-window="shortcut"]');
  await expect(win).toBeVisible();
  await expect(win).toHaveAttribute("aria-label", "Shortcut");
  return win;
}
async function selectProgram(page: Page, programId: string, doubleClick = false) {
  const main = page.locator('[data-test-window="shortcut"]');
  await main.getByRole("button", { name: "Browse..." }).click();
  const browser = page.getByRole("dialog", { name: "Browse", exact: true });
  await expect(browser).toBeVisible();
  const target = browser.locator('[data-test-shortcut-program="' + programId + '"]');
  if (doubleClick) await target.dblclick();
  else {
    await target.click();
    await browser.getByRole("button", { name: "OK", exact: true }).click();
  }
  await expect(browser).toHaveCount(0);
}

test("source shortcut wizard shows empty target, Browse list and disabled actions until selected", async ({ page }) => {
  await login(page);
  const main = await launchWizard(page);
  await expect(main.getByRole("button", { name: "Finish" })).toBeDisabled();
  await expect(main.getByRole("textbox", { name: "Shortcut name" })).toBeEmpty();
  await main.getByRole("button", { name: "Browse..." }).click();
  const browser = page.getByRole("dialog", { name: "Browse", exact: true });
  await expect(browser.getByRole("button", { name: "OK" })).toBeDisabled();
  await expect(browser.locator('[data-test-shortcut-program="paint"]')).toBeVisible();
  await browser.locator('[data-test-shortcut-program="paint"]').click();
  await expect(browser.getByRole("button", { name: "OK" })).toBeEnabled();
  await browser.getByRole("button", { name: "Cancel" }).click();
  await expect(main.getByRole("textbox", { name: "Shortcut name" })).toBeEmpty();
  await expect(main.getByRole("button", { name: "Finish" })).toBeDisabled();
  await main.getByRole("button", { name: "Cancel" }).click();
  await expect(main).toHaveCount(0);
});

test("Browse selects Calculator and Finish creates persisted .lnk that opens real Calculator", async ({ page }) => {
  await login(page);
  const main = await launchWizard(page);
  await selectProgram(page, "calc");
  await expect(main.getByRole("textbox", { name: "Shortcut name" })).toHaveValue("Calculator");
  await main.getByRole("textbox", { name: "Shortcut name" }).fill("Source Calculator");
  await main.getByRole("button", { name: "Finish" }).click();
  await expect(main).toHaveCount(0);
  const shortcut = page.locator('[data-test-desktop-file="' + desktop + '/Source Calculator.lnk"]');
  await expect(shortcut).toBeVisible();
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await expect(shortcut).toBeVisible();
  await shortcut.dblclick();
  await expect(page.locator('[data-test-window="calc"]')).toBeVisible();
});

test("Browse double click selects Notepad and repeated Finish chooses a unique name", async ({ page }) => {
  await login(page);
  let main = await launchWizard(page);
  await selectProgram(page, "notepad", true);
  await main.getByRole("button", { name: "Finish" }).click();
  await expect(page.locator('[data-test-desktop-file="' + desktop + '/Notepad.lnk"]')).toBeVisible();
  main = await launchWizard(page);
  await selectProgram(page, "notepad", true);
  await main.getByRole("button", { name: "Finish" }).click();
  await expect(page.locator('[data-test-desktop-file="' + desktop + '/Notepad (2).lnk"]')).toBeVisible();
  await expect(page.locator('[data-test-desktop-file="' + desktop + '/Notepad.lnk"]')).toBeVisible();
});

test("Browse Escape closes only browser; shell title close cancels wizard without creating shortcut", async ({ page }) => {
  await login(page);
  const main = await launchWizard(page);
  await main.getByRole("button", { name: "Browse..." }).click();
  const browser = page.getByRole("dialog", { name: "Browse", exact: true });
  await browser.locator('[data-test-shortcut-program="calc"]').click();
  await page.keyboard.press("Escape");
  await expect(browser).toHaveCount(0);
  await expect(main.getByRole("button", { name: "Finish" })).toBeDisabled();
  await main.getByRole("button", { name: "Browse..." }).click();
  await expect(browser).toBeVisible();
  await browser.getByRole("button", { name: "Close Browse" }).click();
  await expect(browser).toHaveCount(0);
  await main.getByRole("button", { name: "Close Shortcut" }).click();
  await expect(main).toHaveCount(0);
  await expect(page.locator('[data-test-desktop-file="' + desktop + '/Calculator.lnk"]')).toHaveCount(0);
});

test("shortcut to not-yet-migrated source Paint is persisted without unsafe execution", async ({ page }) => {
  await login(page);
  const main = await launchWizard(page);
  await selectProgram(page, "paint");
  await main.getByRole("textbox", { name: "Shortcut name" }).fill("Paint Pending");
  await main.getByRole("button", { name: "Finish" }).click();
  const shortcut = page.locator('[data-test-desktop-file="' + desktop + '/Paint Pending.lnk"]');
  await expect(shortcut).toBeVisible();
  await shortcut.dblclick();
  await expect(page.locator("#desktop-icons [role='alert']")).toContainText("not yet migrated");
  await expect(page.locator('[data-test-window="paint"]')).toHaveCount(0);
});
