import {expect,test,type Page} from "@playwright/test";

const DESKTOP="/EXTERNAL/computer/drive0/Users/Guest/Desktop";

async function desktopGuest(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function desktopMenu(page:Page){
  const desktop=page.locator("#desktop-icons");
  await desktop.click({button:"right",position:{x:260,y:200}});
  const menu=desktop.locator('[data-test-desktop-menu]');
  await expect(menu).toBeVisible();
  return menu;
}
test("pinned main.js Desktop background menu restores its source actions",async({page})=>{
  await desktopGuest(page);
  const menu=await desktopMenu(page);
  const labels=await menu.locator(':scope > button').allTextContents();
  expect(labels.map(label=>label.trim())).toEqual([
    "View ▸","Sort by ▸","Refresh","Paste","Upload Files",
    "Map Directory","New ▸","Display","Gadgets","Personalize"
  ]);
  await expect(menu.locator("[data-test-desktop-copy-path]")).toHaveCount(0);
  await expect(menu.locator("[data-test-desktop-map-directory]")).toBeDisabled();
  await expect(menu.locator("[data-test-desktop-upload-here]")).toBeEnabled();
  await expect(menu.locator("[data-test-desktop-display]")).toBeEnabled();
  // Gadgets remains unported; source Personalization ChangeTheme now
  // has a real first slice reachable through the original context menu.
  await expect(menu.locator("[data-test-desktop-gadgets]")).toBeDisabled();
  await expect(menu.locator("[data-test-desktop-personalize]")).toBeEnabled();
});
test("final source menu hides Copy Path by app.config flag",async({page})=>{
  await desktopGuest(page);
  const menu=await desktopMenu(page);
  await expect(menu.locator("[data-test-desktop-copy-path]")).toHaveCount(0);
  await expect(menu.locator("[data-test-desktop-upload-here]")).toBeEnabled();
  await expect(menu.locator("[data-test-desktop-map-directory]")).toBeDisabled();
});

test("final source Sort by supports all columns, ascending and descending",async({page})=>{
  await desktopGuest(page);
  const menu=await desktopMenu(page);
  await menu.locator("[data-test-desktop-sort]").click();
  await expect(menu.locator("[data-test-desktop-sort-key]")).toHaveCount(4);
  await expect(menu.locator("[data-test-desktop-sort-direction]")).toHaveCount(2);
  await expect(menu.locator('[data-test-desktop-sort-key="name"]'))
    .toHaveAttribute("aria-checked","true");
  await menu.locator('[data-test-desktop-sort-key="size"]').click();
  await expect(menu).toHaveCount(0);
  const next=await desktopMenu(page);
  await next.locator("[data-test-desktop-sort]").click();
  await expect(next.locator('[data-test-desktop-sort-key="size"]'))
    .toHaveAttribute("aria-checked","true");
  await next.locator('[data-test-desktop-sort-direction="desc"]').click();
  const finalMenu=await desktopMenu(page);
  await finalMenu.locator("[data-test-desktop-sort]").click();
  await expect(finalMenu.locator('[data-test-desktop-sort-direction="desc"]'))
    .toHaveAttribute("aria-checked","true");
});
test("source Desktop Upload here writes actual imported files to Guest folder",async({page})=>{
  await desktopGuest(page);
  const menu=await desktopMenu(page);
  await menu.locator("[data-test-desktop-upload-here]").click();
  await expect(menu).toHaveCount(0);
  await page.locator('[data-test-desktop-upload-input]').setInputFiles({
    name:"Desktop Context Import.txt",mimeType:"text/plain",
    buffer:Buffer.from("Source desktop menu import")
  });
  const uploaded=page.locator('[data-test-desktop-file="'+
    DESKTOP+'/Desktop Context Import.txt"]');
  await expect(uploaded).toBeVisible();
  await uploaded.dblclick();
  await expect(page.locator('[data-test-window="notepad"] .cm-content'))
    .toContainText("Source desktop menu import");
});
test("pinned Desktop Display opens existing Control Panel Display with Back history",async({page})=>{
  await desktopGuest(page);
  const menu=await desktopMenu(page);
  await menu.locator("[data-test-desktop-display]").click();
  const win=page.locator('[data-test-window="cpanel"]');
  await expect(win).toBeVisible();
  const panel=win.locator("[data-test-cpanel]");
  await expect(panel.locator("[data-test-cpanel-display]")).toBeVisible();
  await panel.locator("[data-test-cpanel-back]").click();
  await expect(panel.locator("[data-test-cpanel-items]")).toBeVisible();
  await panel.locator("[data-test-cpanel-forward]").click();
  await expect(panel.locator("[data-test-cpanel-display]")).toBeVisible();
});

test("source measured desktop menu flips inside viewport as View/New expand",async({page})=>{
  await desktopGuest(page);
  const desktop=page.locator("#desktop-icons");
  const rect=await desktop.boundingBox();
  expect(rect).not.toBeNull();
  await desktop.click({button:"right",position:{
    x:Math.max(10,rect!.width-15),y:Math.max(10,rect!.height-15)
  }});
  const menu=desktop.locator("[data-test-desktop-menu]");
  const inDesktop=async()=>{
    const popup=await menu.boundingBox();
    const area=await desktop.boundingBox();
    expect(popup).not.toBeNull();
    expect(area).not.toBeNull();
    expect(popup!.x).toBeGreaterThanOrEqual(area!.x-1);
    expect(popup!.y).toBeGreaterThanOrEqual(area!.y-1);
    expect(popup!.x+popup!.width).toBeLessThanOrEqual(area!.x+area!.width+1);
    expect(popup!.y+popup!.height).toBeLessThanOrEqual(area!.y+area!.height+1);
  };
  await expect(menu).toBeVisible();
  await inDesktop();
  await menu.getByRole("menuitem",{name:/View/}).click();
  await expect(menu.getByRole("menuitemradio",{name:/Small icons/})).toBeVisible();
  await inDesktop();
  await menu.getByRole("menuitem",{name:/New/}).click();
  await expect(menu.locator("[data-test-desktop-new-text]")).toBeVisible();
  await inDesktop();
});


test("final source Desktop View, Sort by, New keyboard children stay exclusive",async({page})=>{
  await desktopGuest(page);
  const menu=await desktopMenu(page);
  const sort=menu.locator("[data-test-desktop-sort]");
  await sort.focus();
  await sort.press("ArrowRight");
  await expect(menu.locator('[data-test-desktop-sort-key="name"]'))
    .toBeFocused();
  await expect(menu.locator("[data-test-desktop-view]"))
    .toHaveAttribute("aria-expanded","false");
  await expect(menu.locator("[data-test-desktop-new]"))
    .toHaveAttribute("aria-expanded","false");
  await page.keyboard.press("ArrowLeft");
  await expect(sort).toBeFocused();
  await expect(sort).toHaveAttribute("aria-expanded","false");
  const view=menu.locator("[data-test-desktop-view]");
  await view.focus();
  await view.press("ArrowRight");
  await expect(menu.getByRole("menuitemradio",{name:/Small icons/})).toBeVisible();
  await expect(sort).toHaveAttribute("aria-expanded","false");
  const news=menu.locator("[data-test-desktop-new]");
  await news.focus();
  await news.press("ArrowRight");
  await expect(menu.locator("[data-test-desktop-new-folder]")).toBeFocused();
  await expect(view).toHaveAttribute("aria-expanded","false");
  await expect(sort).toHaveAttribute("aria-expanded","false");
});
