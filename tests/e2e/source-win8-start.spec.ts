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


for(const theme of ["win8","win81"] as const){
  test("source "+theme+" Search flyout clears its query when dismissed and reopened",async({page})=>{
    await guest(page,theme);
    const start=await openStart(page);
    await start.locator('[data-test-start-search-button]').click();
    const flyout=start.locator('[data-test-win8-start-flyout]');
    const input=flyout.getByRole("searchbox",{name:"Search programs and files"});
    await input.fill("notepad");
    await expect(flyout.locator('[data-test-win8-start-result="notepad"]')).toBeVisible();
    await input.press("Escape");
    await expect(flyout).toHaveCount(0);
    await expect(start).toBeVisible();
    await start.locator('[data-test-start-search-button]').click();
    await expect(input).toHaveValue("");
    await expect(flyout).toBeVisible();
    // Pinned source openSearch() only opens the pane; repeated opening
    // cannot toggle it closed while an active search is in progress.
    await start.locator('[data-test-start-search-button]').evaluate(button=>
      (button as HTMLButtonElement).click());
    await expect(flyout).toBeVisible();
  });

  test("source "+theme+" Search clickout returns to Start without closing it",async({page})=>{
    test.skip((page.viewportSize()?.width??0)<=520,
      "On a narrow phone, the source 420px/100% search pane covers Start; Escape is the visible dismissal.");
    await guest(page,theme);
    const start=await openStart(page);
    await start.locator('[data-test-start-search-button]').click();
    const flyout=start.locator('[data-test-win8-start-flyout]');
    await flyout.getByRole("searchbox",{name:"Search programs and files"}).fill("calc");
    await start.getByRole("heading",{name:"Start"}).click();
    await expect(flyout).toHaveCount(0);
    await expect(start).toBeVisible();
    await expect(start).toBeFocused();
    await start.locator('[data-test-start-search-button]').click();
    await expect(flyout.getByRole("searchbox",{name:"Search programs and files"}))
      .toHaveValue("");
  });
}


for(const theme of ["win8","win81"] as const){
  test("source "+theme+" separates installed program grids from app shortcut grids",async({page})=>{
    await guest(page,theme);
    const start=await openStart(page);
    const groups=start.locator('[data-test-win8-start-group-kind]');
    const kinds=await groups.evaluateAll(nodes=>nodes.map(node=>
      node.getAttribute("data-test-win8-start-group-kind")));
    expect(kinds[0]).toBe("programs");
    expect(kinds.at(-1)).toBe("apps");
    expect(kinds.indexOf("apps")).toBeGreaterThan(0);
    expect(kinds.slice(kinds.indexOf("apps")).every(kind=>kind==="apps")).toBe(true);
    const counts=await groups.evaluateAll(nodes=>nodes.map(node=>
      node.querySelectorAll('[data-test-program]').length));
    expect(counts.every(count=>count>0&&count<=6)).toBe(true);
    await expect(start.locator('[data-test-program="notepad"]').locator("xpath=.."))
      .toHaveAttribute("data-test-win8-start-group-kind","programs");
    const external=start.locator('[data-test-program="web_contacts"]');
    await expect(external.locator("xpath=.."))
      .toHaveAttribute("data-test-win8-start-group-kind","apps");
    // Original Win8 appItems have click only; programItems additionally
    // offer the shared program context menu on right-click.
    await external.click({button:"right"});
    await expect(page.locator('[data-test-start-program-context="web_contacts"]'))
      .toHaveCount(0);
    await start.locator('[data-test-program="notepad"]').click({button:"right"});
    await expect(page.locator('[data-test-start-program-context="notepad"]'))
      .toBeVisible();
  });
}


test("source Win8 tile grids scroll horizontally from vertical and horizontal wheel deltas",async({page})=>{
  // A deliberately narrow viewport guarantees source's scrollable tile grid,
  // independent of whether this run uses desktop or mobile Chromium.
  await page.setViewportSize({width:700,height:720});
  await guest(page,"win8");
  const start=await openStart(page);
  const grid=start.locator('[data-test-win8-start-groups]');
  const available=await grid.evaluate(el=>el.scrollWidth-el.clientWidth);
  expect(available).toBeGreaterThan(240);
  const bounds=await grid.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds!.x+70,bounds!.y+70);
  await page.mouse.wheel(0,160);
  await expect.poll(()=>grid.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  const afterVertical=await grid.evaluate(el=>el.scrollLeft);
  await page.mouse.wheel(110,0);
  await expect.poll(()=>grid.evaluate(el=>el.scrollLeft)).toBeGreaterThan(afterVertical);
  await expect(start).toBeVisible();
});


for(const theme of ["win8","win81"] as const){
  test("source "+theme+" Search keyboard navigation selects and launches results",async({page})=>{
    await guest(page,theme);
    const start=await openStart(page);
    await start.locator('[data-test-start-search-button]').click();
    const flyout=start.locator('[data-test-win8-start-flyout]');
    const input=flyout.getByRole("searchbox",{name:"Search programs and files"});
    const all=flyout.locator('[data-test-win8-start-result]');
    const selected=flyout.locator('[data-test-win8-start-result-selected]');
    await input.fill("e");
    expect(await all.count()).toBeGreaterThan(1);
    await expect(selected).toHaveCount(0);
    await input.press("ArrowDown");
    await expect(selected).toHaveCount(1);
    await expect(all.first()).toHaveAttribute("data-test-win8-start-result-selected","");
    await input.press("ArrowDown");
    await expect(all.nth(1)).toHaveAttribute("data-test-win8-start-result-selected","");
    await input.press("ArrowUp");
    await expect(all.first()).toHaveAttribute("data-test-win8-start-result-selected","");
    await input.press("ArrowUp");
    await expect(all.last()).toHaveAttribute("data-test-win8-start-result-selected","");
    // Changing the search query resets selection rather than opening a
    // stale index from the previous result list.
    await input.fill("notepad");
    await expect(selected).toHaveCount(0);
    await input.press("ArrowDown");
    await expect(flyout.locator('[data-test-win8-start-result="notepad"]'))
      .toHaveAttribute("data-test-win8-start-result-selected","");
    await input.press("Enter");
    await expect(page.locator('[data-test-window="notepad"]')).toBeVisible();
    await expect(start).toHaveCount(0);
  });
}


for(const theme of ["win8","win81"] as const){
  test("source "+theme+" Search includes live Guest desktop files and opens supported documents",async({page})=>{
    await guest(page,theme);
    // Seed via the actual source Desktop upload action, not a test-only
    // filesystem injection or host path. Search must traverse drive0.
    const desktop=page.locator("#desktop-icons");
    await desktop.click({button:"right",position:{x:260,y:200}});
    const menu=desktop.locator('[data-test-desktop-menu]');
    await expect(menu).toBeVisible();
    await menu.locator('[data-test-desktop-upload-here]').click();
    await page.locator('[data-test-desktop-upload-input]').setInputFiles({
      name:"Win8 Start Scan Target.txt",mimeType:"text/plain",
      buffer:Buffer.from("Start search opened the real Guest document")
    });
    const path="/EXTERNAL/computer/drive0/Users/Guest/Desktop/Win8 Start Scan Target.txt";
    await expect(page.locator('[data-test-desktop-file="'+path+'"]')).toBeVisible();
    const start=await openStart(page);
    await start.locator('[data-test-start-search-button]').click();
    const flyout=start.locator('[data-test-win8-start-flyout]');
    const input=flyout.getByRole("searchbox",{name:"Search programs and files"});
    await input.fill("Start Scan Target");
    const file=flyout.locator('[data-test-win8-start-file-result="'+path+'"]');
    await expect(flyout.getByRole("heading",{name:"Files and folders"})).toBeVisible();
    await expect(file).toBeVisible();
    await expect(file).toContainText("Win8 Start Scan Target.txt");
    // Keyboard navigation now traverses Guest file results as well as apps.
    await input.press("ArrowDown");
    await expect(file).toHaveAttribute("data-test-win8-start-result-selected","");
    await input.press("Enter");
    await expect(page.locator('[data-test-window="notepad"] .cm-content'))
      .toContainText("Start search opened the real Guest document");
    await expect(start).toHaveCount(0);
  });
}
