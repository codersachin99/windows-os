import {expect,test,type Locator,type Page} from "@playwright/test";

/** Frozen source WinUI BaseMenu measures current desktop geometry.
 * The React Computer/Bin context menus need to remeasure the SAME open
 * popup when viewport width changes, not only after a new right-click.
 */
async function bounded(popup:Locator,page:Page){
  const rect=await popup.boundingBox(),vp=page.viewportSize()!;
  expect(rect).not.toBeNull();
  expect(rect!.x).toBeGreaterThanOrEqual(-2);
  expect(rect!.y).toBeGreaterThanOrEqual(-2);
  expect(rect!.x+rect!.width).toBeLessThanOrEqual(vp.width+2);
  expect(rect!.y+rect!.height).toBeLessThanOrEqual(vp.height+2);
}
test("Computer and Recycle Bin open View cascades resize from adjacent to stacked and back",async({page})=>{
  await page.setViewportSize({width:1100,height:800});
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  for(const app of ["computer","bin"] as const){
    await page.locator('[data-test-desktop-icon="'+app+'"]').dblclick();
    const win=page.locator('[data-test-window="'+app+'"]');
    await expect(win).toBeVisible();
    const content=win.locator(".explorer-content");
    const bounds=await content.boundingBox();
    expect(bounds).not.toBeNull();
    await content.click({button:"right",position:{
      x:Math.max(12,bounds!.width-12),
      y:Math.max(12,bounds!.height-12)
    }});
    const root=win.locator('[data-test-explorer-context="background"]');
    await expect(root).toBeVisible();
    await root.locator('[data-test-explorer-context-view]').click();
    const child=root.locator("[data-test-explorer-background-submenu]");
    await expect(child).toBeVisible();
    await expect(child).toHaveAttribute("data-cascade","adjacent");
    await bounded(root,page);
    await bounded(child,page);
    const originalRootHeight=(await root.boundingBox())!.height;

    // Keep the original menu open while simulating mobile rotation or
    // a desktop window resize. No re-right-click or menu remount allowed.
    await page.setViewportSize({width:320,height:800});
    await expect(root).toBeVisible();
    await expect(child).toHaveAttribute("data-cascade","stacked");
    await bounded(root,page);
    await bounded(child,page);
    await expect(child.getByRole("menuitemradio").first()).toBeVisible();
    expect(Math.abs((await root.boundingBox())!.height-originalRootHeight))
      .toBeLessThan(2);
    // Verify the existing source View action continues to work after flip.
    await child.getByRole("menuitemradio").first().focus();
    await page.keyboard.press("ArrowLeft");
    await expect(child).toHaveCount(0);
    await expect(root.locator("[data-test-explorer-context-view]")).toBeFocused();
    await root.locator("[data-test-explorer-context-view]").click();
    await expect(child).toHaveAttribute("data-cascade","stacked");

    await page.setViewportSize({width:1100,height:800});
    await expect(child).toHaveAttribute("data-cascade","adjacent");
    await bounded(root,page);
    await bounded(child,page);
    await page.keyboard.press("Escape");
    await expect(root).toHaveCount(0);
    await win.getByRole("button",{name:/^Close /}).click();
  }
});
