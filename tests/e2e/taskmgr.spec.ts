import {expect,test,type Page} from "@playwright/test";

async function login(page:Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function startApp(page:Page,id:string) {
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-start-menu] [data-test-program="'+id+'"]').click();
  const win=page.locator('[data-test-window="'+id+'"]').last();
  await expect(win).toBeVisible();
  return win;
}
async function runCommand(page:Page,command:string) {
  const run=await startApp(page,"run");
  await run.getByRole("textbox",{name:"Open:"}).fill(command);
  await run.getByRole("button",{name:"OK"}).click();
  await expect(run).toHaveCount(0);
}
async function openTaskManager(page:Page) {
  await runCommand(page,"taskmgr.exe");
  const manager=page.locator('[data-test-window="taskmgr"]');
  await expect(manager).toBeVisible();
  return manager;
}
test("Task Manager original icon, 450px height, Minimize without Maximize, 3 tabs and Services None",async({page})=>{
  await login(page);
  const win=await openTaskManager(page);
  const rect=await win.boundingBox();
  if(!rect)throw Error("Task Manager not positioned");
  expect(Math.round(rect.height)).toBe(450);
  expect(rect.width).toBeGreaterThanOrEqual(270);
  expect(rect.width).toBeLessThanOrEqual(560);
  await expect(win.locator(".windows-window__titlebar img"))
    .toHaveAttribute("src",/taskmgr\.af82f08f\.webp/);
  await expect(win.getByRole("button",{name:"Minimize Task Manager"})).toBeVisible();
  await expect(win.getByRole("button",{name:"Maximize Task Manager"})).toHaveCount(0);
  await expect(win.getByRole("tab",{name:"Applications"})).toHaveAttribute("aria-selected","true");
  await expect(win.getByRole("tab",{name:"Processes"})).toBeVisible();
  await expect(win.getByRole("tab",{name:"Services"})).toBeVisible();
  await expect(win.locator('[data-test-taskmgr-app="taskmgr"]')).toHaveCount(1);
  await expect(win.getByRole("button",{name:"End Task"})).toBeDisabled();
  await win.getByRole("tab",{name:"Services"}).click();
  await expect(win.getByRole("tabpanel",{name:"Services"})).toContainText("None");
  await expect(win.getByRole("button",{name:"Services..."})).toBeDisabled();
  await win.getByRole("button",{name:"Close Task Manager"}).click();
  await expect(win).toHaveCount(0);
});
test("Applications End Task closes only selected Calculator window and retains Task Manager",async({page})=>{
  await login(page);
  const calc=await startApp(page,"calc");
  const manager=await openTaskManager(page);
  const row=manager.locator('[data-test-taskmgr-app="calc"]');
  await expect(row).toContainText("Calculator");
  await expect(row).toContainText("Running");
  await row.getByRole("button",{name:"Select Calculator"}).click();
  await expect(manager.getByRole("button",{name:"End Task"})).toBeEnabled();
  await manager.getByRole("button",{name:"End Task"}).click();
  await expect(calc).toHaveCount(0);
  await expect(manager).toBeVisible();
  await expect(row).toHaveCount(0);
  await expect(manager.getByRole("button",{name:"End Task"})).toBeDisabled();
});
test("End Task honors Notepad unsaved confirmation instead of forcing data loss",async({page})=>{
  await login(page);
  const note=await startApp(page,"notepad");
  await note.locator(".cm-content").fill("Do not silently discard my work");
  await expect(note.locator(".windows-window__title")).toContainText("*Untitled");
  const manager=await openTaskManager(page);
  await manager.locator('[data-test-taskmgr-app="notepad"]')
    .getByRole("button",{name:"Select Notepad"}).click();
  await manager.getByRole("button",{name:"End Task"}).click();
  const confirm=note.getByRole("alertdialog",{name:"Save changes"});
  await expect(confirm).toBeVisible();
  await expect(note).toBeVisible();
  await manager.getByRole("button",{name:"Close Task Manager"}).click();
  await confirm.getByRole("button",{name:"Cancel"}).click();
  await expect(note.locator(".cm-content")).toContainText("Do not silently discard my work");
});
test("Processes mirrors c170 visible programs and can start/end Calculator, not unported Paint",async({page})=>{
  await login(page);
  const manager=await openTaskManager(page);
  await manager.getByRole("tab",{name:"Processes"}).click();
  const row=manager.locator('[data-test-taskmgr-process="calc"]');
  await expect(row).toContainText("calc.exe");
  await expect(row).toContainText("Guest");
  await expect(row).toContainText("Stopped");
  await expect(row).toContainText("0 MB");
  await expect(manager.locator('[data-test-taskmgr-process="taskmgr"]')).toHaveCount(0);
  await expect(manager.locator('[data-test-taskmgr-process="computer"]')).toHaveCount(0);
  await row.getByRole("button",{name:"Select calc.exe"}).click();
  await expect(manager.getByRole("button",{name:"Start Process"})).toBeEnabled();
  await expect(manager.getByRole("button",{name:"End Process"})).toBeDisabled();
  await manager.getByRole("button",{name:"Start Process"}).click();
  const calc=page.locator('[data-test-window="calc"]');
  await expect(calc).toBeVisible();
  await manager.locator(".windows-window__titlebar").click({position:{x:60,y:10}});
  await expect(row).toContainText("Running");
  await expect(manager.getByRole("button",{name:"Start Process"})).toBeDisabled();
  await expect(manager.getByRole("button",{name:"End Process"})).toBeEnabled();
  await manager.getByRole("button",{name:"End Process"}).click();
  await expect(calc).toHaveCount(0);
  await expect(row).toContainText("Stopped");
  await manager.locator('[data-test-taskmgr-process="paint"]')
    .getByRole("button",{name:"Select paint.exe"}).click();
  await expect(manager.locator('[data-test-taskmgr-pending]'))
    .toContainText("not yet migrated");
  await expect(manager.getByRole("button",{name:"Start Process"})).toBeDisabled();
  await expect(manager.getByRole("button",{name:"End Process"})).toBeDisabled();
  await expect(page.locator('[data-test-window="paint"]')).toHaveCount(0);
});
test("Task Manager source C-drive taskmgr.exe relaunch restores a single minimized window",async({page})=>{
  await login(page);
  const manager=await openTaskManager(page);
  await manager.getByRole("button",{name:"Minimize Task Manager"}).click();
  await expect(page.locator('[data-test-window="taskmgr"]')).toHaveCount(0);
  await runCommand(page,"C:\\Windows\\System32\\taskmgr.exe");
  await expect(page.locator('[data-test-window="taskmgr"]')).toHaveCount(1);
  await expect(page.getByRole("button",{name:"Switch to Task Manager"})).toHaveCount(1);
});
