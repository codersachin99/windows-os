import {expect,test,type Page} from "@playwright/test";

async function openStart(page:Page,theme:"winxp"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const menu=page.locator("[data-test-start-menu]");
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("data-source-start-theme",theme);
  return menu;
}
test("pinned 6f58 WinXP Start has source top profile and bottom action regions",async({page})=>{
  const menu=await openStart(page,"winxp");
  await expect(menu).toHaveClass(/windows-startmenu--winxp/);
  await expect(menu.locator("[data-test-startmenu-xp-header]")).toContainText("Guest");
  await expect(menu.locator("[data-test-startmenu-xp-header] img"))
    .toHaveAttribute("src",/guest\.1a7eab2b\.webp/);
  const footer=menu.locator("[data-test-startmenu-xp-footer]");
  await expect(footer.getByRole("button",{name:"Log off"})).toBeVisible();
  await expect(footer.getByRole("button",{name:"Turn off computer"})).toBeVisible();
  await expect(menu.getByRole("button",{name:"Notepad"})).toBeVisible();
  await menu.locator("[data-test-all-programs]").click();
  await expect(menu.locator('[data-test-source-program-folder="Games"]')).toBeVisible();
  await expect(menu.locator('[data-test-source-program-folder="Accessories"]')).toBeVisible();
});
test("pinned 18ee Win11 Start centers a 6-column program grid below search",async({page})=>{
  const menu=await openStart(page,"win11");
  await expect(menu).toHaveClass(/windows-startmenu--win11/);
  await expect(menu.locator("[data-test-startmenu-xp-header]")).toHaveCount(0);
  await expect(menu.locator("[data-test-startmenu-xp-footer]")).toHaveCount(0);
  const grid=menu.locator(".windows-startmenu__programs");
  await expect(grid).toHaveCSS("display","grid");
  const columns=await grid.evaluate(element=>
    getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length
  );
  const mobile=await page.evaluate(()=>window.innerWidth<=520);
  expect(columns).toBe(mobile?4:6);
  const search=menu.getByRole("textbox",{name:"Search programs and files"});
  await expect(search).toBeVisible();
  const searchBounds=await search.boundingBox();
  const gridBounds=await grid.boundingBox();
  expect(searchBounds).not.toBeNull();
  expect(gridBounds).not.toBeNull();
  expect(searchBounds!.y).toBeLessThan(gridBounds!.y);
  await search.fill("Notepad");
  await expect(menu.getByRole("button",{name:"Notepad"})).toBeVisible();
  await menu.getByRole("button",{name:"Notepad"}).click();
  await expect(page.locator('[data-test-window="notepad"]')).toBeVisible();
});
test("XP and Win11 Start skins never cause document horizontal scrolling",async({page})=>{
  for(const theme of ["winxp","win11"] as const){
    const menu=await openStart(page,theme);
    await expect(menu).toBeVisible();
    const layout=await page.evaluate(()=>({
      scroll:document.documentElement.scrollWidth,
      width:document.documentElement.clientWidth
    }));
    expect(layout.scroll).toBeLessThanOrEqual(layout.width+1);
    await page.getByRole("button",{name:"Open Start menu"}).click();
  }
});
