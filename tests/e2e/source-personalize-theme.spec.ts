import {expect,test,type Page} from "@playwright/test";
async function openPersonalize(page:Page){
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const desktop=page.locator("#desktop-icons");
  await desktop.click({button:"right",position:{x:260,y:200}});
  const menu=desktop.locator("[data-test-desktop-menu]");
  await expect(menu).toBeVisible();
  await menu.locator("[data-test-desktop-personalize]").click();
  const win=page.locator('[data-test-window="personalize"]');
  await expect(win).toBeVisible();
  return win;
}
test("source Desktop Personalize changes shell, artwork and wallpaper in place",async({page})=>{
  const win=await openPersonalize(page);
  const chooser=win.locator("[data-test-personalize]");
  await expect(chooser.locator("[data-test-personalize-group]")).toHaveCount(2);
  const xp=chooser.locator('[data-test-personalize-theme="winxp"]');
  const eleven=chooser.locator('[data-test-personalize-theme="win11"]');
  await expect(xp.locator("img")).toHaveAttribute("src",
    "/assets/images/winxp.3e41719f.webp");
  await expect(eleven.locator("img")).toHaveAttribute("src",
    "/assets/images/win11.fc00c43d.webp");
  await xp.click();
  await expect(page.locator("[data-test-main-screen]")).toHaveAttribute("data-theme","winxp");
  await expect(xp).toHaveAttribute("aria-pressed","true");
  await expect(page.locator("[data-test-desktop-background]"))
    .toHaveCSS("background-image",/winxp\.3e41719f\.webp/);
  await eleven.click();
  await expect(page.locator("[data-test-main-screen]")).toHaveAttribute("data-theme","win11");
  await expect(eleven).toHaveAttribute("aria-pressed","true");
  await expect(page.locator("[data-test-start-button] img"))
    .toHaveAttribute("src","/assets/images/start-button-win11.e48a735f.webp");
  await expect(page.locator("[data-test-desktop-background]"))
    .toHaveCSS("background-image",/win11\.fc00c43d\.webp/);
});
test("source selected theme restores on login and explicit theme URL overrides it",async({page})=>{
  const win=await openPersonalize(page);
  await win.locator('[data-test-personalize-theme="winxp"]').click();
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-main-screen]")).toHaveAttribute("data-theme","winxp");
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-main-screen]")).toHaveAttribute("data-theme","win7");
});


test("source Personalize chooses Win8 and Win8.1 separately with original wallpaper",async({page})=>{
  const win=await openPersonalize(page);
  const chooser=win.locator('[data-test-personalize]');
  const eight=chooser.locator('[data-test-personalize-theme="win8"]');
  const eightOne=chooser.locator('[data-test-personalize-theme="win81"]');
  await expect(eight.locator("img")).toHaveAttribute(
    "src","/assets/images/win8.3a5f11f3.webp");
  await expect(eightOne.locator("img")).toHaveAttribute(
    "src","/assets/images/win81.7b80787e.webp");
  await eight.click();
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveAttribute("data-theme","win8");
  await expect(page.locator('[data-test-desktop-background]'))
    .toHaveAttribute("data-test-desktop-background",
      "/assets/images/win8.3a5f11f3.webp");
  await expect(eight).toHaveAttribute("aria-pressed","true");
  await eightOne.click();
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveAttribute("data-theme","win81");
  await expect(page.locator('[data-test-desktop-background]'))
    .toHaveAttribute("data-test-desktop-background",
      "/assets/images/win81.7b80787e.webp");
  await expect(eightOne).toHaveAttribute("aria-pressed","true");
  await expect(page.locator('[data-test-start-button] img'))
    .toHaveAttribute("src","/assets/images/start-button-win8.2e5214cc.svg");
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveAttribute("data-theme","win81");
  await expect(page.locator('[data-test-desktop-background]'))
    .toHaveAttribute("data-test-desktop-background",
      "/assets/images/win81.7b80787e.webp");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await expect(page.locator('[data-test-win8-start-screen]'))
    .toHaveAttribute("data-source-start-theme","win81");
});
