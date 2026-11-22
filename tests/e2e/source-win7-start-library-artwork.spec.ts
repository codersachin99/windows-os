import {expect,test,type Page} from "@playwright/test";

/**
 * Frozen src/modules/shell/startmenu-base.js:
 * - Win7-family right-pane library links expose data-test-startmenu-link;
 * - showLinkIcon waits 400ms on mouseover/mouseout, replacing Guest avatar
 *   with theme-selected source "start-docs/pics/music" original image;
 * - isBaseTheme disables the hover preview.
 * The six original binary files are SHA-audited in the assets manifest.
 */
async function openStart(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const menu=page.locator('[data-test-start-menu]');
  await expect(menu).toBeVisible();
  return menu;
}
for(const theme of ["win7","winvista"] as const){
  test("source "+theme+" library links show original hover image and restore Guest avatar",async({page})=>{
    const menu=await openStart(page,theme);
    const paths={
      documents:"start-docs.68e567fd.webp",
      pictures:"start-pics.90cdea88.webp",
      music:"start-music.7d1b9e60.webp"
    };
    for(const [key,filename] of Object.entries(paths)){
      const link=menu.locator('[data-test-startmenu-link="'+key+'"]');
      await expect(link).toHaveAttribute(
        "data-source-library-icon","/assets/images/"+filename);
      // The original source handler is mouseover; dispatching the event
      // tests the same UI state machine under both mouse and touch emulation
      // without assuming that the mobile browser supports hardware hover.
      await link.dispatchEvent("mouseover");
      const preview=menu.locator('[data-test-startmenu-library-preview="'+key+'"]');
      await expect(preview).toBeVisible();
      await expect(preview).toHaveAttribute("src","/assets/images/"+filename);
      await expect(preview).toHaveAttribute("data-source-artwork","original");
      await expect(preview).toHaveJSProperty("complete",true);
      expect(await preview.evaluate(el=>(el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
      await link.dispatchEvent("mouseout",{relatedTarget:null});
      await expect(preview).toHaveCount(0);
      await expect(menu.getByRole("img",{name:"Guest"})).toBeVisible();
    }
  });
}
test("Basic source has exact SVG artwork mapping but no animated avatar preview",async({page})=>{
  const menu=await openStart(page,"basic-1");
  for(const [key,filename] of Object.entries({
    documents:"start-docs-base.d4ace145.svg",
    pictures:"start-pics-base.b5f2d859.svg",
    music:"start-music-base.74611945.svg"
  })){
    const link=menu.locator('[data-test-startmenu-link="'+key+'"]');
    await expect(link).toHaveAttribute(
      "data-source-library-icon","/assets/images/"+filename);
    await link.dispatchEvent("mouseover");
  }
  await page.waitForTimeout(475);
  await expect(menu.locator("[data-test-startmenu-library-preview]")).toHaveCount(0);
  await expect(menu.getByRole("img",{name:"Guest"})).toBeVisible();
});
