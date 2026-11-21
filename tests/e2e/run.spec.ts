import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function openRun(page:Page) {
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const menu=page.locator('[data-test-start-menu]');
  await menu.locator('[data-test-program="run"]').click();
  const win=page.locator('[data-test-window="run"]').last();
  await expect(win).toBeVisible();
  return win;
}

test("source Run launches at bottom left, is 450x220/non-resizable and uses pinned icon",async({page})=>{
  await login(page);
  const win=await openRun(page);
  const viewport=page.viewportSize();
  if(!viewport)throw Error("Missing viewport");
  const rect=await win.boundingBox();
  if(!rect)throw Error("Run window not positioned");
  expect(Math.round(rect.x)).toBe(0);
  expect(Math.round(rect.width)).toBe(Math.min(450,viewport.width));
  expect(Math.round(rect.height)).toBe(Math.min(220,viewport.height-40));
  expect(Math.round(rect.y+rect.height)).toBe(viewport.height-40);
  await expect(win.getByRole("button",{name:"Maximize Run"})).toHaveCount(0);
  await expect(win.getByRole("button",{name:"Minimize Run"})).toHaveCount(0);
  await expect(win.locator('.windows-window__titlebar img'))
    .toHaveAttribute("src",/run\.cf7c0332\.webp/);
  await expect(win.getByRole("textbox",{name:"Open:"})).toBeFocused();
  await expect(win.getByRole("button",{name:"OK"})).toBeDisabled();
  await win.getByRole("button",{name:"Cancel"}).click();
  await expect(win).toHaveCount(0);
});

test("source alias CALCULATOR opens a migrated app and closes the Run dialog",async({page})=>{
  await login(page);
  const win=await openRun(page);
  const input=win.getByRole("textbox",{name:"Open:"});
  await input.fill("CALCULATOR");
  await input.press("Enter");
  await expect(win).toHaveCount(0);
  await expect(page.locator('[data-test-window="calc"]')).toBeVisible();
});

test("exact installed C: executable path opens Notepad without accessing host files",async({page})=>{
  await login(page);
  const win=await openRun(page);
  await win.getByRole("textbox",{name:"Open:"})
    .fill("C:\\Windows\\System32\\notepad.exe");
  await win.getByRole("button",{name:"OK"}).click();
  await expect(win).toHaveCount(0);
  await expect(page.locator('[data-test-window="notepad"]')).toBeVisible();
});

test("unrecognized command gives a source-style retryable error with no host process",async({page})=>{
  await login(page);
  const win=await openRun(page);
  const input=win.getByRole("textbox",{name:"Open:"});
  await input.fill("powershell -EncodedCommand TEST");
  await input.press("Enter");
  const error=win.getByRole("alertdialog",{name:"Run error"});
  await expect(error).toContainText("Windows cannot find");
  await expect(error).toContainText("powershell -EncodedCommand TEST");
  await expect(page.locator('[data-test-window="powershell"]')).toHaveCount(0);
  await error.getByRole("button",{name:"OK"}).click();
  await expect(error).toHaveCount(0);
  await expect(input).toBeFocused();
  await input.fill("explorer");
  await input.press("Enter");
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  await expect(win).toHaveCount(0);
});

test("source program that has not been migrated does not falsely appear as a working app",async({page})=>{
  await login(page);
  const win=await openRun(page);
  await win.getByRole("textbox",{name:"Open:"}).fill("mspaint");
  await win.getByRole("button",{name:"OK"}).click();
  const error=win.getByRole("alertdialog",{name:"Run error"});
  await expect(error).toContainText("original Paint application has not been migrated yet");
  await expect(page.locator('[data-test-window="paint"]')).toHaveCount(0);
  await error.getByRole("button",{name:"OK"}).click();
  await win.getByRole("textbox",{name:"Open:"}).press("Escape");
  await expect(win).toHaveCount(0);
});

test("Windows+R keyboard shortcut opens source Run and Escape dismisses it",async({page})=>{
  await login(page);
  await page.keyboard.press("Meta+r");
  const win=page.locator('[data-test-window="run"]').last();
  await expect(win).toBeVisible();
  await expect(win.getByRole("textbox",{name:"Open:"})).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(win).toHaveCount(0);
});
