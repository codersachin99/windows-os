import {expect,test,type Page} from "@playwright/test";

const themes=[
  {id:"win95",surface:"rgb(189, 190, 189)",accent:"rgb(0, 0, 123)"},
  {id:"win98",surface:"rgb(192, 199, 200)",accent:"rgb(6, 8, 166)"},
  {id:"win2k",surface:"rgb(212, 208, 200)",accent:"rgb(8, 39, 103)"}
] as const;

async function sourceGuestComputer(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveAttribute("data-theme",theme);
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]').first();
  await expect(computer).toBeVisible();
  return computer;
}

for(const family of themes){
  test(family.id+" source Explorer has original 3D headers, tree and label-only selection",async({page})=>{
    const computer=await sourceGuestComputer(page,family.id);
    const explorer=computer.locator('[data-test-explorer]');
    await expect(explorer).toHaveCSS("background-color",family.surface);
    const address=explorer.locator(".explorer-address");
    await expect(address).toHaveCSS("background-color",family.surface);
    const desktop=explorer.locator(".explorer-navigation")
      .getByRole("button",{name:"Desktop",exact:true});
    await desktop.click();
    await expect(desktop).toHaveAttribute("aria-current","location");
    await expect(desktop).toHaveCSS("background-color",family.accent);
    await expect(desktop).toHaveCSS("color","rgb(255, 255, 255)");

    const name="Original "+family.id+" Listview File.txt";
    await computer.locator('input[type="file"][aria-label="Upload files"]')
      .setInputFiles({name,mimeType:"text/plain",buffer:Buffer.from("source listview file")});
    const item=explorer.locator('[data-test-explorer-item="'+name+'"]');
    await expect(item).toBeVisible();
    await item.hover();
    await expect(item).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
    await item.click();
    await expect(item).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
    const label=item.locator(".listview__item-label");
    await expect(label).toHaveCSS("background-color",family.accent);
    await expect(label).toHaveCSS("color","rgb(255, 255, 255)");
    await expect(label).toHaveCSS("outline-style","dotted");
    await expect(label).toHaveCSS("outline-color","rgb(255, 255, 51)");

    await explorer.getByRole("combobox",{name:"Explorer view"}).selectOption("details");
    const columns=explorer.locator(".explorer-columns");
    await expect(columns).toHaveCSS("background-color",family.surface);
    const header=columns.locator(".listview__header-column").first();
    await expect(header).toHaveCSS("background-color",family.surface);
    await expect(header).toHaveCSS("box-shadow",/inset/);
    await expect(explorer.locator(".explorer-status"))
      .toHaveCSS("background-color",family.surface);

    await page.locator('[data-test-desktop-icon="bin"]').dblclick();
    const bin=page.locator('[data-test-window="bin"]').first();
    await expect(bin).toBeVisible();
    await expect(bin.locator('[data-test-explorer]'))
      .toHaveCSS("background-color",family.surface);
  });
}
