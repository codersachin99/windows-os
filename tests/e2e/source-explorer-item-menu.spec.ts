import {readFile} from "node:fs/promises";
import {expect,test,type Page} from "@playwright/test";

async function guestComputer(page:Page,theme:"win7"|"win11"="win7"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]');
  await expect(computer).toBeVisible();
  return computer;
}
test("pinned ExplorerItemMenu ordinary text file order and original Send to structure",async({page})=>{
  const computer=await guestComputer(page);
  // Only the mounted source /EXTERNAL/computer disk has a path-backed .lnk
  // adapter. The virtual Computer root '/' is not a real guest disk path.
  await computer.locator(".explorer-navigation__home")
    .filter({hasText:"Documents"}).click();
  await computer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Source Menu File.txt",mimeType:"text/plain",
      buffer:Buffer.from("source text file")});
  const item=computer.locator('[data-test-explorer-item="Source Menu File.txt"]');
  await expect(item).toBeVisible();
  await item.click({button:"right"});
  const menu=computer.locator('[data-test-explorer-context="item"]');
  await expect(menu).toBeVisible();
  await expect(menu.locator(':scope > button[role="menuitem"]')).toHaveText([
    "Open","Send to ▸","Download","Cut","Copy","Delete","Rename","Properties"
  ]);
  await expect(menu.locator('[data-test-explorer-item-action="download"]'))
    .toBeEnabled();
  await expect(menu.locator('[data-test-explorer-item-action="properties"]'))
    .toBeDisabled();
  await menu.locator('[data-test-explorer-item-send-to]').click();
  await expect(menu.locator('[data-test-explorer-item-send-to-kind]')).toHaveText([
    "Compressed (zipped) folder","Desktop (create shortcut)"
  ]);
  await expect(menu.locator('[data-test-explorer-item-send-to-kind="compress"]'))
    .toBeEnabled();
  await expect(menu.locator('[data-test-explorer-item-send-to-kind="desktop"]'))
    .toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
});
test("source Computer Download delivers actual Guest bytes without a host path",async({page})=>{
  const computer=await guestComputer(page,"win11");
  const content="Download source bytes \u0000 survived";
  await computer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Real Download.bin",mimeType:"application/octet-stream",
      buffer:Buffer.from(content)});
  const item=computer.locator('[data-test-explorer-item="Real Download.bin"]');
  await expect(item).toBeVisible();
  await item.click({button:"right"});
  const menu=computer.locator('[data-test-explorer-context="item"]');
  const downloadEvent=page.waitForEvent("download");
  await menu.locator('[data-test-explorer-item-action="download"]').click();
  const download=await downloadEvent;
  expect(download.suggestedFilename()).toBe("Real Download.bin");
  expect(await readFile(await download.path())).toEqual(Buffer.from(content));
  await expect(menu).toHaveCount(0);
  await expect(item).toBeVisible();
});
test("source ExplorerItemMenu multi-select hides Open and Rename and copies both",async({page})=>{
  const computer=await guestComputer(page);
  await computer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles([
      {name:"Multi One.txt",mimeType:"text/plain",buffer:Buffer.from("1")},
      {name:"Multi Two.txt",mimeType:"text/plain",buffer:Buffer.from("2")}
    ]);
  const first=computer.locator('[data-test-explorer-item="Multi One.txt"]');
  const second=computer.locator('[data-test-explorer-item="Multi Two.txt"]');
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
  await first.click();
  await second.click({modifiers:["Control"]});
  await first.click({button:"right"});
  const menu=computer.locator('[data-test-explorer-context="item"]');
  await expect(menu.locator(':scope > button[role="menuitem"]')).toHaveText([
    "Send to ▸","Download","Cut","Copy","Delete","Properties"
  ]);
  await menu.locator('[data-test-explorer-item-action="copy"]').click();
  await expect(computer.getByText("copy 2",{exact:false})).toBeVisible();
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
});
test("source ExplorerItemMenu keeps directory download hidden and Bin actions untouched",async({page})=>{
  const computer=await guestComputer(page);
  await computer.getByRole("button",{name:"New folder"}).click();
  const dialog=computer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"}).fill("Source Menu Folder");
  await dialog.getByRole("button",{name:"OK"}).click();
  const folder=computer.locator('[data-test-explorer-item="Source Menu Folder"]');
  await folder.click({button:"right"});
  const menu=computer.locator('[data-test-explorer-context="item"]');
  await expect(menu.locator('[data-test-explorer-item-action="download"]'))
    .toHaveCount(0);
  await expect(menu.locator('[data-test-explorer-item-action="send-to"]'))
    .toBeEnabled();
  await expect(menu.locator('[data-test-explorer-item-action="rename"]'))
    .toBeEnabled();
});

test("source Send to popup opens beside the item menu, stays visible and keeps parent geometry",async({page})=>{
  const computer=await guestComputer(page);
  await computer.locator(".explorer-navigation__home")
    .filter({hasText:"Documents"}).click();
  await computer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Side Menu.txt",mimeType:"text/plain",
      buffer:Buffer.from("submenu placement")});
  await computer.locator('[data-test-explorer-item="Side Menu.txt"]')
    .click({button:"right"});
  const menu=computer.locator('[data-test-explorer-context="item"]');
  const before=await menu.boundingBox();
  expect(before).not.toBeNull();
  const trigger=menu.locator("[data-test-explorer-item-send-to]");
  await trigger.focus();
  await trigger.press("ArrowRight");
  const submenu=menu.locator("[data-test-explorer-sendto-submenu]");
  await expect(submenu).toBeVisible();
  await expect(submenu).toHaveAttribute("data-side",/^(left|right)$/);
  const after=await menu.boundingBox();
  expect(after).not.toBeNull();
  expect(Math.abs(after!.height-before!.height)).toBeLessThan(2);
  const child=await submenu.boundingBox();
  expect(child).not.toBeNull();
  const viewport=page.viewportSize()!;
  expect(child!.x).toBeGreaterThanOrEqual(0);
  expect(child!.x+child!.width).toBeLessThanOrEqual(viewport.width+1);
  expect(child!.y).toBeGreaterThanOrEqual(0);
  expect(child!.y+child!.height).toBeLessThanOrEqual(viewport.height+1);
  if(await submenu.getAttribute("data-side")==="right")
    expect(child!.x).toBeGreaterThanOrEqual(after!.x-1);
  else expect(child!.x).toBeLessThanOrEqual(after!.x+after!.width);
  const desktop=submenu.locator(
    '[data-test-explorer-item-send-to-kind="desktop"]');
  await expect(desktop).toBeFocused();
  await desktop.press("ArrowLeft");
  await expect(submenu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.press("ArrowRight");
  await expect(submenu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
});
