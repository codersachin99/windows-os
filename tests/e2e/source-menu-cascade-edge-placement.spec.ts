import {expect,test,type Locator,type Page} from "@playwright/test";

/**
 * Frozen legacy-win7 WinUI BaseMenu/ExplorerMenu: cascading items are their
 * own popup adjacent to the invoking row, to the right if space permits and
 * flipped left at the viewport edge. They must not stretch their parent
 * context menu or be clipped by its scrolling viewport.
 */
async function guest(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const desktop=page.locator("#desktop-icons");
  await expect(desktop).toBeVisible();
  return desktop;
}
async function desktopMenuAt(desktop:Locator,edge:"left"|"right"){
  const bounds=await desktop.boundingBox();
  expect(bounds).not.toBeNull();
  await desktop.click({button:"right",position:{
    // The Guest desktop places real icons at the upper-left corner.
    // Use the known empty 260x200 source test location for the
    // "room-to-the-right" case, not an icon in the first column.
    x:edge==="left"?Math.min(260,Math.max(12,bounds!.width-90))
      :Math.max(12,bounds!.width-12),
    y:Math.min(200,Math.max(12,bounds!.height-20))
  }});
  const root=desktop.locator("[data-test-desktop-menu]");
  await expect(root).toBeVisible();
  return root;
}
async function assertInside(popup:Locator,bounds:Locator){
  const [box,viewport]=await Promise.all([popup.boundingBox(),bounds.boundingBox()]);
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(viewport!.x-2);
  expect(box!.y).toBeGreaterThanOrEqual(viewport!.y-2);
  expect(box!.x+box!.width).toBeLessThanOrEqual(viewport!.x+viewport!.width+2);
  expect(box!.y+box!.height).toBeLessThanOrEqual(viewport!.y+viewport!.height+2);
  return box!;
}

for(const theme of ["win7","winxp","win11dark"] as const){
  test("source "+theme+" Desktop View Sort New cascade beside root, flips at right edge, retains keyboard",async({page},info)=>{
    const desktop=await guest(page,theme);
    for(const edge of ["left","right"] as const){
      const menu=await desktopMenuAt(desktop,edge);
      const rootBefore=await menu.boundingBox();
      expect(rootBefore).not.toBeNull();
      for(const [triggerId,kind] of [
        ["view","View"],["sort","Sort by"],["new","New"]
      ] as const){
        const trigger=menu.locator("[data-test-desktop-"+triggerId+"]");
        await trigger.click();
        const child=desktop.locator("[data-test-desktop-background-submenu]");
        await expect(child).toBeVisible();
        await expect(child).toHaveAttribute("aria-label",kind);
        const box=await assertInside(child,desktop);
        await assertInside(menu,desktop);
        const rootAfter=await menu.boundingBox();
        expect(Math.abs(rootAfter!.height-rootBefore!.height))
          .toBeLessThan(2);
        const side=await child.getAttribute("data-side");
        expect(side).toMatch(/^(right|left)$/);
        if(info.project.name==="chromium-desktop"){
          expect(side).toBe(edge==="left"?"right":"left");
          if(edge==="left")
            expect(box.x).toBeGreaterThanOrEqual(rootAfter!.x+rootAfter!.width-6);
          else
            expect(box.x+box.width).toBeLessThanOrEqual(rootAfter!.x+6);
        }
        await child.getByRole(triggerId==="new"?"menuitem":"menuitemradio").first().focus();
        await page.keyboard.press("ArrowLeft");
        await expect(child).toHaveCount(0);
        await expect(trigger).toBeFocused();
      }
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
    }
  });
}

test("Computer and Bin View cascade use the same measured side placement",async({page})=>{
  await guest(page,"win7");
  for(const app of ["computer","bin"] as const){
    await page.locator('[data-test-desktop-icon="'+app+'"]').dblclick();
    const win=page.locator('[data-test-window="'+app+'"]');
    await expect(win).toBeVisible();
    const content=win.locator(".explorer-content");
    const area=await content.boundingBox();
    expect(area).not.toBeNull();
    await content.click({button:"right",position:{
      x:Math.max(12,area!.width-12),y:Math.max(12,area!.height-12)
    }});
    const menu=win.locator('[data-test-explorer-context="background"]');
    await expect(menu).toBeVisible();
    const before=await menu.boundingBox();
    await menu.locator("[data-test-explorer-context-view]").click();
    const child=menu.locator("[data-test-explorer-background-submenu]");
    await expect(child).toBeVisible();
    const box=await child.boundingBox();
    const viewport=page.viewportSize()!;
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-2);
    expect(box!.x+box!.width).toBeLessThanOrEqual(viewport.width+2);
    expect(box!.y).toBeGreaterThanOrEqual(-2);
    expect(box!.y+box!.height).toBeLessThanOrEqual(viewport.height+2);
    expect(await child.getAttribute("data-side")).toMatch(/^(right|left)$/);
    const after=await menu.boundingBox();
    expect(Math.abs(after!.height-before!.height)).toBeLessThan(2);
    await page.keyboard.press("Escape");
    await win.getByRole("button",{name:/^Close /}).click();
  }
});
