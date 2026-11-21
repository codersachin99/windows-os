import {expect,test,type Page} from "@playwright/test";

/** Original compiled ControlItem (e863) source from
 * legacy-win7@4e63290d, shared~about~bin~...~40bd2819.js.
 * This tests the source SVG, not generic Unicode caption symbols. */
const art=[
  {theme:"win7",min:"0 -3 12 5",maximize:"0 0 17 15",
    restore:"0 0 21 21",close:"0 0 13 12",
    minPath:"",maxPath:"M17 15H0V0H17V15ZM4 4.5V10.5H13V4.5H4Z",
    closePath:"M5.5 1H0.5V3H1.5V4H2.5V5H3.5V7H2.5V8H1.5V9H0.5V11H5.5V10H7.5V11H12.5V9H11.5V8H10.5V7H9.5V5H10.5V4H11.5V3H12.5V1H7.5V2H5.5V1Z"},
  {theme:"winxp",min:"1 -5 7 7",maximize:"0 0 9 9",
    restore:"0 0 11 12",close:"0 0 11 11",
    minPath:"M0 0h6v2H0z",maxPath:"M9 0H0v9h9V0zM8 2H1v6h7V2z",
    closePath:"M1 0.5H2ZM9 0.5H10ZM0 1.5H3ZM8 1.5H11ZM1 2.5H4ZM7 2.5H10ZM2 3.5H5ZM6 3.5H9ZM3 4.5H8ZM4 5.5H7ZM3 6.5H8ZM2 7.5H5ZM6 7.5H9ZM1 8.5H4ZM7 8.5H10ZM0 9.5H3ZM8 9.5H11ZM1 10.5H2ZM9 10.5H10Z"},
  {theme:"win11",min:"0 -3 10 1",maximize:"0 0 10 10",
    restore:"0 0 12 12",close:"0 0 10 11",
    minPath:"M0 0.5H10",maxPath:"",
    closePath:"M0.757359 1.25737L9.24264 9.74265M9.24264 1.25737L0.757359 9.74265"}
] as const;
async function openGuest(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const window=page.locator('[data-test-window="computer"]');
  await expect(window).toBeVisible();
  return window;
}
for(const source of art){
  test(source.theme+" titlebar uses pinned minimize, maximize, restore and close SVG",async({page})=>{
    const win=await openGuest(page,source.theme);
    const glyph=(kind:string)=>win.locator(
      '[data-source-window-control="'+kind+'"] svg');
    for(const [kind,viewBox] of [
      ["minimize",source.min],["maximize",source.maximize],["close",source.close]
    ] as const){
      await expect(glyph(kind)).toHaveAttribute("viewBox",viewBox);
      await expect(glyph(kind)).toHaveAttribute("aria-hidden","true");
      await expect(glyph(kind)).toHaveAttribute("data-source-window-glyph",kind);
      await expect(glyph(kind)).toHaveCount(1);
    }
    if(source.minPath)await expect(glyph("minimize").locator("path"))
      .toHaveAttribute("d",source.minPath);
    if(source.maxPath)await expect(glyph("maximize").locator("path").first())
      .toHaveAttribute("d",source.maxPath);
    await expect(glyph("close").locator("path").first())
      .toHaveAttribute("d",source.closePath);
    if(source.theme==="win7"){
      await expect(glyph("maximize").locator("defs linearGradient stop")).toHaveCount(9);
      await expect(glyph("close").locator("defs linearGradient stop")).toHaveCount(9);
    }
    // Original WindowControl swaps maximize with *restore* on maximization.
    await win.getByRole("button",{name:"Maximize Computer"}).click();
    await expect(glyph("maximize")).toHaveCount(0);
    await expect(glyph("restore")).toHaveAttribute("viewBox",source.restore);
    await expect(win.locator('[data-source-window-control="restore"]'))
      .toHaveAttribute("title","Restore");
    await win.getByRole("button",{name:"Maximize Computer"}).click();
    await expect(glyph("restore")).toHaveCount(0);
    await expect(glyph("maximize")).toHaveAttribute("viewBox",source.maximize);
    // Source glyphs are inside buttons; interaction stays keyboard accessible.
    await win.getByRole("button",{name:"Close Computer"}).focus();
    await page.keyboard.press("Enter");
    await expect(win).toHaveCount(0);
  });
}
