import { expect, test, type Page, type Locator } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function openMagnifier(page: Page): Promise<Locator> {
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-start-menu] [data-test-program="magnifier"]').click();
  const win=page.locator('[data-test-window="magnifier"]');
  await expect(win).toBeVisible();
  return win;
}
const zoomTarget = (page: Page) => page.locator('[data-test-magnify-target]');

test("original source Magnifier 260px window, icon and disabled controls",async({page})=>{
  await login(page);
  const win=await openMagnifier(page);
  const rect=await win.boundingBox();
  if(!rect)throw Error("Magnifier not positioned");
  expect(Math.round(rect.width)).toBe(260);
  expect(rect.height).toBeLessThan(115);
  await expect(win.locator(".windows-window__titlebar img"))
    .toHaveAttribute("src",/magnifier\.66b65661\.webp/);
  await expect(win.getByRole("button",{name:"Minimize Magnifier"})).toBeVisible();
  await expect(win.getByRole("button",{name:"Maximize Magnifier"})).toHaveCount(0);
  await expect(win.getByRole("button",{name:"Views"})).toBeDisabled();
  await expect(win.getByRole("button",{name:"Settings"})).toBeDisabled();
  await expect(win.getByRole("button",{name:"Help"})).toBeDisabled();
  await expect(win.getByRole("button",{name:"Help"}).locator("img"))
    .toHaveAttribute("src",/help\.a34353ca\.webp/);
  await expect(win.locator('[data-test-magnifier-scale]')).toHaveText("100%");
  await expect(zoomTarget(page)).toHaveAttribute("data-test-magnification","1");
  await expect(zoomTarget(page)).toHaveCSS("transform","none");
});

test("zoom 100 to 200% enlarges desktop icons and other app windows but not taskbar or controls",async({page})=>{
  await login(page);
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]');
  const originalComputer=await computer.boundingBox();
  const originalIcon=await page.locator('[data-test-desktop-icon="computer"]').boundingBox();
  const originalTaskbar=await page.locator('[data-test-taskbar="base"]').boundingBox();
  if(!originalComputer||!originalIcon||!originalTaskbar)throw Error("Original bounds missing");
  const win=await openMagnifier(page);
  const originalToolbar=await win.boundingBox();
  if(!originalToolbar)throw Error("Magnifier not positioned");
  await win.getByRole("button",{name:"Zoom out"}).click();
  await expect(win.locator('[data-test-magnifier-scale]')).toHaveText("100%");
  await win.getByRole("button",{name:"Zoom in"}).click();
  await expect(win.locator('[data-test-magnifier-scale]')).toHaveText("150%");
  await win.getByRole("button",{name:"Zoom in"}).click();
  await expect(win.locator('[data-test-magnifier-scale]')).toHaveText("200%");
  await expect(zoomTarget(page)).toHaveCSS("transform","matrix(2, 0, 0, 2, 0, 0)");
  const enlargedComputer=await computer.boundingBox();
  const enlargedIcon=await page.locator('[data-test-desktop-icon="computer"]').boundingBox();
  const toolbarAfter=await win.boundingBox();
  const taskbarAfter=await page.locator('[data-test-taskbar="base"]').boundingBox();
  if(!enlargedComputer||!enlargedIcon||!toolbarAfter||!taskbarAfter)
    throw Error("Magnified bounds missing");
  expect(enlargedComputer.width).toBeCloseTo(originalComputer.width*2,0);
  expect(enlargedIcon.width).toBeCloseTo(originalIcon.width*2,0);
  expect(toolbarAfter.width).toBeCloseTo(originalToolbar.width,0);
  expect(taskbarAfter.height).toBeCloseTo(originalTaskbar.height,0);
  await win.getByRole("button",{name:"Zoom out"}).click();
  await win.getByRole("button",{name:"Zoom out"}).click();
  await expect(zoomTarget(page)).toHaveCSS("transform","none");
});

test("magnification stops at 1600%, and source pointer/touch zoom origin is honored",async({page})=>{
  await login(page);
  const win=await openMagnifier(page);
  const plus=win.getByRole("button",{name:"Zoom in"});
  await plus.click();
  for(let i=0;i<29;i++)await plus.dispatchEvent("click");
  await expect(win.locator('[data-test-magnifier-scale]')).toHaveText("1600%");
  await expect(zoomTarget(page)).toHaveAttribute("data-test-magnification","16");
  await plus.dispatchEvent("click");
  await expect(win.locator('[data-test-magnifier-scale]')).toHaveText("1600%");
  const viewport=page.viewportSize();
  if(!viewport)throw Error("Missing viewport");
  await page.mouse.move(viewport.width*.25,viewport.height*.4);
  const origin=await zoomTarget(page).evaluate(el=>{
    const style=getComputedStyle(el);
    return {
      parts:style.transformOrigin.split(" ").map(v=>Number.parseFloat(v)),
      width:el.clientWidth,
      height:el.clientHeight
    };
  });
  if(await page.evaluate(()=>navigator.maxTouchPoints>0)) {
    expect(origin.parts[0]).toBe(0);
    expect(origin.parts[1]).toBe(0);
  } else {
    expect(origin.parts[0]/origin.width).toBeCloseTo(.25,1);
    expect(origin.parts[1]/origin.height).toBeCloseTo(.4,1);
  }
});

test("Magnifier stays active on minimize and resets desktop on close and reopening",async({page})=>{
  await login(page);
  const win=await openMagnifier(page);
  await win.getByRole("button",{name:"Zoom in"}).click();
  await expect(zoomTarget(page)).toHaveAttribute("data-test-magnification","1.5");
  await win.getByRole("button",{name:"Minimize Magnifier"}).click();
  await expect(page.locator('[data-test-window="magnifier"]')).toHaveCount(0);
  await expect(zoomTarget(page)).toHaveAttribute("data-test-magnification","1.5");
  await page.getByRole("button",{name:"Switch to Magnifier"}).click();
  const restored=page.locator('[data-test-window="magnifier"]');
  await expect(restored.locator('[data-test-magnifier-scale]')).toHaveText("150%");
  await restored.getByRole("button",{name:"Close Magnifier"}).click();
  await expect(zoomTarget(page)).toHaveAttribute("data-test-magnification","1");
  await expect(zoomTarget(page)).toHaveCSS("transform","none");
  await expect(page.getByRole("button",{name:"Switch to Magnifier"})).toHaveCount(0);
  const fresh=await openMagnifier(page);
  await expect(fresh.locator('[data-test-magnifier-scale]')).toHaveText("100%");
  await expect(zoomTarget(page)).toHaveCSS("transform","none");
});

test("Run Magnify.exe launches the original singleton Magnifier and Start reopens it",async({page})=>{
  await login(page);
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-start-menu] [data-test-program="run"]').click();
  const run=page.locator('[data-test-window="run"]');
  await run.getByRole("textbox",{name:"Open:"}).fill("Magnify.exe");
  await run.getByRole("button",{name:"OK"}).click();
  await expect(run).toHaveCount(0);
  const mag=page.locator('[data-test-window="magnifier"]');
  await expect(mag).toHaveCount(1);
  await mag.getByRole("button",{name:"Minimize Magnifier"}).click();
  await expect(mag).toHaveCount(0);
  await openMagnifier(page);
  await expect(mag).toHaveCount(1);
  await expect(page.getByRole("button",{name:"Switch to Magnifier"})).toHaveCount(1);
});
