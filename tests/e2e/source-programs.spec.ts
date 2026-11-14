import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
});

test("All Programs is populated from original installed .lnk shortcuts", async ({ page }) => {
  await page.getByRole("button", { name: "Open Start menu" }).click();
  const start = page.locator('[data-test-start-menu]');
  await start.locator('[data-test-all-programs]').click();
  await expect(start.locator('[data-test-source-program-folder="Accessories"]')).toBeVisible();
  await expect(start.locator('[data-test-source-program-folder="Games"]')).toBeVisible();
  await expect(start.locator('[data-test-source-program="chrome"]')).toBeEnabled();
  await start.locator('[data-test-source-program-folder="Accessories"]').click();
  await expect(start.locator('[data-test-source-program="notepad"]')).toBeEnabled();
  await expect(start.locator('[data-test-source-program="calc"]')).toBeEnabled();
  await expect(start.locator('[data-test-source-program="cmd"]')).toBeEnabled();
  await start.locator('[data-test-source-program="notepad"]').click();
  await expect(page.locator('[data-test-window="notepad"] .cm-content')).toBeVisible();
});

test("Explorer opens migrated CMD/Notepad shortcuts and rejects genuinely nonported WordPad", async ({ page }) => {
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]');
  await explorer.getByRole("button", { name: "Programs" }).click();
  await explorer.locator('[data-test-explorer-item="Accessories"]').dblclick();
  await expect(explorer.locator('[data-test-explorer-item="Notepad.lnk"]')).toBeVisible();

  await explorer.locator('[data-test-explorer-item="Command Prompt.lnk"]').dblclick();
  const cmd=page.locator('[data-test-window="cmd"]');
  const cmdInput=cmd.locator('[data-test-cmd-input]');
  await expect(cmdInput).toBeVisible();
  // A newly opened source window sits above Explorer; close it before
  // clicking an icon in the covered Explorer list.
  await cmdInput.fill("exit");
  await cmdInput.press("Enter");
  await expect(cmd).toHaveCount(0);
  await explorer.locator('[data-test-explorer-item="WordPad.lnk"]').dblclick();
  await expect(explorer.getByRole("alert")).toContainText("WordPad application has not been migrated yet");
  await expect(page.locator('[data-test-window="wordpad"]')).toHaveCount(0);

  await explorer.locator('[data-test-explorer-item="Notepad.lnk"]').dblclick();
  await expect(page.locator('[data-test-window="notepad"] .cm-content')).toBeVisible();
});

test("original MZ binary and shortcut contents persist through Guest reload", async ({ page }) => {
  const initial = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem("windows-os:vfs:guest:v1") || "{}") as {
      entries: { uri: string; bytes?: string; content?: string }[];
    };
    const executable = data.entries?.find(x =>
      x.uri === "/EXTERNAL/computer/drive0/Windows/System32/notepad.exe");
    const shortcut = data.entries?.find(x =>
      x.uri.endsWith("/Start Menu/Programs/Accessories/Notepad.lnk"));
    return {
      executableBytes: executable?.bytes ?? null,
      shortcut: shortcut?.content ?? null
    };
  });
  expect(initial.shortcut).toBe('{"exe":"notepad","icon":"notepad"}');
  expect(initial.executableBytes).not.toBeNull();
  const fileLength = await page.evaluate(data => atob(data!).length, initial.executableBytes);
  expect(fileLength).toBe(1024);
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  const afterward = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem("windows-os:vfs:guest:v1") || "{}") as {
      entries: { uri: string; bytes?: string; content?: string }[];
    };
    return {
      exe: data.entries?.find(x =>
        x.uri === "/EXTERNAL/computer/drive0/Windows/System32/notepad.exe")?.bytes,
      lnk: data.entries?.find(x =>
        x.uri.endsWith("/Start Menu/Programs/Accessories/Notepad.lnk"))?.content
    };
  });
  expect(afterward).toEqual({
    exe: initial.executableBytes,
    lnk: initial.shortcut
  });
});

test("All Programs source .lnk JSON icon overrides executable artwork with binary Guest imports",async({page})=>{
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  await explorer.getByRole("button",{name:"Programs"}).click();
  await explorer.locator('[data-test-explorer-item="Accessories"]').dblclick();
  await explorer.locator('input[aria-label="Upload files"]').setInputFiles({
    name:"Customized Notepad.lnk",mimeType:"application/octet-stream",
    buffer:Buffer.from('{"exe":"notepad","icon":"calc"}')
  });
  await expect(explorer.locator('[data-test-explorer-item="Customized Notepad.lnk"]'))
    .toBeVisible();
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const start=page.locator('[data-test-start-menu]');
  await start.locator('[data-test-all-programs]').click();
  await start.locator('[data-test-source-program-folder="Accessories"]').click();
  const link=start.locator('[data-source-shortcut-path$="/Customized Notepad.lnk"]');
  await expect(link).toHaveAttribute("data-source-program-icon-key","calc");
  await expect(link).toHaveAttribute("data-source-program-artwork","original");
  await expect(link.locator("img")).toHaveAttribute("src",/\/calc\.1733a9a0\.webp$/);
  await link.click();
  await expect(page.locator('[data-test-window="notepad"] .cm-content')).toBeVisible();
});

test("original Command Prompt first source shell slice uses live Guest directory",async({page})=>{
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const start=page.locator('[data-test-start-menu]');
  await start.locator('[data-test-all-programs]').click();
  await start.locator('[data-test-source-program-folder="Accessories"]').click();
  await start.locator('[data-test-source-program="cmd"]').click();
  const window=page.locator('[data-test-window="cmd"]');
  await expect(window.locator('[data-test-cmd-container]')).toContainText(
    "Microsoft Windows [Version 6.1.7600]");
  const input=window.locator('[data-test-cmd-input]');
  await expect(window.locator(".cmd__prompt")).toHaveText("C:\\Users\\Guest>");
  await input.fill("echo Hello Guest");
  await input.press("Enter");
  await expect(window.locator('[data-test-cmd-output]').last()).toHaveText("Hello Guest");
  await input.fill("dir /b");
  await input.press("Enter");
  await expect(window.locator('[data-test-cmd-output]').last()).toContainText("Documents");
  await input.fill("cd Documents");
  await input.press("Enter");
  await expect(window.locator(".cmd__prompt")).toHaveText("C:\\Users\\Guest\\Documents>");
  await input.fill("title My CMD Session");
  await input.press("Enter");
  await expect(window.locator(".windows-window__title")).toHaveText("My CMD Session");
  await input.fill("cls");
  await input.press("Enter");
  await expect(window.locator('[data-test-cmd-entry]')).toHaveCount(0);
  await expect(window.locator(".cmd__banner")).toHaveCount(0);
  await input.fill("md SourceCmdProjects");
  await input.press("Enter");
  await input.fill("dir /b");
  await input.press("Enter");
  await expect(window.locator('[data-test-cmd-output]').last()).toContainText("SourceCmdProjects");
  await input.fill("pushd SourceCmdProjects");
  await input.press("Enter");
  await expect(window.locator(".cmd__prompt")).toHaveText(
    "C:\\Users\\Guest\\Documents\\SourceCmdProjects>");
  await input.fill("popd");
  await input.press("Enter");
  await expect(window.locator(".cmd__prompt")).toHaveText("C:\\Users\\Guest\\Documents>");
  await input.fill("md RemoveMe");
  await input.press("Enter");
  await input.fill("ren RemoveMe RenamedMe");
  await input.press("Enter");
  await input.fill("dir /b");
  await input.press("Enter");
  await expect(window.locator('[data-test-cmd-output]').last()).toContainText("RenamedMe");
  await input.fill("rd RenamedMe");
  await input.press("Enter");
  await input.fill("dir /b");
  await input.press("Enter");
  await expect(window.locator('[data-test-cmd-output]').last()).not.toContainText("RenamedMe");
  await input.fill("exit");
  await input.press("Enter");
  await expect(page.locator('[data-test-window="cmd"]')).toHaveCount(0);
});
