import { expect, test, type Page } from "@playwright/test";

async function startDesktop(page: Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await expect(page.locator('[data-test-desktop-icon="computer"]')).toBeVisible();
}
async function rectangle(page: Page, from:{x:number;y:number}, to:{x:number;y:number},
  modifiers: readonly ("Control"|"Shift")[] = []) {
  const desktop=page.locator("#desktop-icons");
  const box=await desktop.boundingBox();
  if(!box)throw Error("Desktop bounds missing");
  for(const key of modifiers) await page.keyboard.down(key);
  try {
    await page.mouse.move(box.x+from.x, box.y+from.y);
    await page.mouse.down();
    await page.mouse.move(box.x+to.x, box.y+to.y, { steps: 8 });
    await expect(desktop.locator('[data-test-desktop-band]')).toBeVisible();
    await page.mouse.up();
    await expect(desktop.locator('[data-test-desktop-band]')).toHaveCount(0);
  } finally {
    for(const key of [...modifiers].reverse()) await page.keyboard.up(key);
  }
}

test("rubber-band selects intersecting icons and keeps selection after pointer release", async ({page})=>{
  await startDesktop(page);
  const desktop=page.locator("#desktop-icons");
  const bin=desktop.locator('[data-test-desktop-icon="bin"]');
  const computer=desktop.locator('[data-test-desktop-icon="computer"]');
  const contacts=desktop.locator('[data-test-desktop-icon="web_contacts"]');
  await rectangle(page,{x:142,y:146},{x:8,y:8});
  await expect(bin).toHaveAttribute("data-test-desktop-selected","true");
  await expect(computer).toHaveAttribute("data-test-desktop-selected","true");
  await expect(contacts).toHaveAttribute("data-test-desktop-selected","false");
  await expect(computer).toHaveAttribute("data-test-desktop-x","0");
  await expect(computer).toHaveAttribute("data-test-desktop-y","80");
  await desktop.click({position:{x:200,y:310}});
  await expect(bin).toHaveAttribute("data-test-desktop-selected","false");
  await expect(computer).toHaveAttribute("data-test-desktop-selected","false");
});

test("Ctrl band toggles hits and Shift band adds to prior source selection", async ({page})=>{
  await startDesktop(page);
  const desktop=page.locator("#desktop-icons");
  const bin=desktop.locator('[data-test-desktop-icon="bin"]');
  const computer=desktop.locator('[data-test-desktop-icon="computer"]');
  const contacts=desktop.locator('[data-test-desktop-icon="web_contacts"]');
  await rectangle(page,{x:142,y:146},{x:8,y:8});
  await rectangle(page,{x:142,y:62},{x:8,y:8},["Control"]);
  await expect(bin).toHaveAttribute("data-test-desktop-selected","false");
  await expect(computer).toHaveAttribute("data-test-desktop-selected","true");
  await rectangle(page,{x:145,y:228},{x:8,y:174},["Shift"]);
  await expect(contacts).toHaveAttribute("data-test-desktop-selected","true");
  await expect(computer).toHaveAttribute("data-test-desktop-selected","true");
  await expect(bin).toHaveAttribute("data-test-desktop-selected","false");
});

test("reverse rectangle direction selects icons; selection supports existing group drag", async ({page})=>{
  await startDesktop(page);
  const desktop=page.locator("#desktop-icons");
  const bin=desktop.locator('[data-test-desktop-icon="bin"]');
  const computer=desktop.locator('[data-test-desktop-icon="computer"]');
  await rectangle(page,{x:142,y:8},{x:8,y:146});
  await expect(bin).toHaveAttribute("data-test-desktop-selected","true");
  await expect(computer).toHaveAttribute("data-test-desktop-selected","true");
  const box=await bin.boundingBox();
  if(!box)throw Error("Bin bounds missing");
  await page.mouse.move(box.x+20,box.y+18);
  await page.mouse.down();
  await page.mouse.move(box.x+105,box.y+83,{steps:8});
  await expect(desktop.locator('[data-test-desktop-ghost]')).toHaveCount(2);
  await page.mouse.up();
  await expect(bin).toHaveAttribute("data-test-desktop-x","85");
  await expect(computer).toHaveAttribute("data-test-desktop-x","85");
});

test("band selection does not intercept desktop context menu or original icon launch",async({page})=>{
  await startDesktop(page);
  const desktop=page.locator("#desktop-icons");
  await rectangle(page,{x:145,y:150},{x:8,y:8});
  await desktop.click({button:"right",position:{x:260,y:260}});
  const menu=desktop.locator('[data-test-desktop-menu]');
  await expect(menu).toBeVisible();
  await expect(desktop.locator('[data-test-desktop-band]')).toHaveCount(0);
  await desktop.locator('[data-test-desktop-icon="computer"]').dblclick();
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
});
