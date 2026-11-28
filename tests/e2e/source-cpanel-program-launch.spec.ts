import {expect,test,type Page} from "@playwright/test";

async function openControlPanel(page:Page){
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator("[data-test-open-cpanel]").click();
  const panel=page.locator('[data-test-window="cpanel"]');
  await expect(panel).toBeVisible();
  return panel;
}

test("original Control Panel theme task launches actual Personalize window",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  const input=panel.getByRole("searchbox",{name:"Search Control Panel"});
  await input.fill("change the theme");
  const result=panel.locator('[data-test-cpanel-result="personalize"]');
  await expect(result).toBeVisible();
  const themeTask=result.getByRole("button",{name:"Change the theme"});
  await expect(themeTask).toBeEnabled();
  await themeTask.click();
  const personalize=page.locator('[data-test-window="personalize"]');
  await expect(personalize).toBeVisible();
  // A program target opens its own window, not a fake CPanel history page.
  await expect(win).toBeVisible();
  await personalize.locator('[data-test-personalize-theme="winxp"]').click();
  await expect(page.locator("[data-test-main-screen]"))
    .toHaveAttribute("data-theme","winxp");
});

test("original Control Panel taskbar program opens its own settings window",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await expect(panel.locator('[data-test-cpanel-item="defender"]')).toBeDisabled();
  await expect(panel.locator('[data-test-cpanel-item="gadgets"]')).toBeDisabled();
  const entry=panel.locator('[data-test-cpanel-item="taskbar"]');
  await expect(entry).toBeEnabled();
  await entry.click();
  const taskbar=page.locator('[data-test-window="taskbar"]');
  await expect(taskbar).toBeVisible();
  await expect(taskbar.getByRole("tablist",{name:"Taskbar and Start Menu Properties"})
    .getByRole("tab")).toHaveText(["Taskbar","Start Menu","Toolbars"]);
  await expect(win).toBeVisible();
});

test("source Control Panel Change desktop background opens actual Background view",async({page})=>{
  const cpanel=await openControlPanel(page);
  const input=cpanel.getByRole("searchbox",{name:"Search Control Panel"});
  await input.fill("change desktop background");
  const result=cpanel.locator('[data-test-cpanel-result="personalize"]');
  const task=result.getByRole("button",{name:"Change desktop background"});
  await expect(task).toBeEnabled();
  await task.click();
  const personalize=page.locator('[data-test-window="personalize"]');
  await expect(personalize.locator('[data-personalize-view="background"]'))
    .toBeVisible();
  // Original imported image gallery now contains 30 distinct source paths.
  await expect(personalize.locator('[data-test-bg-list="system"] [data-test-bg-item]'))
    .toHaveCount(30);
  for(const original of [
    "architecture.e651db26.webp",
    "landscape.1626b82c.webp",
    "nature.e05e4ec0.webp"
  ]){
    await expect(personalize.locator(
      '[data-test-bg-list="system"] [data-test-bg-item="/assets/images/'+original+'"] img'
    )).toHaveAttribute("src","/assets/images/"+original);
  }
  await expect(personalize.locator('[data-test-bg-item="/assets/images/win10.743e8c13.webp"] img'))
    .toHaveAttribute("src","/assets/images/win10.743e8c13.webp");
  const background="/assets/images/win7-2.bf7d7452.webp";
  await personalize.locator('[data-test-bg-item="'+background+'"]').click();
  await expect(page.locator("[data-test-desktop-background]"))
    .toHaveAttribute("data-test-desktop-background",
      "/assets/images/default.deccec52.webp");
  await personalize.locator('[data-test-button="save"]').click();
  await expect(page.locator("[data-test-desktop-background]"))
    .toHaveAttribute("data-test-desktop-background",background);
  await expect(personalize.locator('[data-personalize-view="theme"]'))
    .toBeVisible();
  // Search opens another shell program: CPanel navigation remains independent.
  await expect(cpanel).toBeVisible();
});

test("source Control Panel does not claim unported appearance and taskbar actions",async({page})=>{
  const cpanel=await openControlPanel(page);
  const input=cpanel.getByRole("searchbox",{name:"Search Control Panel"});
  for(const [search,category,button] of [
    ["auto-hide the taskbar","taskbar","Auto-hide the taskbar"],
    ["lock or unlock the taskbar","taskbar","Lock or unlock the taskbar"],
    ["customize the Start menu","taskbar","Customize the Start menu"],
    ["change window glass colors","personalize","Change window glass colors"],
    ["change screen saver","personalize","Change screen saver"]
  ] as const){
    await input.fill(search);
    const result=cpanel.locator('[data-test-cpanel-result="'+category+'"]');
    await expect(result).toBeVisible();
    await expect(result.getByRole("button",{name:button,exact:true}))
      .toBeDisabled();
    await expect(result.locator(".windows-cpanel__link")).toBeEnabled();
  }
  await input.fill("customize icons on the taskbar");
  const taskbar=cpanel.locator('[data-test-cpanel-result="taskbar"]');
  await expect(taskbar).toBeVisible();
  const notification=taskbar.getByRole("button",{
    name:"Customize icons on the taskbar"
  });
  await expect(notification).toBeEnabled();
  await notification.click();
  await expect(cpanel.locator("[data-test-cpanel-notification]")).toBeVisible();
});


test("Control Panel direct Background launch restores committed Aero appearance",async({page})=>{
  await page.goto("/?theme=aero-2");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator("[data-test-open-cpanel]").click();
  const cpanel=page.locator('[data-test-window="cpanel"]');
  const input=cpanel.getByRole("searchbox",{name:"Search Control Panel"});
  await input.fill("change the theme");
  await cpanel.locator('[data-test-cpanel-result="personalize"]')
    .getByRole("button",{name:"Change the theme"}).click();
  const editor=page.locator('[data-test-window="personalize"]').first();
  const tint=()=>page.locator("[data-test-main-screen]").evaluate(el=>
    getComputedStyle(el).getPropertyValue("--theme-color").trim());
  await editor.locator("[data-test-personalize-appearance-link]").click();
  await editor.locator('[data-test-color-item="#d13438"]').click();
  await editor.locator("[data-test-color-save]").click();
  await editor.locator("[data-test-personalize-appearance-link]").click();
  await editor.locator('[data-test-color-item="#00b294"]').click();
  await editor.locator("[data-test-color-transparency]").uncheck();
  await expect.poll(tint).toBe("#00b294");

  // Switch to the already-open Control Panel, not a reload or a simulated route.
  await page.locator('[data-test-taskbar-running-group="cpanel"]').click();
  await input.fill("change desktop background");
  await cpanel.locator('[data-test-cpanel-result="personalize"]')
    .getByRole("button",{name:"Change desktop background"}).click();
  const picker=page.locator('[data-test-window="personalize"]').last();
  await expect(picker.locator('[data-personalize-view="background"]')).toBeVisible();
  await expect.poll(tint).toBe("rgba(209, 52, 56, 0.65)");
  await picker.locator('[data-test-button="cancel"]').click();
  await picker.locator("[data-test-personalize-appearance-link]").click();
  await expect(picker.locator('[data-test-color-item="#d13438"]'))
    .toHaveAttribute("aria-pressed","true");
  await expect(picker.locator("[data-test-color-transparency]")).toBeChecked();
});
