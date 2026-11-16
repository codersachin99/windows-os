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
    "View ▸","Refresh","Paste","Copy path","Upload files here","New ▸",
    "Display","Gadgets","Personalize"
  ]);
  await expect(menu.locator("[data-test-desktop-copy-path]")).toBeEnabled();
  await expect(menu.locator("[data-test-desktop-upload-here]")).toBeEnabled();
  await expect(menu.locator("[data-test-desktop-display]")).toBeEnabled();
  // Gadgets/Personalization are authentic legacy entries but their
  // original settings implementations must not be fabricated.
  await expect(menu.locator("[data-test-desktop-gadgets]")).toBeDisabled();
  await expect(menu.locator("[data-test-desktop-personalize]")).toBeDisabled();
});
test("source Desktop Copy path uses Guest virtual filesystem, not host disk",async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,"clipboard",{configurable:true,value:{
      writeText:async(text:string)=>{
        (window as unknown as {copiedDesktopPath?:string}).copiedDesktopPath=text;
      }
    }});
  });
  await desktopGuest(page);
  const menu=await desktopMenu(page);
  await menu.locator("[data-test-desktop-copy-path]").click();
  await expect(menu).toHaveCount(0);
  expect(await page.evaluate(()=>
    (window as unknown as {copiedDesktopPath?:string}).copiedDesktopPath
  )).toBe(DESKTOP);
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
