import {expect,test,type Page} from "@playwright/test";

async function openSourcePerformance(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator("[data-test-open-cpanel]").click();
  const cpanel=page.locator('[data-test-window="cpanel"]');
  await expect(cpanel).toBeVisible();
  const entry=cpanel.locator('[data-test-cpanel-item="system"]');
  await expect(entry).toBeEnabled();
  await entry.click();
  const system=page.locator('[data-test-window="system"]');
  await expect(system.locator("[data-test-system-properties]")).toBeVisible();
  await expect(cpanel).toBeVisible();
  await system.locator("[data-test-system-performance-open]").click();
  const dialog=system.locator("[data-test-performance-options]");
  await expect(dialog).toBeVisible();
  return {cpanel,system,dialog,desktop:page.locator("[data-test-main-screen]")};
}

test("source System Properties Visual Effects Cancel discards edits without affecting Aero",async({page})=>{
  const {system,dialog,desktop}=await openSourcePerformance(page);
  await expect(dialog.locator('[data-test-vfx-preset="auto"]')).toBeChecked();
  await expect(dialog.locator("[data-test-vfx-enableGlass]")).toBeChecked();
  await expect(dialog.locator("[data-test-vfx-showWindowShadows]")).toBeChecked();
  await expect(desktop).toHaveAttribute("data-effect-enable-glass","");
  await expect(desktop).toHaveAttribute("data-effect-show-window-shadows","");
  await dialog.locator('[data-test-vfx-preset="performance"]').check();
  await expect(dialog.locator("[data-test-vfx-enableGlass]")).not.toBeChecked();
  await expect(dialog.locator("[data-test-vfx-showWindowShadows]")).not.toBeChecked();
  await expect(dialog.locator("[data-test-vfx-apply]")).toBeEnabled();
  await expect(desktop).toHaveAttribute("data-effect-enable-glass","");
  await dialog.locator("[data-test-vfx-cancel]").click();
  await expect(dialog).toHaveCount(0);
  await system.locator("[data-test-system-performance-open]").click();
  await expect(system.locator('[data-test-vfx-preset="auto"]')).toBeChecked();
});

test("source Performance Options Apply persists independent glass/shadow switches and reloads",async({page})=>{
  const {system,dialog,desktop}=await openSourcePerformance(page);
  await dialog.locator('[data-test-vfx-preset="performance"]').check();
  await dialog.locator("[data-test-vfx-apply]").click();
  await expect(desktop).not.toHaveAttribute("data-effect-enable-glass","");
  await expect(desktop).not.toHaveAttribute("data-effect-show-window-shadows","");
  await expect(dialog.locator("[data-test-vfx-apply]")).toBeDisabled();
  await dialog.locator("[data-test-vfx-enableGlass]").check();
  await expect(dialog.locator('[data-test-vfx-preset="custom"]')).toBeChecked();
  await dialog.locator("[data-test-vfx-ok]").click();
  await expect(dialog).toHaveCount(0);
  await expect(desktop).toHaveAttribute("data-effect-enable-glass","");
  await expect(desktop).not.toHaveAttribute("data-effect-show-window-shadows","");
  const persisted=await page.evaluate(()=>
    JSON.parse(localStorage.getItem("windows-os:guest:visual-effects:v1")??"null"));
  expect(persisted).toEqual({
    preset:"custom",enableGlass:true,showWindowShadows:false,animateTaskbar:false
  });
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-main-screen]"))
    .toHaveAttribute("data-effect-enable-glass","");
  await expect(page.locator("[data-test-main-screen]"))
    .not.toHaveAttribute("data-effect-show-window-shadows","");
  await expect(system).toHaveCount(0);
});

test("source System Performance unsupported host controls remain visibly unavailable",async({page})=>{
  const {dialog}=await openSourcePerformance(page);
  await dialog.getByRole("button",{name:"Advanced",exact:true}).click();
  await expect(dialog.getByRole("button",{name:"Change..."})).toBeDisabled();
  await dialog.getByRole("button",{name:"Data Execution Prevention"}).click();
  await expect(dialog).toContainText("not accessible");
  await dialog.getByRole("button",{name:"Visual Effects"}).click();
  await expect(dialog.locator("[data-test-vfx-enableGlass]")).toBeEnabled();
  await expect(dialog.locator("[data-test-vfx-showWindowShadows]")).toBeEnabled();
});

test("source System Properties switches all five original tabs without enabling host operations",async({page})=>{
  const {system,dialog}=await openSourcePerformance(page);
  await dialog.locator("[data-test-vfx-cancel]").click();
  const tabs=system.getByRole("navigation",{name:"System Properties tabs"});
  await expect(tabs.locator('[data-test-system-tab="advanced"]'))
    .toHaveAttribute("aria-current","page");
  await tabs.locator('[data-test-system-tab="computerName"]').click();
  await expect(system.locator('[data-test-system-page="computerName"]'))
    .toContainText("Windows uses the following information");
  await expect(system.getByRole("button",{name:"Network ID..."})).toBeDisabled();
  await expect(system.getByRole("button",{name:"Change..."})).toBeDisabled();
  await tabs.locator('[data-test-system-tab="hardware"]').click();
  await expect(system.locator('[data-test-system-page="hardware"]'))
    .toContainText("The Device Manager lists all the hardware devices");
  await expect(system.getByRole("button",{name:"Device Manager",exact:true}))
    .toBeDisabled();
  await tabs.locator('[data-test-system-tab="systemProtection"]').click();
  await expect(system.locator('[data-test-system-page="systemProtection"]'))
    .toContainText("Protection Settings");
  await expect(system.getByRole("button",{name:"Create..."})).toBeDisabled();
  await tabs.locator('[data-test-system-tab="remote"]').click();
  await expect(system.locator('[data-test-system-page="remote"]'))
    .toContainText("Remote Desktop");
  await expect(system.getByRole("button",{name:"Select Users..."}))
    .toBeDisabled();
  await tabs.locator('[data-test-system-tab="advanced"]').click();
  await expect(system.locator('[data-test-system-page="advanced"]'))
    .toContainText("Visual effects, processor scheduling");
  await system.locator("[data-test-system-performance-open]").click();
  await expect(system.locator("[data-test-performance-options]")).toBeVisible();
});

test("source taskbar animation independently applies, cancels and persists",async({page})=>{
  const {system,dialog,desktop}=await openSourcePerformance(page);
  const animation=dialog.locator("[data-test-vfx-animateTaskbar]");
  const sprite=desktop.locator("[data-test-source-start-sprite]");
  const duration=()=>sprite.evaluate(el=>getComputedStyle(el,"::after").transitionDuration);
  await page.emulateMedia({reducedMotion:"no-preference"});
  await expect(animation).toBeChecked();
  await expect(desktop).toHaveAttribute("data-effect-animate-taskbar","");
  await expect.poll(duration).toBe("0.4s");
  await animation.uncheck();
  await expect(dialog.locator('[data-test-vfx-preset="custom"]')).toBeChecked();
  await expect.poll(duration).toBe("0.4s");
  await dialog.locator("[data-test-vfx-apply]").click();
  await expect(desktop).not.toHaveAttribute("data-effect-animate-taskbar","");
  await expect.poll(duration).toBe("0s");
  await expect(desktop).toHaveAttribute("data-effect-enable-glass","");
  await expect(desktop).toHaveAttribute("data-effect-show-window-shadows","");
  await animation.check();
  await dialog.locator("[data-test-vfx-cancel]").click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(duration).toBe("0s");
  await system.locator("[data-test-system-performance-open]").click();
  await expect(animation).not.toBeChecked();
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(desktop).not.toHaveAttribute("data-effect-animate-taskbar","");
  await expect.poll(duration).toBe("0s");
});
