import {expect,test,type Page} from "@playwright/test";

const fallback="/assets/images/default.deccec52.webp";
const alternate="/assets/images/win7-1.5c44223b.webp";
const xp="/assets/images/winxp.3e41719f.webp";
async function login(page:Page){
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
}
async function personalize(page:Page){
  await page.locator("#desktop-icons").click({
    button:"right",position:{x:260,y:200}
  });
  await page.locator("[data-test-desktop-personalize]").click();
  const win=page.locator('[data-test-window="personalize"]');
  await expect(win).toBeVisible();
  return win;
}
async function backgroundView(page:Page){
  let win=page.locator('[data-test-window="personalize"]').last();
  if(await win.count()===0)win=await personalize(page);
  await win.locator("[data-test-personalize-background-link]").click();
  const content=win.locator('[data-personalize-view="background"]');
  await expect(content).toBeVisible();
  return content;
}

test("source ChangeBackground system tiles stage changes until Save and Cancel",async({page})=>{
  await login(page);
  const desktop=page.locator("[data-test-desktop-background]");
  await expect(desktop).toHaveAttribute("data-test-desktop-background",fallback);
  let view=await backgroundView(page);
  const system=view.locator('[data-test-bg-list="system"]');
  // Win8/Win81 original wallpapers are byte-imported as separate themes.
  await expect(system.locator("[data-test-bg-item]")).toHaveCount(10);
  await expect(system.locator('[data-test-bg-item="/assets/images/win8.3a5f11f3.webp"] img'))
    .toHaveAttribute("src","/assets/images/win8.3a5f11f3.webp");
  await expect(system.locator('[data-test-bg-item="/assets/images/win81.7b80787e.webp"] img'))
    .toHaveAttribute("src","/assets/images/win81.7b80787e.webp");
  await expect(system.locator('[data-test-bg-item="/assets/images/win10.743e8c13.webp"] img'))
    .toHaveAttribute("src","/assets/images/win10.743e8c13.webp");
  const chosen=system.locator('[data-test-bg-item="'+alternate+'"]');
  await expect(chosen.locator("img")).toHaveAttribute("src",alternate);
  await chosen.click();
  await expect(chosen).toHaveAttribute("aria-pressed","true");
  await expect(desktop).toHaveAttribute("data-test-desktop-background",fallback);
  await view.locator('[data-test-button="cancel"]').click();
  await expect(page.locator('[data-personalize-view="theme"]')).toBeVisible();
  await expect(desktop).toHaveAttribute("data-test-desktop-background",fallback);

  view=await backgroundView(page);
  await view.locator('[data-test-bg-item="'+alternate+'"]').click();
  await view.locator('[data-test-button="save"]').click();
  await expect(desktop).toHaveAttribute("data-test-desktop-background",alternate);
  await expect(desktop).toHaveCSS("background-image",/win7-1\.5c44223b\.webp/);
  await expect(page.locator('[data-personalize-view="theme"]')).toBeVisible();
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-desktop-background]"))
    .toHaveAttribute("data-test-desktop-background",alternate);
});

test("changing source theme replaces the saved background and stays saved",async({page})=>{
  await login(page);
  const view=await backgroundView(page);
  await view.locator('[data-test-bg-item="'+alternate+'"]').click();
  await view.locator('[data-test-button="save"]').click();
  const theme=page.locator('[data-test-window="personalize"]');
  await theme.locator('[data-test-personalize-theme="winxp"]').click();
  await expect(page.locator("[data-test-main-screen]"))
    .toHaveAttribute("data-theme","winxp");
  await expect(page.locator("[data-test-desktop-background]"))
    .toHaveAttribute("data-test-desktop-background",xp);
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-main-screen]"))
    .toHaveAttribute("data-theme","winxp");
  await expect(page.locator("[data-test-desktop-background]"))
    .toHaveAttribute("data-test-desktop-background",xp);
});
