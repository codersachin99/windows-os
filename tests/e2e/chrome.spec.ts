import {expect,test,type Page} from "@playwright/test";
async function openChrome(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-program="chrome"]').click();
  const browser=page.locator('[data-test-window="chrome"]');
  await expect(browser).toBeVisible();
  return browser;
}
test("Chrome begins on original Google new tab; close last exits",async({page})=>{
  const browser=await openChrome(page);
  await expect(browser.locator('[data-test-chrome-new-tab]')).toBeVisible();
  await expect(browser.locator('[data-test-chrome-tab]')).toHaveCount(1);
  await expect(browser.locator('.source-chrome__google'))
    .toHaveAttribute("src","/assets/images/google.d3503fb1.svg");
  await browser.getByRole("button",{name:"New tab"}).click();
  await expect(browser.locator('[data-test-chrome-tab]')).toHaveCount(2);
  await browser.getByRole("button",{name:"Close tab 2"}).click();
  await expect(browser.locator('[data-test-chrome-tab]')).toHaveCount(1);
  await browser.getByRole("button",{name:"Close tab 1"}).click();
  await expect(browser).toHaveCount(0);
});
test("Chrome URL entry, back and forward, reload and Home",async({page})=>{
  const b=await openChrome(page),a=b.getByRole("textbox",{name:"Web address"});
  await a.fill("https://example.org/first");await a.press("Enter");
  await expect(b.locator('[data-test-web-iframe]')).toHaveAttribute("src","https://example.org/first");
  await a.fill("https://example.net/second");await a.press("Enter");
  await b.getByRole("button",{name:"Back"}).click();
  await expect(a).toHaveValue("https://example.org/first");
  await b.getByRole("button",{name:"Forward"}).click();
  await expect(a).toHaveValue("https://example.net/second");
  await b.getByRole("button",{name:"Reload"}).click();
  await expect(b.locator('[data-test-web-iframe]')).toHaveAttribute("src","https://example.net/second");
  await b.getByRole("button",{name:"Home"}).click();
  await expect(b.locator('[data-test-chrome-new-tab]')).toBeVisible();
  await expect(a).toHaveValue("");
});
test("Chrome source settings save search provider for next launch",async({page})=>{
  let b=await openChrome(page);
  await b.getByRole("button",{name:"Chrome menu"}).click();
  const menu=b.getByRole("menu");
  await expect(menu.getByRole("menuitem",{name:"Bookmarks"})).toBeDisabled();
  await expect(menu.getByRole("menuitem",{name:"New incognito window"})).toBeDisabled();
  await menu.getByRole("menuitem",{name:"Settings"}).click();
  await expect(b.locator('[data-test-chrome-settings]')).toBeVisible();
  const searchEngine=b.getByRole("combobox",{name:"Search engine"});
  await expect(searchEngine).toHaveValue("google");
  await searchEngine.selectOption("duckduckgo");
  await b.getByRole("button",{name:"New tab"}).click();
  await b.getByRole("searchbox",{name:"Search Google"}).fill("windows xp");
  await b.getByRole("button",{name:"Submit search"}).click();
  await expect(b.locator('[data-test-web-iframe]')).toHaveAttribute("src",
    "https://duckduckgo.com/?q=windows+xp");
  await b.getByRole("button",{name:"Close Chrome"}).click();
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-program="chrome"]').click();
  b=page.locator('[data-test-window="chrome"]');
  await b.getByRole("button",{name:"Chrome menu"}).click();
  await b.getByRole("menuitem",{name:"Settings"}).click();
  await expect(b.getByRole("combobox",{name:"Search engine"})).toHaveValue("duckduckgo");
});
test("Chrome refuses executable URL schemes; disabled menu commands stay disabled",async({page})=>{
  const b=await openChrome(page),a=b.getByRole("textbox",{name:"Web address"});
  await a.fill("javascript:alert(1)");await a.press("Enter");
  await expect(b.getByRole("alert")).toContainText("cannot be opened");
  await expect(b.locator('[data-test-web-iframe]')).toHaveCount(0);
  await b.getByRole("button",{name:"Chrome menu"}).click();
  await expect(b.getByRole("menuitem",{name:"Find"})).toBeDisabled();
  await expect(b.getByRole("menuitem",{name:"History"})).toBeDisabled();
  await b.getByRole("menuitem",{name:"Exit"}).click();
  await expect(b).toHaveCount(0);
});
