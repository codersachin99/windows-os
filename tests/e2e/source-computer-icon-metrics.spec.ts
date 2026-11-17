import {expect,test,type Page} from "@playwright/test";

/** Pinned legacy-win7/src/styles/apps/computer.css: mode-level item/icon
 * dimensions. This checks rendered geometry, not just CSS text. */
async function openGuestDocuments(page:Page,theme:"win7"|"winxp"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]');
  await expect(computer).toBeVisible();
  await computer.locator(".explorer-navigation__home")
    .filter({hasText:"Documents"}).click();
  await computer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Legacy Original Icon Dimensions and Caption.txt",
      mimeType:"text/plain",buffer:Buffer.from("source icon fidelity")});
  return computer;
}
async function setSourceViewMode(computer:ReturnType<Page["locator"]>,mode:string){
  const area=computer.locator(".explorer-content");
  const bounds=await area.boundingBox();
  expect(bounds).not.toBeNull();
  await area.click({button:"right",position:{
    x:Math.max(10,bounds!.width-12),y:Math.max(10,bounds!.height-12)
  }});
  const menu=computer.locator('[data-test-explorer-context="background"]');
  await expect(menu).toBeVisible();
  await menu.locator("[data-test-explorer-context-view]").click();
  await menu.locator('[data-test-explorer-context-mode="'+mode+'"]').click();
  await expect(menu).toHaveCount(0);
}
test("Win7 Computer icons use pinned medium/large/extra sizes and four-line source captions",async({page})=>{
  const computer=await openGuestDocuments(page,"win7");
  const item=computer.locator(
    '[data-test-explorer-item="Legacy Original Icon Dimensions and Caption.txt"]');
  for(const [mode,width,icon] of [
    ["medium-icons",96,88],["large-icons",144,128],
    ["extra-large-icons",212,196]
  ] as const){
    await setSourceViewMode(computer,mode);
    await expect(item).toBeVisible();
    const geometry=await item.evaluate(element=>{
      const image=element.querySelector<HTMLElement>(".listview__item-iconbox");
      const label=element.querySelector<HTMLElement>(".listview__item-label");
      if(!image||!label)throw new Error("Original icon/label not found");
      const itemStyle=getComputedStyle(element);
      const imageStyle=getComputedStyle(image);
      const caption=getComputedStyle(label);
      return {
        width:parseFloat(itemStyle.width),
        iconWidth:parseFloat(imageStyle.width),
        iconHeight:parseFloat(imageStyle.height),
        captionLines:caption.webkitLineClamp,
        captionWhiteSpace:caption.whiteSpace
      };
    });
    expect(geometry.width).toBe(width);
    expect(geometry.iconWidth).toBe(icon);
    expect(geometry.iconHeight).toBe(icon);
    expect(geometry.captionLines).toBe("4");
    expect(geometry.captionWhiteSpace).toBe("normal");
  }
});
test("Win7 Computer small icons and Tiles retain source width/icon proportions",async({page})=>{
  const computer=await openGuestDocuments(page,"win7");
  const item=computer.locator(
    '[data-test-explorer-item="Legacy Original Icon Dimensions and Caption.txt"]');
  await setSourceViewMode(computer,"small-icons");
  const small=await item.evaluate(element=>{
    const box=element.querySelector<HTMLElement>(".listview__item-iconbox")!;
    return {width:element.getBoundingClientRect().width,
      icon:box.getBoundingClientRect().width};
  });
  expect(small.width).toBeGreaterThanOrEqual(160);
  expect(small.icon).toBe(16);
  await setSourceViewMode(computer,"tiles");
  const tile=await item.evaluate(element=>{
    const box=element.querySelector<HTMLElement>(".listview__item-iconbox")!;
    return {width:element.getBoundingClientRect().width,
      icon:box.getBoundingClientRect().width};
  });
  if(page.viewportSize()!.width>580)expect(tile.width).toBeGreaterThanOrEqual(256);
  expect(tile.icon).toBe(48);
});

test("WinXP and Win11 keep the original Computer large-icon geometry across themes",async({page})=>{
  for(const theme of ["winxp","win11"] as const){
    const computer=await openGuestDocuments(page,theme);
    await setSourceViewMode(computer,"large-icons");
    const item=computer.locator(
      '[data-test-explorer-item="Legacy Original Icon Dimensions and Caption.txt"]');
    await expect(item).toBeVisible();
    const dimensions=await item.evaluate(element=>{
      const box=element.querySelector<HTMLElement>(".listview__item-iconbox")!;
      return {item:parseFloat(getComputedStyle(element).width),
        icon:parseFloat(getComputedStyle(box).width)};
    });
    expect(dimensions).toEqual({item:144,icon:128});
  }
});
