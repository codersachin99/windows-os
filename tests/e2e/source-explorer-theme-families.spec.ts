import {expect,test,type Page} from "@playwright/test";

/** The locked source uses .win7 for Aero 1–4 and Basic 1,
 * .win7-classic for Basic 2–4 and .winxp for all seven XP variants.
 * Test the *rendered* Computer/Bin menus and nested View popup,
 * not a token-only theme assertion. Source: legacy-win7@26b9f0ce7.
 */
const families=[
  {theme:"aero-1",surface:"rgb(241, 241, 241)",border:"rgb(151, 151, 151)",hover:"gradient"},
  {theme:"aero-2",surface:"rgb(241, 241, 241)",border:"rgb(151, 151, 151)",hover:"gradient"},
  {theme:"aero-3",surface:"rgb(241, 241, 241)",border:"rgb(151, 151, 151)",hover:"gradient"},
  {theme:"aero-4",surface:"rgb(241, 241, 241)",border:"rgb(151, 151, 151)",hover:"gradient"},
  {theme:"basic-1",surface:"rgb(241, 241, 241)",border:"rgb(151, 151, 151)",hover:"gradient"},
  {theme:"basic-2",surface:"rgb(212, 208, 200)",border:"rgb(57, 60, 57)",hover:"rgb(10, 36, 106)"},
  {theme:"basic-3",surface:"rgb(0, 0, 0)",border:"rgb(255, 255, 255)",hover:"rgb(128, 0, 128)"},
  {theme:"basic-4",surface:"rgb(255, 255, 255)",border:"rgb(0, 0, 0)",hover:"rgb(0, 0, 0)"},
  {theme:"winxpG",surface:"rgb(255, 255, 255)",border:"rgb(172, 168, 153)",hover:"rgb(147, 160, 112)"},
  {theme:"winxpZ",surface:"rgb(255, 255, 255)",border:"rgb(172, 168, 153)",hover:"rgb(190, 190, 190)"}
] as const;

async function openBackgroundMenu(page:Page,windowId:"computer"|"bin"){
  await page.locator(`[data-test-desktop-icon="${windowId}"]`).dblclick();
  const win=page.locator(`[data-test-window="${windowId}"]`);
  await expect(win).toBeVisible();
  const area=win.locator(".explorer-content");
  const rect=await area.boundingBox();
  expect(rect).not.toBeNull();
  await area.click({button:"right",position:{
    x:Math.max(10,rect!.width-12),y:Math.max(10,rect!.height-12)
  }});
  const menu=win.locator('[data-test-explorer-context="background"]');
  await expect(menu).toBeVisible();
  return {win,menu};
}

for(const variant of families){
  test(`source ${variant.theme} styles Computer and Recycle Bin context children`,async({page})=>{
    await page.goto("/?theme="+variant.theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    for(const windowId of ["computer","bin"] as const){
      const {menu}=await openBackgroundMenu(page,windowId);
      await expect(menu).toHaveCSS("background-color",variant.surface);
      await expect(menu).toHaveCSS("border-top-color",variant.border);
      await expect(menu).toHaveCSS("border-top-left-radius","0px");
      const refresh=menu.getByRole("menuitem",{name:"Refresh"});
      await refresh.hover();
      if(variant.hover==="gradient"){
        await expect(refresh).toHaveCSS("background-image",/linear-gradient/);
      }else{
        await expect(refresh).toHaveCSS("background-color",variant.hover);
        await expect(refresh).toHaveCSS("color","rgb(255, 255, 255)");
      }
      await menu.locator("[data-test-explorer-context-view]").click();
      const child=menu.locator("[data-test-explorer-background-submenu]");
      await expect(child).toBeVisible();
      await expect(child).toHaveCSS("background-color",variant.surface);
      await expect(child).toHaveCSS("border-top-color",variant.border);
      await expect(child.getByRole("menuitemradio")).toHaveCount(8);
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
    }
  });
}
