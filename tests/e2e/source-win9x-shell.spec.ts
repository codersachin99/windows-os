import {expect,test,type Page} from "@playwright/test";

const classics=[
  {id:"win95",surface:"rgb(189, 190, 189)",accent:"rgb(0, 0, 123)",
    wallpaper:"/assets/images/win95.fcef1b3b.webp",
    start:"/assets/images/start-button-classic.ec7b0b9f.webp",find:"Find..."},
  {id:"win98",surface:"rgb(192, 199, 200)",accent:"rgb(6, 8, 166)",
    wallpaper:"/assets/images/win95.fcef1b3b.webp",
    start:"/assets/images/start-button-classic.ec7b0b9f.webp",find:"Find..."},
  {id:"win2k",surface:"rgb(212, 208, 200)",accent:"rgb(8, 39, 103)",
    wallpaper:"/assets/images/default-win2k.1c1f7fa2.png",
    start:"/assets/images/start-button-win2k.650d501c.webp",find:"Search..."}
] as const;

async function classicDesktop(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const desktop=page.locator('[data-test-main-screen]');
  await expect(desktop).toHaveAttribute("data-theme",theme);
  return desktop;
}

for(const source of classics){
  test(source.id+" classic taskbar, original artwork and true cascading Start",async({page})=>{
    const desktop=await classicDesktop(page,source.id);
    await expect(desktop.locator('[data-test-desktop-background]'))
      .toHaveAttribute("data-test-desktop-background",source.wallpaper);
    const taskbar=desktop.locator('[data-test-taskbar="base"]');
    await expect(taskbar).toHaveCSS("height","36px");
    await expect(taskbar).toHaveCSS("background-color",source.surface);
    const start=taskbar.locator('[data-test-start-button]');
    await expect(start.locator("img")).toHaveAttribute("src",source.start);
    await expect(start,"source Start pseudo-text uses the original label")
      .toHaveCSS("border-radius","0px");
    await start.click();

    const menu=desktop.locator('[data-test-win9x-start-menu]');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute("data-source-start-theme",source.id);
    await expect(menu).toHaveCSS("width","230px");
    await expect(menu).toHaveCSS("background-color",source.surface);
    await expect(menu.locator(".source-win9x-startmenu__banner"))
      .toContainText("Windows");
    const find=menu.locator('[data-test-win9x-command="find"]');
    await expect(find).toHaveText(source.find);
    const programs=menu.locator('[data-test-win9x-branch="programs"]');
    await programs.click();
    const submenu=menu.locator('[data-test-win9x-submenu="programs"]');
    await expect(submenu).toBeVisible();
    await expect(submenu).toHaveCSS("width","224px");
    await expect(submenu.locator('[data-test-win9x-program="notepad"]'))
      .toBeVisible();
    await submenu.locator('[data-test-win9x-program="notepad"]').click();
    await expect(desktop.locator('[data-test-window="notepad"]')).toBeVisible();
    await expect(menu).toHaveCount(0);
    const notepad=desktop.locator('[data-test-window="notepad"]');
    await expect(notepad).toHaveCSS("border-top-left-radius","0px");
    await expect(notepad.locator(".windows-window__titlebar"))
      .toHaveCSS("height","24px");
    await expect(notepad.locator('[data-source-window-control="close"]'))
      .toHaveCSS("height","20px");
  });

  test(source.id+" classic Start Find/Search, programs, and power commands remain operational",async({page})=>{
    const desktop=await classicDesktop(page,source.id);
    const open=async()=>{
      await page.getByRole("button",{name:"Open Start menu"}).click();
      return desktop.locator('[data-test-win9x-start-menu]');
    };
    let menu=await open();
    const power=menu.locator('[data-test-win9x-branch="shutdown"]');
    await power.click();
    await expect(menu.locator('[data-test-win9x-submenu="shutdown"]')).toBeVisible();
    await expect(menu.locator('[data-test-win9x-power="restart"]')).toBeVisible();
    await expect(menu.locator('[data-test-win9x-power="log_off"]')).toBeVisible();
    await menu.locator('[data-test-win9x-power="log_off"]').click();
    await expect(page.locator('[data-test-logon-screen]')).toBeVisible();
    await page.locator('[data-test-avatar="win7"]').click();
    menu=await open();
    await menu.locator('[data-test-win9x-command="find"]').click();
    await expect(desktop.locator('[data-test-window="'+(source.id==="win2k"?"computer":"find")+'"]')).toBeVisible();
    await expect(menu).toHaveCount(0);
  });
}


for(const source of classics){
  test(source.id+" narrow classic cascade does not intercept parent triggers",async({page})=>{
    await page.setViewportSize({width:375,height:667});
    const desktop=await classicDesktop(page,source.id);
    await desktop.locator('[data-test-start-button]').click();
    const menu=desktop.locator('[data-test-win9x-start-menu]');
    const programs=menu.locator('[data-test-win9x-branch="programs"]');
    await programs.click();
    const flyout=menu.locator('[data-test-win9x-submenu="programs"]');
    await expect(flyout).toHaveAttribute("data-source-cascade-direction","below");
    const triggerBox=await programs.boundingBox();
    const flyoutBox=await flyout.boundingBox();
    expect(triggerBox).not.toBeNull();
    expect(flyoutBox).not.toBeNull();
    expect(flyoutBox!.y).toBeGreaterThanOrEqual(triggerBox!.y+triggerBox!.height+1);
    expect(flyoutBox!.x).toBeGreaterThanOrEqual(0);
    expect(flyoutBox!.x+flyoutBox!.width).toBeLessThanOrEqual(375);
    // The open child used to cover the parent button on mobile.
    await programs.click();
    await expect(flyout).toBeVisible();
    await flyout.locator('[data-test-win9x-program="notepad"]').focus();
    await page.keyboard.press("ArrowLeft");
    await expect(flyout).toHaveCount(0);
    await expect(programs).toBeFocused();
    await programs.click();
    await menu.locator('[data-test-win9x-program="notepad"]').click();
    await expect(desktop.locator('[data-test-window="notepad"]')).toBeVisible();
    await desktop.locator('[data-test-start-button]').click();
    const shutdown=menu.locator('[data-test-win9x-branch="shutdown"]');
    await shutdown.click();
    const power=menu.locator('[data-test-win9x-submenu="shutdown"]');
    await expect(power).toHaveAttribute("data-source-cascade-direction","above");
    const shutdownBox=await shutdown.boundingBox();
    const powerBox=await power.boundingBox();
    expect(shutdownBox).not.toBeNull();
    expect(powerBox).not.toBeNull();
    expect(powerBox!.y+powerBox!.height)
      .toBeLessThanOrEqual(shutdownBox!.y-1);
    await shutdown.click();
    await expect(power).toBeVisible();
    await power.locator('[data-test-win9x-power="log_off"]').click();
    await expect(page.locator('[data-test-logon-screen]')).toBeVisible();
  });
}
