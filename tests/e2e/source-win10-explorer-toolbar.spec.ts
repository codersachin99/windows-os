import {expect,test,type Locator,type Page} from "@playwright/test";

/** Pin: legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776.
 * computer.js renders window-menubar asToolbar, NOT ribbon__wrapper.
 * The Win10 source theme uses #fff menubar, #eee/1px #a0a0a0 dropdown,
 * source accent hover and an icon-only 8-mode View popup with 0..7 slider.
 */
async function openExplorer(page:Page,app:"computer"|"bin"){
  await page.goto("/?theme=win10");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="'+app+'"]').dblclick();
  const win=page.locator('[data-test-window="'+app+'"]').last();
  await expect(win).toBeVisible();
  return win;
}

async function expectMenuSourceSkin(win:Locator){
  const bar=win.locator(".explorer-command");
  await expect(bar).toHaveCSS("background-color","rgb(255, 255, 255)");
  await expect(bar).toHaveCSS("border-bottom-color","rgb(226, 227, 228)");
  const nav=win.locator(".explorer-navigation");
  await expect(nav).toHaveCSS("background-color","rgb(255, 255, 255)");
  const view=win.getByRole("button",{name:"View",exact:true});
  await expect(view).toBeVisible();
  await expect(win.getByRole("combobox",{name:"Explorer view"})).toHaveCount(0);
  const organize=win.getByRole("button",{name:"Organize",exact:true});
  await organize.click();
  const menu=win.getByRole("menu",{name:"Organize"});
  await expect(menu).toHaveCSS("background-color","rgb(238, 238, 238)");
  await expect(menu).toHaveCSS("border-top-color","rgb(160, 160, 160)");
  await expect(menu).toHaveCSS("border-top-left-radius","0px");
  const close=menu.getByRole("menuitem",{name:"Close",exact:true});
  await close.hover();
  await expect(close).toHaveCSS("background-color","rgb(144, 200, 246)");
  await pagePressEscape(win);
  await expect(menu).toHaveCount(0);

  await view.click();
  const popup=win.getByRole("menu",{name:"View options"});
  await expect(popup).toBeVisible();
  await expect(popup).toHaveCSS("background-color","rgb(238, 238, 238)");
  await expect(popup).toHaveCSS("border-top-color","rgb(160, 160, 160)");
  const labels=[
    "Extra large icons","Large icons","Medium icons","Small icons",
    "List","Details","Tiles","Content"
  ];
  await expect(popup.getByRole("menuitemradio")).toHaveText(labels);
  const slider=popup.getByRole("slider",{name:"View size"});
  await expect(slider).toHaveAttribute("min","0");
  await expect(slider).toHaveAttribute("max","7");
  const details=popup.getByRole("menuitemradio",{name:"Details"});
  await details.hover();
  await expect(details).toHaveCSS("background-color","rgb(144, 200, 246)");
  await details.click();
  await expect(win.locator(".explorer-list")).toHaveClass(/has-details/);
  await expect(popup).toHaveCount(0);
  await view.click();
  await expect(popup.getByRole("menuitemradio",{name:"Details"}))
    .toHaveAttribute("aria-checked","true");
  await pagePressEscape(win);
  await expect(popup).toHaveCount(0);
  await expect(view).toBeFocused();
}

/** WindowFrame keyboard handler also watches Escape. Use the menu's focused
 * child to verify the source popup consumes it without closing Explorer. */
async function pagePressEscape(win:Locator){
  await win.page().keyboard.press("Escape");
  await expect(win).toBeVisible();
}

test("Win10 Computer has original Organize / icon View toolbar and functional choices",async({page})=>{
  const computer=await openExplorer(page,"computer");
  await expect(computer.locator(".explorer-stage")).toHaveClass(/is-source-win10/);
  await expectMenuSourceSkin(computer);
  await expect(computer.getByRole("button",{name:"New folder"})).toBeEnabled();
});

test("Win10 Bin inherits identical Computer toolbar, real view actions and safe disabled controls",async({page})=>{
  const bin=await openExplorer(page,"bin");
  await expect(bin.locator(".explorer-stage")).toHaveClass(/is-source-win10/);
  await expectMenuSourceSkin(bin);
  await expect(bin.getByRole("button",{name:"Empty Recycle Bin"})).toBeDisabled();
  await expect(bin.getByRole("button",{name:"Restore",exact:true})).toBeDisabled();
});

test("non-Win10 Computer themes keep their current source-specific View behavior",async({page})=>{
  await page.goto("/?theme=winxp");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win.locator(".explorer-stage")).not.toHaveClass(/is-source-win10/);
  await expect(win.getByRole("combobox",{name:"Explorer view"})).toBeVisible();
  await expect(win.getByRole("button",{name:"View",exact:true})).toHaveCount(0);
});
