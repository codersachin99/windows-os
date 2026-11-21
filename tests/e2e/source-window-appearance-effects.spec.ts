import {expect,test,type Page} from "@playwright/test";

/** Original CSS effects:
 * legacy-win7@4e63290d.../src/modules/themes/theme-win7-scss.js
 * --theme-color / --theme-color--inactive, data-effect-enable-glass,
 * data-effect-show-window-shadows and RTL shadow/gradient branches.
 * Source Win11 .window__main.active uses --theme-accent. */
async function guestComputer(page:Page,theme:"win7"|"winxp"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const desktop=page.locator("[data-test-main-screen]");
  await expect(desktop).toHaveAttribute("data-theme",theme);
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win).toHaveAttribute("data-source-window-active","true");
  return {desktop,win};
}
test("original Aero glass and window shadows follow independent source effect flags",async({page})=>{
  const {desktop,win}=await guestComputer(page,"win7");
  await expect(desktop).toHaveAttribute("data-effect-enable-glass","");
  await expect(desktop).toHaveAttribute("data-effect-show-window-shadows","");
  await expect(win).toHaveCSS("backdrop-filter","blur(4px)");
  await expect(win).toHaveCSS("box-shadow",/15px 1px/);
  await desktop.evaluate(el=>{
    el.removeAttribute("data-effect-enable-glass");
    el.removeAttribute("data-effect-show-window-shadows");
  });
  await expect(win).toHaveCSS("backdrop-filter","none");
  await expect(win).toHaveCSS("box-shadow","none");
  // The settings bridge must be able to enable either effect separately.
  await desktop.evaluate(el=>el.setAttribute("data-effect-enable-glass",""));
  await expect(win).toHaveCSS("backdrop-filter","blur(4px)");
  await expect(win).toHaveCSS("box-shadow","none");
  await desktop.evaluate(el=>{
    el.removeAttribute("data-effect-enable-glass");
    el.setAttribute("data-effect-show-window-shadows","");
  });
  await expect(win).toHaveCSS("backdrop-filter","none");
  await expect(win).toHaveCSS("box-shadow",/15px 1px/);
});
test("original Aero inactive and active windows use independent dynamic theme color tokens",async({page})=>{
  const {desktop,win}=await guestComputer(page,"win7");
  await desktop.evaluate(el=>{
    (el as HTMLElement).style.setProperty("--theme-color","#123456");
    (el as HTMLElement).style.setProperty("--theme-color--inactive","#324456");
  });
  await expect(win).toHaveCSS("background-color","rgb(18, 52, 86)");
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]');
  await expect(bin).toHaveAttribute("data-source-window-active","true");
  await expect(bin).toHaveCSS("background-color","rgb(18, 52, 86)");
  await expect(win).toHaveAttribute("data-source-window-active","false");
  await expect(win).toHaveCSS("background-color","rgb(50, 68, 86)");
});
test("original RTL Aero frame reverses highlight directions and outer shadow",async({page})=>{
  const {win}=await guestComputer(page,"win7");
  const ltr=await win.evaluate(el=>({
    bg:getComputedStyle(el).backgroundImage,
    shadow:getComputedStyle(el).boxShadow
  }));
  expect(ltr.shadow).toContain("2px 2px 15px 1px");
  await page.evaluate(()=>{document.documentElement.dir="rtl";});
  await expect(win).toHaveCSS("direction","rtl");
  const rtl=await win.evaluate(el=>({
    bg:getComputedStyle(el).backgroundImage,
    shadow:getComputedStyle(el).boxShadow
  }));
  expect(rtl.bg).not.toBe(ltr.bg);
  expect(rtl.shadow).toContain("-2px 2px 15px 1px");
});
test("source XP title and Win11 caption align RTL, and Win11 accent stays configurable",async({page})=>{
  let {win}=await guestComputer(page,"winxp");
  await page.evaluate(()=>{document.documentElement.dir="rtl";});
  await expect(win.locator(".windows-window__title")).toHaveCSS(
    "text-shadow",/-1px 1px/);
  ({win}=await guestComputer(page,"win11"));
  await page.evaluate(()=>{document.documentElement.dir="rtl";});
  await expect(win.locator(".windows-window__titlebar")).toHaveCSS(
    "padding-right","6px");
  await expect(win.locator(".windows-window__titlebar")).toHaveCSS(
    "padding-left","0px");
  await page.locator("[data-test-main-screen]").evaluate(el=>
    (el as HTMLElement).style.setProperty("--theme-accent","#345678"));
  await expect(win).toHaveCSS("background-color","rgb(52, 86, 120)");
  await expect(win).toHaveCSS("border-top-color","rgb(52, 86, 120)");
});
