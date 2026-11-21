import {expect,test,type Locator,type Page} from "@playwright/test";

/** Immutable legacy-win7@26b9f0ce source computer.js window-menubar
 * asToolbar + icon-only eight-mode View: Win8 and Win8.1 are not exempt.
 * theme-win8-scss.js popup/menubar colors are shared by both themes.
 */
const themes=["win8","win81"] as const;
const names=[
  "Extra large icons","Large icons","Medium icons","Small icons",
  "List","Details","Tiles","Content"
];
const baseSurface="rgb(240, 240, 240)";
async function open(page:Page,theme:typeof themes[number],app:"computer"|"bin"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="'+app+'"]').dblclick();
  const win=page.locator('[data-test-window="'+app+'"]').last();
  await expect(win).toBeVisible();
  return win;
}
async function sourceToolbar(page:Page,win:Locator){
  await expect(win.locator(".explorer-stage")).toHaveClass(/is-source-win8/);
  const command=win.locator(".explorer-command");
  await expect(command).toHaveCSS("background-color",baseSurface);
  const view=win.getByRole("button",{name:"View",exact:true});
  const organize=win.getByRole("button",{name:"Organize",exact:true});
  await expect(view).toBeVisible();
  await expect(view.locator("img")).toHaveAttribute("src",/view-tiles\.c4008351\.webp$/);
  await expect(win.getByRole("combobox",{name:"Explorer view"})).toHaveCount(0);
  await organize.click();
  const popup=win.getByRole("menu",{name:"Organize"});
  await expect(popup).toBeVisible();
  await expect(popup).toHaveCSS("background-color",baseSurface);
  await expect(popup).toHaveCSS("border-top-color","rgba(0, 0, 0, 0.4)");
  const close=popup.getByRole("menuitem",{name:"Close",exact:true});
  await close.hover();
  await expect(close).toHaveCSS("background-color","rgba(146, 200, 253, 0.2)");
  await expect(close).toHaveCSS("box-shadow",/rgb\(138, 207, 255\)/);
  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  await expect(win).toBeVisible();

  await view.click();
  const menu=win.getByRole("menu",{name:"View options"});
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("background-color",baseSurface);
  await expect(menu).toHaveCSS("border-top-color","rgba(0, 0, 0, 0.4)");
  await expect(menu.getByRole("menuitemradio")).toHaveText(names);
  const slider=menu.getByRole("slider",{name:"View size"});
  await expect(slider).toHaveAttribute("min","0");
  await expect(slider).toHaveAttribute("max","7");
  await expect(slider).toHaveValue("6");
  await menu.getByRole("menuitemradio",{name:"Details"}).click();
  await expect(menu).toHaveCount(0);
  await expect(win.locator(".explorer-list")).toHaveClass(/has-details/);
  await expect(view.locator("img")).toHaveAttribute("src",/view-details\..*\.webp$/);
  await view.click();
  await expect(menu.getByRole("menuitemradio",{name:"Details"}))
    .toHaveAttribute("aria-checked","true");
  await expect(slider).toHaveValue("5");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(view).toBeFocused();
}

for(const theme of themes){
  test(theme+" source Computer Organize and icon View controls replace fallback dropdown",async({page})=>{
    const win=await open(page,theme,"computer");
    await sourceToolbar(page,win);
    await expect(win.getByRole("button",{name:"New folder"})).toBeEnabled();
  });
  test(theme+" source Bin inherits Computer View/Organize and keeps empty-bin actions safe",async({page})=>{
    const win=await open(page,theme,"bin");
    await sourceToolbar(page,win);
    await expect(win.getByRole("button",{name:"Restore",exact:true})).toBeDisabled();
    await expect(win.getByRole("button",{name:"Empty Recycle Bin"})).toBeDisabled();
  });
}
