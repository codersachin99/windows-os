import {expect,test,type Page} from "@playwright/test";

/** Exact menu surface colors are pinned to the legacy-web original:
 * theme-win7-scss / theme-winxp-scss / theme-win11-scss at 4e63290d.
 * Test computed colors for actual Computer context + its side View popup,
 * not just presence of theme CSS selectors in the bundle. */
async function openSourceComputerMenu(page:Page,theme:"win7"|"win31"|"winxp"|"win10"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]');
  await expect(computer).toBeVisible();
  const area=computer.locator(".explorer-content");
  const bounds=await area.boundingBox();
  expect(bounds).not.toBeNull();
  await area.click({button:"right",position:{
    x:Math.max(10,bounds!.width-12),y:Math.max(10,bounds!.height-12)
  }});
  const menu=computer.locator('[data-test-explorer-context="background"]');
  await expect(menu).toBeVisible();
  return {computer,menu};
}
const cases=[
  {
    theme:"win31",
    surface:"rgb(255, 255, 255)",
    border:"rgb(0, 0, 0)",radius:"0px",
    hover:"rgb(8, 10, 189)"
  },
  {
    theme:"win7",
    surface:"rgb(241, 241, 241)",
    border:"rgb(151, 151, 151)",radius:"0px",
    hover:"gradient"
  },
  {
    theme:"winxp",
    surface:"rgb(255, 255, 255)",
    border:"rgb(172, 168, 153)",radius:"0px",
    hover:"rgb(49, 106, 197)"
  },
  {
    theme:"win10",
    surface:"rgb(238, 238, 238)",
    border:"rgb(160, 160, 160)",radius:"0px",
    hover:"rgb(255, 255, 255)"
  },
  {
    theme:"win11",
    surface:"rgb(249, 249, 249)",
    border:"rgba(0, 0, 0, 0.067)",radius:"6px",
    hover:"rgb(240, 240, 240)"
  }
] as const;
for(const source of cases){
  test("original "+source.theme+" Explorer context menu and child use source skin",async({page})=>{
    const {computer,menu}=await openSourceComputerMenu(page,source.theme);
    await expect(menu).toHaveCSS("background-color",source.surface);
    await expect(menu).toHaveCSS("border-top-color",source.border);
    await expect(menu).toHaveCSS("border-top-left-radius",source.radius);

    const refresh=menu.getByRole("menuitem",{name:"Refresh"});
    await refresh.hover();
    if(source.hover==="gradient"){
      await expect(refresh).toHaveCSS("background-image",/linear-gradient/);
      await expect(menu).toHaveCSS("box-shadow",/inset/);
    }else{
      await expect(refresh).toHaveCSS("background-color",source.hover);
      if(source.theme==="winxp"||source.theme==="win31")
        await expect(refresh).toHaveCSS("color","rgb(255, 255, 255)");
      else await expect(refresh).toHaveCSS("color",
        source.theme==="win10"?"rgb(0, 0, 0)":"rgb(26, 26, 26)");
    }

    await menu.locator("[data-test-explorer-context-view]").click();
    const child=menu.locator("[data-test-explorer-background-submenu]");
    await expect(child).toBeVisible();
    await expect(child).toHaveCSS("background-color",source.surface);
    await expect(child).toHaveCSS("border-top-color",source.border);
    await expect(child).toHaveCSS("border-top-left-radius",source.radius);
    await expect(child.getByRole("menuitemradio")).toHaveCount(8);
    // Child render stays a separate popup with the source skin.
    const rootRect=await menu.boundingBox();
    const popupRect=await child.boundingBox();
    expect(rootRect).not.toBeNull();
    expect(popupRect).not.toBeNull();
    expect(rootRect!.height).toBeLessThan(450);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);

    // Source ExplorerItemMenu uses the SAME theme skin as background View.
    await computer.locator(".explorer-navigation__home")
      .filter({hasText:"Documents"}).click();
    await computer.locator('input[type="file"][aria-label="Upload files"]')
      .setInputFiles({name:"Theme Menu File.txt",mimeType:"text/plain",
        buffer:Buffer.from("Guest theme source menu")});
    const item=computer.locator('[data-test-explorer-item="Theme Menu File.txt"]');
    await expect(item).toBeVisible();
    await item.click({button:"right"});
    const itemMenu=computer.locator('[data-test-explorer-context="item"]');
    await expect(itemMenu).toHaveCSS("background-color",source.surface);
    await expect(itemMenu).toHaveCSS("border-top-color",source.border);
    await itemMenu.locator("[data-test-explorer-item-send-to]").click();
    const itemChild=itemMenu.locator("[data-test-explorer-sendto-submenu]");
    await expect(itemChild).toBeVisible();
    await expect(itemChild).toHaveCSS("background-color",source.surface);
    await expect(itemChild).toHaveCSS("border-top-left-radius",source.radius);
    await expect(itemChild.locator('[data-test-explorer-item-send-to-kind="desktop"]'))
      .toBeEnabled();
    await page.keyboard.press("Escape");
    await expect(itemMenu).toHaveCount(0);
  });
}
