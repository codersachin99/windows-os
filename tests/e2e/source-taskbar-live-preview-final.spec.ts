import {expect,test,type Page} from "@playwright/test";

/** Pinned final legacy-win7 source taskbar-base.js:
 * showStackedIcons=true, showPeekPreviews=true, 200ms open/450ms close.
 * This is NOT Show desktop Aero Peek in Taskbar Properties.
 */
async function guest(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
}
async function openComputers(page:Page,count:number){
  const icon=page.locator('[data-test-desktop-icon="computer"]');
  for(let i=0;i<count;i++){
    await icon.dblclick();
    await expect(page.locator('[data-test-window="computer"]')).toHaveCount(i+1);
  }
}
test("final source stacks Computer instances into one running taskbar button",async({page})=>{
  await guest(page);
  await openComputers(page,2);
  const group=page.locator('[data-test-taskbar-running-group="computer"]');
  await expect(group).toHaveCount(1);
  await expect(group).toHaveAttribute("data-test-taskbar-group-size","2");
  await expect(group).toHaveClass(/is-stacked/);
  expect(await group.evaluate(node=>getComputedStyle(node,"::after").width)).toBe("3px");
  expect(await group.evaluate(node=>getComputedStyle(node,"::after").right)).toBe("-3px");
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(2);
  await group.click();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(0);
  await group.click();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(2);
  await expect(group).toHaveCount(1);
});
test("final source taskbar hover shows safe scaled thumbnails, peeks and switches",async({page})=>{
  await guest(page);
  await openComputers(page,2);
  const group=page.locator('[data-test-taskbar-running-group="computer"]');
  const touch=await page.evaluate(()=>window.matchMedia("(hover: none)").matches);
  if(touch){
    await expect(page.locator("[data-test-taskbar-preview-group]")).toHaveCount(0);
    return;
  }
  await group.hover();
  const preview=page.locator('[data-test-taskbar-preview-group="computer"]');
  await expect(preview).toBeVisible({timeout:3500});
  const cards=preview.locator('[data-test-taskbar-preview-window]');
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toHaveCSS("width","220px");
  await expect(cards.first()).toHaveCSS("border-radius","6px");
  await expect(cards.first()).toHaveCSS("backdrop-filter","blur(12px) saturate(1.8)");
  await expect(cards.first().locator(".windows-taskbar__preview-titlebar")).toHaveCSS("height","22px");
  await expect(cards.first().locator(".windows-taskbar__preview-body")).toHaveCSS("height","125px");
  await expect(cards.first().locator("[data-test-taskbar-preview-close]")).toHaveCSS("width","20px");
  await expect(preview).toHaveCSS("column-gap","8px");
  await expect(preview.locator(".is-preview-clone")).toHaveCount(2);
  await expect(preview.locator(".is-preview-clone[inert]")).toHaveCount(2);
  const cloneControls=preview.locator(".is-preview-clone button");
  expect(await cloneControls.count()).toBeGreaterThan(0);
  // A visual clone must not receive focus, even via a direct focus attempt.
  expect(await cloneControls.first().evaluate(node=>{
    (node as HTMLButtonElement).focus();
    return document.activeElement===node;
  })).toBe(false);
  const target=await cards.first().getAttribute("data-test-taskbar-preview-window");
  expect(target).not.toBeNull();
  // DOM clones must never duplicate running Guest window selectors or
  // accessible dialogs: Playwright and real window actions target one node.
  await expect(page.locator('[data-test-window-id="'+target+'"]')).toHaveCount(1);
  await cards.first().hover();
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveAttribute("data-source-taskbar-peeking","true");
  await expect(page.locator('[data-test-window-id="'+target+'"]'))
    .toHaveAttribute("data-source-taskbar-peek-active","true");
  await preview.locator('[data-test-taskbar-preview-activate="'+target+'"]').click();
  await expect(preview).toHaveCount(0);
  await expect(page.locator('[data-test-main-screen]'))
    .not.toHaveAttribute("data-source-taskbar-peeking","true");
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(2);
});
test("final source thumbnail closes one instance without closing the group",async({page})=>{
  await guest(page);
  await openComputers(page,2);
  const group=page.locator('[data-test-taskbar-running-group="computer"]');
  if(await page.evaluate(()=>matchMedia("(hover: none)").matches))return;
  await group.hover();
  const preview=page.locator('[data-test-taskbar-preview-group="computer"]');
  await expect(preview).toBeVisible({timeout:3500});
  await preview.locator("[data-test-taskbar-preview-close]").first().click();
  await expect(preview).toHaveCount(0);
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(1);
  await expect(group).toHaveAttribute("data-test-taskbar-group-size","1");
});

test("singleton running label retains unsaved window title; grouped label is program name",async({page})=>{
  await guest(page);
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-program="notepad"]').click();
  const win=page.locator('[data-test-window="notepad"]');
  await expect(win).toBeVisible();
  await win.locator(".cm-content").fill("Unsaved draft");
  await expect(win.locator(".windows-window__title"))
    .toHaveText("*Untitled - Notepad");
  const group=page.locator('[data-test-taskbar-running-group="notepad"]');
  await expect(group).toHaveAttribute("data-test-taskbar-group-size","1");
  await expect(group).toHaveAttribute("aria-label","Switch to *Untitled - Notepad");
  await win.getByRole("button",{name:/^Minimize /}).click();
  await group.click();
  await expect(win).toBeVisible();
  await expect(win.locator(".cm-content")).toContainText("Unsaved draft");
  await win.getByRole("button",{name:/^Close /}).click();
  const prompt=win.getByRole("alertdialog",{name:"Save changes"});
  await prompt.getByRole("button",{name:"No"}).click();
});

// Right-clicking a running pin cancels both already-visible and scheduled
// thumbnail popups, so the real program menu owns keyboard focus.
test("source taskbar context takes precedence over a running pin preview",async({page})=>{
  await guest(page);
  if(await page.evaluate(()=>matchMedia("(hover: none)").matches))return;
  const desktop=page.locator('[data-test-desktop-icon="computer"]');
  await desktop.click({button:"right"});
  await page.locator('[data-test-desktop-item-action="pin"]').click();
  const pin=page.locator('[data-test-taskbar-pin="computer"]');
  await pin.click();
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  await page.mouse.move(200,100);
  await pin.hover();
  const preview=page.locator('[data-test-taskbar-preview-group="computer"]');
  await expect(preview).toBeVisible({timeout:3500});
  await pin.click({button:"right"});
  const menu=page.locator('[data-test-taskbar-context="item"]');
  await expect(menu).toBeVisible();
  await expect(preview).toHaveCount(0);
  await expect(menu.locator('[data-test-taskbar-context-action="pin"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await page.mouse.move(200,100);
  await pin.click({button:"right"});
  await expect(menu).toBeVisible();
  // Wait past the source 200ms show delay to catch an uncancelled timer.
  await page.waitForTimeout(250);
  await expect(preview).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(pin).toBeFocused();
});
