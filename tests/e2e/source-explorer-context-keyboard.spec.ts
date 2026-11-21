import {expect,test,type Locator,type Page} from "@playwright/test";

/**
 * Original source-locked legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * main.js ExplorerMenu/ExplorerItemMenu and Bin context actions.
 * The existing arrow helper must be reachable from a real right-click.
 */
async function explorer(page:Page,theme:string,app:"computer"|"bin"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="'+app+'"]').dblclick();
  const window=page.locator('[data-test-window="'+app+'"]');
  await expect(window).toBeVisible();
  return window;
}

async function rightClickBackground(window:Locator){
  const content=window.locator(".explorer-content");
  const bounds=await content.boundingBox();
  expect(bounds).not.toBeNull();
  await content.click({button:"right",position:{
    x:Math.max(10,bounds!.width-12),y:Math.max(10,bounds!.height-12)
  }});
  const context=window.locator('[data-test-explorer-context="background"]');
  await expect(context).toBeVisible();
  return {content,context};
}

for(const theme of ["win7","winxp","win8","win11dark"] as const){
  test("Computer background context keyboard focus and exact Escape return: "+theme,async({page})=>{
    const window=await explorer(page,theme,"computer");
    const {content,context}=await rightClickBackground(window);
    const view=context.locator("[data-test-explorer-context-view]");
    const refresh=context.getByRole("menuitem",{name:"Refresh",exact:true});
    await expect(view).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(refresh).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(view).toBeFocused();
    await page.keyboard.press("ArrowRight");
    const child=context.locator("[data-test-explorer-background-submenu]");
    const first=child.locator('[data-test-explorer-context-mode="extra-large-icons"]');
    await expect(first).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(child).toHaveCount(0);
    await expect(view).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(context).toHaveCount(0);
    await expect(content).toBeFocused();
    await expect(window).toBeVisible();
  });
}

for(const theme of ["win7","winxp"] as const){
  test("empty Bin background menu skips disabled Empty and Upload and returns focus: "+theme,async({page})=>{
    const window=await explorer(page,theme,"bin");
    const {content,context}=await rightClickBackground(window);
    const view=context.locator("[data-test-explorer-context-view]");
    const refresh=context.getByRole("menuitem",{name:"Refresh",exact:true});
    await expect(view).toBeFocused();
    await expect(context.getByRole("menuitem",{name:"Empty Recycle Bin"})).toBeDisabled();
    await expect(context.locator('[data-test-explorer-context-upload]')).toBeDisabled();
    await page.keyboard.press("ArrowDown");
    await expect(refresh).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(view).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(context).toHaveCount(0);
    await expect(content).toBeFocused();
  });
}

test("virtual Computer root never offers an unbacked Desktop shortcut",async({page})=>{
  const window=await explorer(page,"win7","computer");
  // Computer '/' can display a file, but it is a virtual shell root,
  // not a path under /EXTERNAL/computer. Creating a path shortcut here
  // must remain unavailable rather than emitting an unsafe host path.
  await window.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Virtual Root Guard.txt",mimeType:"text/plain",buffer:Buffer.from("root")
  });
  const item=window.locator('[data-test-explorer-item="Virtual Root Guard.txt"]');
  await expect(item).toBeVisible();
  await item.click({button:"right"});
  const menu=window.locator('[data-test-explorer-context="item"]');
  await expect(menu.locator('[data-test-explorer-item-action="open"]')).toBeFocused();
  const trigger=menu.locator('[data-test-explorer-item-send-to]');
  await trigger.focus();
  await trigger.press("ArrowRight");
  const child=menu.locator('[data-test-explorer-sendto-submenu]');
  await expect(child.locator('[data-test-explorer-item-send-to-kind="compress"]'))
    .toBeDisabled();
  await expect(child.locator('[data-test-explorer-item-send-to-kind="desktop"]'))
    .toBeDisabled();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(item).toBeFocused();
});

test("Computer file context focuses Open, opens Send to child, and Escape focuses exact row",async({page})=>{
  const window=await explorer(page,"win7","computer");
  // The source virtual Computer root is not a mounted disk folder.
  // A Send to Desktop path shortcut is supported from a live Guest
  // Documents path, just as source-explorer-item-menu.spec.ts verifies.
  await window.locator(".explorer-navigation__home")
    .filter({hasText:"Documents"}).click();
  await window.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Keyboard Context Note.txt",mimeType:"text/plain",
    buffer:Buffer.from("original guest explorer menu")
  });
  const item=window.locator('[data-test-explorer-item="Keyboard Context Note.txt"]');
  await expect(item).toBeVisible();
  await item.click({button:"right"});
  const context=window.locator('[data-test-explorer-context="item"]');
  const open=context.locator('[data-test-explorer-item-action="open"]');
  const send=context.locator('[data-test-explorer-item-send-to]');
  await expect(open).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(send).toBeFocused();
  await page.keyboard.press("ArrowRight");
  const child=context.locator('[data-test-explorer-sendto-submenu]');
  const desktop=child.locator('[data-test-explorer-item-send-to-kind="desktop"]');
  await expect(child.locator('[data-test-explorer-item-send-to-kind="compress"]'))
    .toBeEnabled();
  await expect(child.locator('[data-test-explorer-item-send-to-kind="compress"]'))
    .toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(desktop).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(child).toHaveCount(0);
  await expect(send).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(context).toHaveCount(0);
  await expect(item).toBeFocused();
  await expect(window).toBeVisible();
});

test("Recycle Bin item right-click navigation skips disabled Properties and restores row",async({page})=>{
  const computer=await explorer(page,"win7","computer");
  await computer.getByRole("button",{name:"New folder"}).click();
  const create=computer.getByRole("dialog",{name:"New folder"});
  await create.getByRole("textbox",{name:"New folder name"}).fill("Keyboard Bin Folder");
  await create.getByRole("button",{name:"OK"}).click();
  const folder=computer.locator('[data-test-explorer-item="Keyboard Bin Folder"]');
  await expect(folder).toBeVisible();
  await folder.click();
  await computer.getByRole("button",{name:"Delete",exact:true}).click();
  await computer.getByRole("alertdialog",{name:"Confirm file operation"})
    .getByRole("button",{name:"Yes"}).click();
  await expect(folder).toHaveCount(0);
  await computer.getByRole("button",{name:/^Close /}).click();
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]');
  const row=bin.locator('[data-test-explorer-item="Keyboard Bin Folder"]');
  await expect(row).toBeVisible();
  await row.click({button:"right"});
  const menu=bin.locator('[data-test-explorer-context="item"]');
  const restore=menu.getByRole("menuitem",{name:"Restore"});
  const del=menu.getByRole("menuitem",{name:"Delete"});
  await expect(menu.getByRole("menuitem",{name:"Properties"})).toBeDisabled();
  await expect(restore).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(del).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(restore).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(row).toBeFocused();
  await expect(row).toBeVisible();
});
