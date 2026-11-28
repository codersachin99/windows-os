import {expect,test} from "@playwright/test";
test("source Win11 All Programs is sorted flat, not legacy .lnk folder tree",async({page})=>{
  await page.goto("/?theme=win11");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
  const start=page.locator("[data-test-start-menu]");
  await start.locator("[data-test-all-programs]").click();
  const items=start.locator("[data-test-win11-all-app]");
  await expect(items.first()).toBeVisible();
  expect(await items.count()).toBeGreaterThan(12);
  const names=await items.evaluateAll(nodes=>nodes.map(node=>
    node.querySelector(".windows-startmenu__program-name")?.textContent??""));
  expect(names).toEqual([...names].sort((a,b)=>a.localeCompare(b)));
  await expect(start.locator("[data-test-source-program-folder]")).toHaveCount(0);
  const wordpad=start.locator('[data-test-win11-all-app="wordpad"]');
  await expect(wordpad).toBeVisible();
  await expect(wordpad).toBeDisabled();
  await start.locator('[data-test-win11-all-app="calc"]').click();
  await expect(page.locator('[data-test-window="calc"]')).toBeVisible();
});
test("source Win11 All Apps supports its shared original right-click actions",async({page})=>{
  await page.goto("/?theme=win11");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
  const start=page.locator("[data-test-start-menu]");
  await start.locator("[data-test-all-programs]").click();
  await start.locator('[data-test-win11-all-app="notepad"]').click({button:"right"});
  const menu=page.locator('[data-test-start-program-context="notepad"]');
  await expect(menu).toBeVisible();
  await expect(menu.locator('[data-test-start-context-action="pin"]')).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(start).toBeVisible();
});
