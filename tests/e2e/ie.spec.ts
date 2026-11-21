import { expect, test, type Page } from "@playwright/test";

async function openIE(page: Page) {
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.getByRole("button", { name: "Open Start menu" }).click();
  await page.locator('[data-test-program="ie"]').click();
  const browser = page.locator('[data-test-window="ie"]');
  await expect(browser).toBeVisible();
  return browser;
}
test("pinned IE home and original disabled Favorites/Bookmarks", async ({page}) => {
  const browser = await openIE(page);
  await expect(browser.locator('[data-test-ie-iframe]'))
    .toHaveAttribute("src", "https://msn.com");
  await expect(browser.getByRole("button", {name:"Favorites"})).toBeDisabled();
  await expect(browser.getByRole("button", {name:"Bookmarks"})).toBeDisabled();
  await expect(browser.getByRole("button", {name:"Back"})).toBeDisabled();
  await expect(browser.getByRole("button", {name:"Forward"})).toBeDisabled();
  await expect(browser).toContainText("Internet");
});
test("source IE Back/Forward and forward history truncation", async ({page}) => {
  const browser = await openIE(page);
  const address = browser.locator('[data-test-ie-address-input]');
  await address.fill("https://example.org/first");
  await address.press("Enter");
  await expect(browser.locator('[data-test-ie-iframe]'))
    .toHaveAttribute("src","https://example.org/first");
  await address.fill("https://example.net/second");
  await address.press("Enter");
  await expect(browser.getByRole("button",{name:"Back"})).toBeEnabled();
  await browser.getByRole("button",{name:"Back"}).click();
  await expect(address).toHaveValue("https://example.org/first");
  await browser.getByRole("button",{name:"Forward"}).click();
  await expect(address).toHaveValue("https://example.net/second");
  await browser.getByRole("button",{name:"Back"}).click();
  await address.fill("example.com/third");
  await address.press("Enter");
  await expect(address).toHaveValue("https://example.com/third");
  await expect(browser.getByRole("button",{name:"Forward"})).toBeDisabled();
});
test("Bing search encodes query and rejects non-web URLs", async ({page}) => {
  const browser = await openIE(page);
  const search = browser.getByRole("textbox",{name:"Search Bing"});
  await search.fill("windows 7 & xp");
  await search.press("Enter");
  const frame = browser.locator('[data-test-ie-iframe]');
  await expect(frame).toHaveAttribute("src","https://bing.com/search?q=windows%207%20%26%20xp");
  const address = browser.locator('[data-test-ie-address-input]');
  await address.fill("javascript:alert(1)");
  await address.press("Enter");
  await expect(browser.getByRole("alert")).toContainText("valid HTTP or HTTPS");
  await expect(frame).toHaveAttribute("src","https://bing.com/search?q=windows%207%20%26%20xp");
  await browser.getByRole("button",{name:"Close Internet Explorer"}).click();
  await expect(browser).toHaveCount(0);
});
