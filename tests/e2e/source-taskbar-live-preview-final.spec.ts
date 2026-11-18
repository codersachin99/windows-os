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
  await expect(preview.locator(".is-preview-clone")).toHaveCount(2);
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
