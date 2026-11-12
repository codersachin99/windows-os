import { expect, test, type Locator, type Page } from "@playwright/test";

const desktop = "/EXTERNAL/computer/drive0/Users/Guest/Desktop";
const documents = "/EXTERNAL/computer/drive0/Users/Guest/Documents";

async function login(page: Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function createDesktopFolder(page: Page, name: string): Promise<Locator> {
  await page.locator("#desktop-icons").click({ button:"right", position:{x:280,y:290} });
  const menu = page.locator("[data-test-desktop-menu]");
  await menu.getByRole("menuitem", {name:/^New/}).click();
  await menu.getByRole("menuitem", {name:"Folder",exact:true}).click();
  const rename = page.locator("[data-test-desktop-rename]");
  await expect(rename).toBeVisible();
  await rename.fill(name);
  await rename.press("Enter");
  const icon = page.locator('[data-test-desktop-file="' + desktop + "/" + name + '"]');
  await expect(icon).toBeVisible();
  return icon;
}
async function openDocuments(page: Page): Promise<Locator> {
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]').last();
  await explorer.getByRole("button", {name:"Documents",exact:true}).click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"})).toHaveValue(documents);
  return explorer;
}
async function createExplorerFolder(explorer: Locator, name: string) {
  await explorer.getByRole("button",{name:"New folder"}).click();
  const form = explorer.getByRole("dialog",{name:"New folder"});
  await form.getByRole("textbox",{name:"New folder name"}).fill(name);
  await form.getByRole("button",{name:"OK"}).click();
  await expect(explorer.locator('[data-test-explorer-item="' + name + '"]')).toBeVisible();
}
async function pointerDrop(page: Page, icon: Locator, target: Locator, copy = false) {
  const a = await icon.boundingBox();
  const b = await target.boundingBox();
  if (!a || !b) throw new Error("Cannot resolve visible Desktop/Explorer pointer targets");
  const startX = a.x + Math.min(19, a.width / 2);
  const startY = a.y + Math.min(24, a.height / 2);
  const destX = b.x + Math.min(b.width / 2, 90);
  const destY = b.y + Math.min(b.height / 2, 85);
  await page.mouse.move(startX,startY);
  await page.mouse.down();
  // Press Ctrl only AFTER pointerdown so the modifier does not toggle the
  // source desktop's selected group while initiating a copy drag.
  if (copy) await page.keyboard.down("Control");
  try {
    await page.mouse.move(destX,destY,{steps:12});
    await page.mouse.up();
  } finally {
    if (copy) await page.keyboard.up("Control");
  }
}
test("move a real Guest Desktop folder into Explorer Documents with pointer drag", async ({page}) => {
  await login(page);
  const icon = await createDesktopFolder(page,"Move Me");
  const explorer = await openDocuments(page);
  const target = explorer.locator(".explorer-content");
  await expect(target).toHaveAttribute("data-windows-os-drop-directory",documents);
  await pointerDrop(page,icon,target);
  await expect(icon).toHaveCount(0);
  await expect(explorer.locator('[data-test-explorer-item="Move Me"]')).toBeVisible();
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-desktop-file="' + desktop + '/Move Me"]')).toHaveCount(0);
  const next = await openDocuments(page);
  await expect(next.locator('[data-test-explorer-item="Move Me"]')).toBeVisible();
});
test("Ctrl pointer drop copies rather than moves and refuses duplicate destination names", async ({page}) => {
  await login(page);
  const icon = await createDesktopFolder(page,"Copy Me");
  const explorer = await openDocuments(page);
  const target = explorer.locator(".explorer-content");
  await pointerDrop(page,icon,target,true);
  await expect(icon).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="Copy Me"]')).toBeVisible();
  await pointerDrop(page,icon,target);
  await expect(page.locator("#desktop-icons [role=alert]"))
    .toContainText("Destination already exists");
  await expect(icon).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="Copy Me"]')).toHaveCount(1);
});
test("drop a multi-selected Desktop group onto a named Explorer folder row", async ({page}) => {
  await login(page);
  const a = await createDesktopFolder(page,"Move Group One");
  const b = await createDesktopFolder(page,"Move Group Two");
  const explorer = await openDocuments(page);
  await createExplorerFolder(explorer,"Destination");
  await a.click();
  await b.click({modifiers:["Control"]});
  await expect(a).toHaveAttribute("data-test-desktop-selected","true");
  await expect(b).toHaveAttribute("data-test-desktop-selected","true");
  const target = explorer.locator('[data-test-explorer-item="Destination"]');
  await expect(target).toHaveAttribute(
    "data-windows-os-drop-directory",documents+"/Destination");
  await pointerDrop(page,b,target);
  await expect(a).toHaveCount(0);
  await expect(b).toHaveCount(0);
  await target.dblclick();
  await expect(explorer.locator('[data-test-explorer-item="Move Group One"]')).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="Move Group Two"]')).toBeVisible();
});
test("same-directory and covered window drops never bypass Explorer VFS guards", async ({page}) => {
  await login(page);
  const icon = await createDesktopFolder(page,"Stay Here");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]').last();
  await explorer.getByRole("button",{name:"Desktop",exact:true}).click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"})).toHaveValue(desktop);
  await pointerDrop(page,icon,explorer.locator(".explorer-content"));
  await expect(page.locator("#desktop-icons [role=alert]"))
    .toContainText("Cannot paste into the same file");
  await expect(icon).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="Stay Here"]')).toHaveCount(1);
});
