import {expect,test,type Locator,type Page} from "@playwright/test";

/**
 * Immutable legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776:
 * src/modules/themes/theme-win7-scss.js and theme-winvista-scss.js
 * [dir="rtl"] .winui-menu panel and ::before icon/check gutter.
 *
 * These are actual Computer/Bin background menus and independently rendered
 * child View popup; no source mock or CSS-text-only assertion.
 */
async function guest(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-main-screen]"))
    .toHaveAttribute("data-theme",theme);
  await page.locator("html").evaluate(el=>el.setAttribute("dir","rtl"));
  await expect(page.locator("[data-test-main-screen]"))
    .toHaveCSS("direction","rtl");
}
async function sourceRtlPaint(menu:Locator){
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("background-color","rgb(241, 241, 241)");
  await expect(menu).toHaveCSS("border-top-color","rgb(151, 151, 151)");
  await expect(menu).toHaveCSS("box-shadow",/-4px 4px 3px -2px/);
  const gutter=await menu.evaluate(element=>{
    const css=getComputedStyle(element,"::before");
    return {
      content:css.content,width:css.width,left:css.left,right:css.right,
      shadow:css.boxShadow
    };
  });
  expect(gutter.content).toBe('""');
  expect(gutter.width).toBe("2px");
  expect(gutter.left).toBe("auto");
  expect(gutter.right).toBe("27px");
  expect(gutter.shadow).toMatch(/-1px 0px/);
  expect(gutter.shadow).toContain("inset");
}

for(const theme of ["win7","aero-2","basic-1","winvista"] as const){
  for(const app of ["computer","bin"] as const){
    test(theme+" original RTL "+app+" root and View submenu mirror source WinUI",async({page})=>{
      await guest(page,theme);
      await page.locator('[data-test-desktop-icon="'+app+'"]').dblclick();
      const window=page.locator('[data-test-window="'+app+'"]');
      await expect(window).toBeVisible();
      const content=window.locator(".explorer-content");
      const bounds=await content.boundingBox();
      expect(bounds).not.toBeNull();
      await content.click({button:"right",position:{
        x:Math.max(10,bounds!.width-12),y:Math.max(10,bounds!.height-12)
      }});
      const root=window.locator('[data-test-explorer-context="background"]');
      await sourceRtlPaint(root);
      const view=root.locator('[data-test-explorer-context-view]');
      await expect(view).toBeFocused();
      await expect(view).toHaveCSS("padding-right","34px");
      await expect(view).toHaveCSS("padding-left","10px");
      await expect(view).toHaveCSS("text-align","right");

      await view.click();
      const child=root.locator("[data-test-explorer-background-submenu]");
      await sourceRtlPaint(child);
      await expect(child.getByRole("menuitemradio")).toHaveCount(8);
      await expect(child.locator('[data-test-explorer-context-mode="extra-large-icons"]'))
        .toHaveCSS("padding-right","34px");
      await page.keyboard.press("Escape");
      await expect(root).toHaveCount(0);
      await expect(content).toBeFocused();
      await expect(window).toBeVisible();
    });
  }
}

test("switching Win7 Explorer from RTL back to LTR restores original left gutter",async({page})=>{
  await guest(page,"win7");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const window=page.locator('[data-test-window="computer"]');
  const content=window.locator(".explorer-content");
  const bounds=await content.boundingBox();
  expect(bounds).not.toBeNull();
  await content.click({button:"right",position:{x:Math.max(10,bounds!.width-12),y:Math.max(10,bounds!.height-12)}});
  let root=window.locator('[data-test-explorer-context="background"]');
  await sourceRtlPaint(root);
  await page.keyboard.press("Escape");
  await page.locator("html").evaluate(el=>el.setAttribute("dir","ltr"));
  await content.click({button:"right",position:{x:Math.max(10,bounds!.width-12),y:Math.max(10,bounds!.height-12)}});
  root=window.locator('[data-test-explorer-context="background"]');
  await expect(root).toBeVisible();
  const gutter=await root.evaluate(el=>{
    const css=getComputedStyle(el,"::before");
    return {left:css.left,right:css.right};
  });
  expect(gutter).toEqual({left:"27px",right:"auto"});
  await expect(root).toHaveCSS("box-shadow",/4px 4px 3px -2px/);
});
