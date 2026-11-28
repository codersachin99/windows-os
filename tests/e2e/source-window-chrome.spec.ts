import {expect,test,type Page} from "@playwright/test";

/** Original WindowMain and WindowControl source:
 * legacy-win7@4e63290d/src/modules/themes/theme-{win7,winxp,win11}-scss.js.
 * Verify actual rendered frame/control metrics and active shell lifecycle,
 * not CSS text alone. */
async function guestWindow(page:Page,theme:"win7"|"winxp"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win).toBeVisible();
  await expect(win).toHaveAttribute("data-source-window-active","true");
  return win;
}
const chrome=[
  {theme:"win7",radius:"7px",border:"rgb(0, 0, 0)",height:20,close:48,taskbar:40},
  {theme:"winxp",radius:"8px",border:"rgb(0, 85, 230)",height:24,close:24,taskbar:40},
  {theme:"win11",radius:"8px",border:"rgba(0, 0, 0, 0.2)",height:30,close:44,taskbar:48}
] as const;
for(const rule of chrome){
  test(rule.theme+" source window frame/caption controls follow pinned geometry",async({page})=>{
    const win=await guestWindow(page,rule.theme);
    await expect(win).toHaveCSS("border-top-left-radius",rule.radius);
    await expect(win).toHaveCSS("border-top-color",rule.border);
    const controls=win.locator(".windows-window__buttons button");
    await expect(controls).toHaveCount(3);
    const measure=await controls.evaluateAll(buttons=>buttons.map(button=>({
      width:button.getBoundingClientRect().width,
      height:button.getBoundingClientRect().height
    })));
    expect(measure.map(c=>c.height)).toEqual([
      rule.height,rule.height,rule.height
    ]);
    expect(measure[2].width).toBe(rule.close);
    if(rule.theme==="winxp"){
      await expect(win.locator(".windows-window__title")).toHaveCSS("font-weight","700");
      await expect(win).toHaveCSS("background-image",/linear-gradient/);
      await expect(controls.last()).toHaveCSS("background-color","rgb(230, 106, 77)");
    }
    if(rule.theme==="win7"){
      await expect(win).toHaveCSS("background-image",/linear-gradient/);
      await expect(win).toHaveCSS("padding-top","6px");
      await expect(controls.last()).toHaveCSS("background-color","rgb(213, 79, 54)");
    }
    if(rule.theme==="win11"){
      await expect(win).toHaveCSS("background-color","rgb(240, 240, 240)");
      await expect(win).toHaveCSS("padding-top","0px");
      const close=win.getByRole("button",{name:"Close Computer"});
      await close.hover();
      await expect(close).toHaveCSS("background-color","rgb(196, 43, 28)");
    }
    await win.getByRole("button",{name:"Maximize Computer"}).click();
    await expect(win).toHaveClass(/is-maximized/);
    await expect(win).toHaveCSS("border-top-left-radius","0px");
    const edges=await win.boundingBox();
    const viewport=page.viewportSize()!;
    expect(edges).not.toBeNull();
    expect(Math.abs(viewport.height-edges!.y-edges!.height-rule.taskbar))
      .toBeLessThanOrEqual(2);
    await win.getByRole("button",{name:"Maximize Computer"}).click();
    await expect(win).not.toHaveClass(/is-maximized/);
    await win.getByRole("button",{name:"Close Computer"}).click();
    await expect(win).toHaveCount(0);
  });
}
test("source focused window chrome follows actual nonminimized z-order",async({page})=>{
  const computer=await guestWindow(page,"win7");
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]');
  await expect(bin).toBeVisible();
  await expect(bin).toHaveAttribute("data-source-window-active","true");
  await expect(computer).toHaveAttribute("data-source-window-active","false");
  await page.getByRole("button",{name:"Switch to Computer"}).click();
  await expect(computer).toHaveAttribute("data-source-window-active","true");
  await expect(bin).toHaveAttribute("data-source-window-active","false");
  await page.getByRole("button",{name:"Minimize Computer"}).click();
  await expect(bin).toHaveAttribute("data-source-window-active","true");
  await page.getByRole("button",{name:"Switch to Computer"}).click();
  await expect(computer).toHaveAttribute("data-source-window-active","true");
});

test("source eight-direction window resizing preserves opposite edges and restore bounds",async({page})=>{
  await page.setViewportSize({width:1280,height:900});
  const win=await guestWindow(page,"win7");
  const handles=win.locator("[data-test-window-resize]");
  await expect(handles).toHaveCount(8);
  const original=(await win.boundingBox())!;
  async function resize(edge:string,dx:number,dy:number){
    const handle=win.locator('[data-test-window-resize="'+edge+'"]');
    const box=(await handle.boundingBox())!;
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
    await page.mouse.down();
    await page.mouse.move(box.x+box.width/2+dx,box.y+box.height/2+dy,{steps:5});
    await page.mouse.up();
  }
  await resize("se",40,30);
  const expanded=(await win.boundingBox())!;
  expect(Math.abs(expanded.width-original.width-40)).toBeLessThanOrEqual(2);
  expect(Math.abs(expanded.height-original.height-30)).toBeLessThanOrEqual(2);
  expect(expanded.x).toBe(original.x);
  expect(expanded.y).toBe(original.y);
  await resize("nw",20,15);
  const reduced=(await win.boundingBox())!;
  expect(Math.abs(reduced.x-expanded.x-20)).toBeLessThanOrEqual(2);
  expect(Math.abs(reduced.y-expanded.y-15)).toBeLessThanOrEqual(2);
  expect(Math.abs(reduced.x+reduced.width-expanded.x-expanded.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(reduced.y+reduced.height-expanded.y-expanded.height)).toBeLessThanOrEqual(2);
  await win.getByRole("button",{name:"Maximize Computer"}).click();
  await expect(handles).toHaveCount(0);
  await win.getByRole("button",{name:"Maximize Computer"}).click();
  await expect(handles).toHaveCount(8);
  expect(await win.boundingBox()).toEqual(reduced);
});
