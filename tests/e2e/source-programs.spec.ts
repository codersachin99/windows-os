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
  await expect(start.locator('[data-test-source-program="cmd"]')).toBeDisabled();
  await start.locator('[data-test-source-program="notepad"]').click();
  await expect(page.locator('[data-test-window="notepad"] .cm-content')).toBeVisible();
});

test("Explorer opens original Notepad .lnk and keeps nonported programs nonexecuting", async ({ page }) => {
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]');
  await explorer.getByRole("button", { name: "Programs" }).click();
  await explorer.locator('[data-test-explorer-item="Accessories"]').dblclick();
  await expect(explorer.locator('[data-test-explorer-item="Notepad.lnk"]')).toBeVisible();

  await explorer.locator('[data-test-explorer-item="Command Prompt.lnk"]').dblclick();
  await expect(explorer.getByRole("alert")).toContainText("Command Prompt application has not been migrated yet");
  await expect(page.locator('[data-test-window="cmd"]')).toHaveCount(0);

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
