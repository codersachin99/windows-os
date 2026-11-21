import {expect,test,type Locator,type Page} from "@playwright/test";

/**
 * Frozen legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776,
 * src/modules/themes/theme-win7-classic-scss.js:
 * [dir="ltr"] .win7-classic .winui-menu and [dir="rtl"] mirror
 * their 3D bevel for Basic 2/3/4. Classic menu palette is not Aero.
 * Drive real Desktop, taskbar, Computer and Recycle Bin popups.
 */
const themes=[
  {id:"basic-2",surface:"rgb(212, 208, 200)",border:"rgb(57, 60, 57)",
    text:"rgb(0, 0, 0)",hover:"rgb(10, 36, 106)"},
  {id:"basic-3",surface:"rgb(0, 0, 0)",border:"rgb(255, 255, 255)",
    text:"rgb(255, 255, 255)",hover:"rgb(128, 0, 128)"},
  {id:"basic-4",surface:"rgb(255, 255, 255)",border:"rgb(0, 0, 0)",
    text:"rgb(0, 0, 0)",hover:"rgb(0, 0, 0)"}
] as const;

async function guest(page:Page,id:string){
  await page.goto("/?theme="+id);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveAttribute("data-theme",id);
}
async function setDirection(page:Page,direction:"ltr"|"rtl"){
  await page.locator("html").evaluate((el,dir)=>el.setAttribute("dir",dir),direction);
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveCSS("direction",direction);
}
async function sourceClassicPaint(menu:Locator,theme:typeof themes[number],
  direction:"ltr"|"rtl"){
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("background-color",theme.surface);
  await expect(menu).toHaveCSS("border-top-color",theme.border);
  await expect(menu).toHaveCSS("color",theme.text);
  await expect(menu).toHaveCSS("border-top-left-radius","0px");
  // getComputedStyle normalizes inset shadow order/color, so assert the
  // first source bevel's actual horizontal offset, not authored CSS text.
  const shadow=await menu.evaluate(el=>getComputedStyle(el).boxShadow);
  expect(shadow).toMatch(direction==="rtl"
    ? /(?:^|\s)1px -1px 0px 0px inset/
    : /(?:^|\s)-1px -1px 0px 0px inset/);
  expect(shadow).toContain("inset");
}
for(const theme of themes){
  test(theme.id+" Desktop source classic popup reverses 3D bevel in RTL and retains View",async({page})=>{
    await guest(page,theme.id);
    const icons=page.locator("#desktop-icons");
    for(const direction of ["ltr","rtl"] as const){
      await setDirection(page,direction);
      await icons.click({button:"right",position:{x:260,y:200}});
      const menu=icons.locator("[data-test-desktop-menu]");
      await sourceClassicPaint(menu,theme,direction);
      const refresh=menu.getByRole("menuitem",{name:"Refresh",exact:true});
      await refresh.hover();
      await expect(refresh).toHaveCSS("background-color",theme.hover);
      await expect(refresh).toHaveCSS("color","rgb(255, 255, 255)");
      await menu.locator("[data-test-desktop-view]").click();
      await expect(menu.getByRole("menuitemradio",{name:/Large icons/}))
        .toBeVisible();
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
    }
    await page.locator('[data-test-desktop-icon="computer"]').click({button:"right"});
    const item=icons.locator("[data-test-desktop-menu]");
    await sourceClassicPaint(item,theme,"rtl");
    await item.locator('[data-test-desktop-item-action="open"]').click();
    await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  });

  test(theme.id+" RTL taskbar source classic popup keeps action colors and Task Manager",async({page})=>{
    await guest(page,theme.id);
    await setDirection(page,"rtl");
    // Classic layouts keep a real running-items background lane.
    await page.locator(".windows-taskbar__running").click({
      button:"right",position:{x:15,y:5}
    });
    const menu=page.locator('[data-test-taskbar-context="background"]');
    await sourceClassicPaint(menu,theme,"rtl");
    const manager=menu.locator('[data-test-taskbar-context-action="taskmgr"]');
    await manager.hover();
    await expect(manager).toHaveCSS("background-color",theme.hover);
    await expect(manager).toHaveCSS("color","rgb(255, 255, 255)");
    await manager.click();
    await expect(menu).toHaveCount(0);
    await expect(page.locator('[data-test-window="taskmgr"]')).toBeVisible();
  });

  for(const app of ["computer","bin"] as const){
    test(theme.id+" "+app+" View popup preserves classic RTL bevel and source actions",async({page})=>{
      await guest(page,theme.id);
      await setDirection(page,"rtl");
      await page.locator('[data-test-desktop-icon="'+app+'"]').dblclick();
      const win=page.locator('[data-test-window="'+app+'"]');
      await expect(win).toBeVisible();
      const area=win.locator(".explorer-content");
      const bounds=await area.boundingBox();
      expect(bounds).not.toBeNull();
      await area.click({button:"right",position:{
        x:Math.max(10,bounds!.width-12),y:Math.max(10,bounds!.height-12)
      }});
      const menu=win.locator('[data-test-explorer-context="background"]');
      await sourceClassicPaint(menu,theme,"rtl");
      await menu.locator("[data-test-explorer-context-view]").click();
      const child=menu.locator("[data-test-explorer-background-submenu]");
      await sourceClassicPaint(child,theme,"rtl");
      await expect(child.getByRole("menuitemradio")).toHaveCount(8);
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
      await expect(win).toBeVisible();
    });
  }
}
