import { expect, test, type Page, type Locator } from "@playwright/test";

const STORAGE_KEY = "windows-os:desktop-layout:guest:v1";
async function logon(page: Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await expect(page.locator('[data-test-desktop-icon="computer"]')).toBeVisible();
}
async function dragIcon(page: Page, icon: Locator, dx: number, dy: number) {
  const box = await icon.boundingBox();
  if (!box) throw new Error("Desktop icon has no bounds");
  const startX = box.x + Math.min(20, box.width / 3), startY = box.y + Math.min(18, box.height / 3);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + dx, startY + dy, { steps: 6 });
  await page.mouse.up();
}
async function openDesktopView(page: Page) {
  const desktop=page.locator("#desktop-icons");
  await desktop.click({button:"right",position:{x:Math.min(440,Math.max(250,(await desktop.boundingBox())!.width - 50)),y:Math.min(300,(await desktop.boundingBox())!.height - 30)}});
  const menu=desktop.locator('[data-test-desktop-menu]');
  await expect(menu).toBeVisible();
  await menu.getByRole("menuitem",{name:/View/}).click();
  return menu;
}

test("desktop icons start in source column-first 80px layout and moving an icon persists",async({page})=>{
  await logon(page);
  const desktop=page.locator("#desktop-icons");
  const bin=desktop.locator('[data-test-desktop-icon="bin"]');
  const computer=desktop.locator('[data-test-desktop-icon="computer"]');
  await expect(bin).toHaveAttribute("data-test-desktop-x","0");
  await expect(bin).toHaveAttribute("data-test-desktop-y","0");
  await expect(computer).toHaveAttribute("data-test-desktop-x","0");
  await expect(computer).toHaveAttribute("data-test-desktop-y","80");
  await dragIcon(page,computer,160,65);
  await expect(computer).toHaveAttribute("data-test-desktop-x","160");
  await expect(computer).toHaveAttribute("data-test-desktop-y","145");
  await expect(bin).toHaveAttribute("data-test-desktop-x","0");
  const stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)??"null") as {
    version: number; autoArrange:boolean; positions:Record<string,{x:number;y:number}>
  },STORAGE_KEY);
  expect(stored).toMatchObject({version:1,autoArrange:false,positions:{
    computer:{x:160,y:145}
  }});
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-desktop-icon="computer"]'))
    .toHaveAttribute("data-test-desktop-x","160");
  await expect(page.locator('[data-test-desktop-icon="computer"]'))
    .toHaveAttribute("data-test-desktop-y","145");
});

test("Ctrl selection drags two desktop shortcuts as a source group",async({page})=>{
  await logon(page);
  const bin=page.locator('[data-test-desktop-icon="bin"]');
  const computer=page.locator('[data-test-desktop-icon="computer"]');
  await bin.click();
  await computer.click({modifiers:["Control"]});
  await expect(bin).toHaveAttribute("data-test-desktop-selected","true");
  await expect(computer).toHaveAttribute("data-test-desktop-selected","true");
  const box=await bin.boundingBox();
  if(!box) throw Error("Missing Bin icon");
  await page.mouse.move(box.x+20,box.y+20);
  await page.mouse.down();
  await page.mouse.move(box.x+115,box.y+75,{steps:5});
  await expect(page.locator('[data-test-desktop-ghost]')).toHaveCount(2);
  await page.mouse.up();
  await expect(bin).toHaveAttribute("data-test-desktop-x","95");
  await expect(bin).toHaveAttribute("data-test-desktop-y","55");
  await expect(computer).toHaveAttribute("data-test-desktop-x","95");
  await expect(computer).toHaveAttribute("data-test-desktop-y","135");
});

test("source View menu toggles Auto arrange and restores saved free positions",async({page})=>{
  await logon(page);
  const desktop=page.locator("#desktop-icons");
  const computer=desktop.locator('[data-test-desktop-icon="computer"]');
  await dragIcon(page,computer,125,40);
  await expect(computer).toHaveAttribute("data-test-desktop-x","125");

  let menu=await openDesktopView(page);
  await menu.getByRole("menuitemcheckbox",{name:/Auto arrange icons/}).click();
  await expect(desktop).toHaveAttribute("data-test-desktop-layout","auto");
  await expect(computer).toHaveAttribute("data-test-desktop-x","0");
  await expect(computer).toHaveAttribute("data-test-desktop-y","80");
  await dragIcon(page,computer,60,45);
  await expect(computer).toHaveAttribute("data-test-desktop-x","0");

  menu=await openDesktopView(page);
  await menu.getByRole("menuitemcheckbox",{name:/Auto arrange icons/}).click();
  await expect(desktop).toHaveAttribute("data-test-desktop-layout","free");
  await expect(computer).toHaveAttribute("data-test-desktop-x","125");
  await expect(computer).toHaveAttribute("data-test-desktop-y","120");
});

test("source desktop View toggles icon size and visibility, settings persist",async({page})=>{
  await logon(page);
  const desktop=page.locator("#desktop-icons");
  let menu=await openDesktopView(page);
  await menu.getByRole("menuitemradio",{name:/Small icons/}).click();
  await expect(desktop.locator('[data-test-desktop-icon="bin"]'))
    .toHaveCSS("width","50px");
  menu=await openDesktopView(page);
  await menu.getByRole("menuitemcheckbox",{name:/Show desktop icons/}).click();
  await expect(desktop.locator('[data-test-desktop-icon]')).toHaveCount(0);
  menu=await openDesktopView(page);
  await menu.getByRole("menuitemcheckbox",{name:/Show desktop icons/}).click();
  await expect(desktop.locator('[data-test-desktop-icon="computer"]')).toBeVisible();

  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-desktop-icon="bin"]')).toHaveCSS("width","50px");
});

test("saved icon coordinates are clamped on mobile and restored at desktop size",async({page})=>{
  await logon(page);
  const computer=page.locator('[data-test-desktop-icon="computer"]');
  await dragIcon(page,computer,430,245);
  await expect(computer).toHaveAttribute("data-test-desktop-x","430");
  await page.setViewportSize({width:390,height:620});
  await expect(computer).toHaveAttribute("data-test-desktop-x","310");
  await page.setViewportSize({width:1280,height:720});
  await expect(computer).toHaveAttribute("data-test-desktop-x","430");
  await computer.dblclick();
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
});
