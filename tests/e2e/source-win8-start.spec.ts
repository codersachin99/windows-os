import {expect,test,type Page} from "@playwright/test";

const original={
  win8:"/assets/images/win8.3a5f11f3.webp",
  win81:"/assets/images/win81.7b80787e.webp"
} as const;
const startArt="/assets/images/win8-startscreen.844bc8df.webp";
const startButton="/assets/images/start-button-win8.2e5214cc.svg";

async function guest(page:Page,theme:keyof typeof original){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const desktop=page.locator('[data-test-main-screen]');
  await expect(desktop).toHaveAttribute("data-theme",theme);
  await expect(page.locator('[data-test-desktop-background]'))
    .toHaveAttribute("data-test-desktop-background",original[theme]);
}
async function openStart(page:Page){
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const start=page.locator('[data-test-win8-start-screen]');
  await expect(start).toBeVisible();
  return start;
}

for(const theme of ["win8","win81"] as const){
  test("source "+theme+" fullscreen tile Start, distinct wallpaper and desktop return",async({page})=>{
    await guest(page,theme);
    const startButtonNode=page.locator('[data-test-start-button]');
    await expect(startButtonNode.locator("img")).toHaveAttribute("src",startButton);
    if(theme==="win8"){
      const noHover=await page.evaluate(()=>window.matchMedia("(hover: none)").matches);
      await expect(startButtonNode).toHaveCSS("width",noHover?"26px":"14px");
      await expect(startButtonNode.locator("img")).toBeHidden();
    }else{
      await expect(startButtonNode).toHaveCSS("width","48px");
      await expect(startButtonNode.locator("img")).toHaveCSS("width","28px");
    }
    const start=await openStart(page);
    await expect(start).toHaveAttribute("data-source-start-theme",theme);
    await expect(start).toHaveCSS("position","fixed");
    await expect(start).toHaveCSS("background-image",new RegExp(startArt.replaceAll(".","\\.")));
    const screen=await start.boundingBox();
    const viewport=page.viewportSize()!;
    expect(screen).not.toBeNull();
    expect(screen!.width).toBeGreaterThanOrEqual(viewport.width-1);
    expect(screen!.height).toBeGreaterThanOrEqual(viewport.height-1);
    await expect(start.getByRole("heading",{name:"Start"})).toBeVisible();
    await expect(start.locator('[data-test-win8-start-core] .win8-start__tile'))
      .toHaveCount(4);
    await expect(start.locator('[data-test-win8-start-core-tile="computer"]'))
      .toHaveCSS("background-color","rgb(74, 50, 155)");
    await expect(start.locator('[data-test-win8-start-core-tile="games"]'))
      .toHaveCSS("background-color","rgb(53, 118, 43)");
    await expect(start.locator('[data-test-win8-start-core-tile="cpanel"]'))
      .toHaveCSS("background-color","rgb(14, 74, 160)");
    await expect(start.locator('[data-test-win8-start-desktop] .win8-start__desktop-background'))
      .toHaveCSS("background-image",new RegExp(original[theme].replaceAll(".","\\.")));
    await start.locator('[data-test-win8-start-desktop]').click();
    await expect(start).toHaveCount(0);
    await expect(page.locator("#desktop-icons")).toBeVisible();
  });

  test("source "+theme+" Guest tile powers and search app launch",async({page})=>{
    await guest(page,theme);
    let start=await openStart(page);
    const account=start.locator('[data-test-win8-start-account-toggle]');
    await expect(account.locator("img")).toHaveAttribute(
      "src","/assets/images/guest-win8.265e68f5.webp");
    await account.click();
    const accountMenu=start.locator('[data-test-win8-start-account-menu]');
    await expect(accountMenu).toBeVisible();
    await expect(accountMenu.getByRole("menuitem",{name:"Manage accounts"}))
      .toBeDisabled();
    await expect(accountMenu.getByRole("menuitem",{name:"Log off"})).toBeEnabled();
    await expect(accountMenu.getByRole("menuitem",{name:"Restart"})).toBeEnabled();
    await expect(accountMenu.getByRole("menuitem",{name:"Shut down"})).toBeEnabled();
    await page.keyboard.press("Escape");
    await expect(accountMenu).toHaveCount(0);
    await expect(start).toBeVisible();

    await start.locator('[data-test-start-search-button]').click();
    const search=start.locator('[data-test-win8-start-flyout]');
    await expect(search).toBeVisible();
    await expect(search).toHaveCSS("background-color","rgb(29, 29, 29)");
    const input=search.getByRole("searchbox",{name:"Search programs and files"});
    await input.fill("Notepad");
    await expect(search.locator('[data-test-win8-start-result="notepad"]'))
      .toBeVisible();
    await input.press("Escape");
    await expect(search).toHaveCount(0);
    await expect(start).toBeVisible();
    // Source Start handles plain letter typing by opening its search flyout.
    await start.focus();
    await page.keyboard.type("calc");
    await expect(search).toBeVisible();
    await expect(input).toHaveValue("calc");
    await expect(search.locator('[data-test-win8-start-result="calc"]')).toBeVisible();
    await input.press("Enter");
    await expect(page.locator('[data-test-window="calc"]')).toBeVisible();
    await expect(start).toHaveCount(0);
  });

  test("source "+theme+" real Computer tile, square Win8 chrome and 20px caption controls",async({page})=>{
    await guest(page,theme);
    const start=await openStart(page);
    await start.locator('[data-test-win8-start-core-tile="computer"]').click();
    const computer=page.locator('[data-test-window="computer"]').last();
    await expect(computer).toBeVisible();
    await expect(start).toHaveCount(0);
    await expect(computer).toHaveCSS("border-top-left-radius","0px");
    await expect(computer.locator(".windows-window__titlebar")).toHaveCSS("height","20px");
    const close=computer.locator(".windows-window__close");
    await expect(close).toHaveCSS("width","42px");
    await expect(close).toHaveCSS("height","20px");
    await close.click();
    await expect(computer).toHaveCount(0);
  });
}

test("source Win8 Start program right-click still uses real shared pin and launch actions",async({page})=>{
  await guest(page,"win8");
  const start=await openStart(page);
  const tile=start.locator('[data-test-program="notepad"]');
  await expect(tile).toBeVisible();
  await tile.click({button:"right"});
  const context=page.locator('[data-test-start-program-context="notepad"]');
  await expect(context).toBeVisible();
  await context.locator('[data-test-start-context-action="pin"]').click();
  await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toHaveCount(1);
  await expect(start).toBeVisible();
  await tile.click();
  await expect(page.locator('[data-test-window="notepad"]')).toBeVisible();
});
