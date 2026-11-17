import {expect,test,type Page} from "@playwright/test";
async function boot(page:Page){
  await page.goto("/?theme=win11");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
  await expect(page.locator("[data-test-start-menu]")).toBeVisible();
}
test("source Win11 page indicators show twelve program tiles and restore page one",async({page})=>{
  await boot(page);
  const menu=page.locator("[data-test-start-menu]");
  const pages=menu.locator("[data-test-win11-start-pages]");
  await expect(pages).toBeVisible();
  await expect(menu.locator("[data-test-program]")).toHaveCount(12);
  const firstPage=await menu.locator("[data-test-program]").evaluateAll(
    nodes=>nodes.map(node=>node.getAttribute("data-test-program"))
  );
  await expect(pages.locator('[data-test-win11-start-page="1"]'))
    .toHaveAttribute("aria-current","page");
  await pages.locator('[data-test-win11-start-page="2"]').click();
  const secondPage=await menu.locator("[data-test-program]").evaluateAll(
    nodes=>nodes.map(node=>node.getAttribute("data-test-program"))
  );
  expect(secondPage.length).toBeGreaterThan(0);
  expect(secondPage.length).toBeLessThanOrEqual(12);
  expect(secondPage).not.toEqual(firstPage);
  await expect(pages.locator('[data-test-win11-start-page="2"]'))
    .toHaveAttribute("aria-current","page");
  await menu.locator("[data-test-all-programs]").click();
  await expect(pages).toHaveCount(0);
  await menu.locator("[data-test-all-programs-back]").click();
  await expect(pages.locator('[data-test-win11-start-page="1"]'))
    .toHaveAttribute("aria-current","page");
  await expect(menu.locator("[data-test-program]")).toHaveCount(12);
});
test("source Win11 wheel moves the pinned grid page, search stays unpaged",async({page})=>{
  await boot(page);
  const menu=page.locator("[data-test-start-menu]");
  const grid=menu.locator(".windows-startmenu__programs");
  const next=menu.locator('[data-test-win11-start-page="2"]');
  await grid.hover();
  await page.mouse.wheel(0,140);
  await expect(next).toHaveAttribute("aria-current","page");
  const query=menu.locator("[data-test-startmenu-search]");
  await query.fill("Calculator");
  await expect(menu.locator("[data-test-win11-start-pages]")).toHaveCount(0);
  await expect(menu.locator('[data-test-program="calc"]')).toBeVisible();
  await query.fill("");
  await expect(menu.locator("[data-test-win11-start-pages]")).toBeVisible();
});
