import {expect,test,type Page} from "@playwright/test";

async function openExplorer(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win).toBeVisible();
  return win;
}
async function createFolder(win:ReturnType<Page["locator"]>,name:string){
  await win.getByRole("button",{name:"New folder"}).click();
  const prompt=win.getByRole("dialog",{name:"New folder"});
  await prompt.getByRole("textbox",{name:"New folder name"}).fill(name);
  await prompt.getByRole("button",{name:"OK"}).click();
  const row=win.locator('[data-test-explorer-item="'+name+'"]');
  await expect(row).toBeVisible();
  return row;
}

test("final source showItemCheckboxes=false hides Computer checkboxes after selection",async({page})=>{
  const win=await openExplorer(page);
  const a=await createFolder(win,"SourceCheckA");
  const b=await createFolder(win,"SourceCheckB");
  await expect(win.locator('[data-test-item-checkbox]')).toHaveCount(0);
  await a.click();
  await expect(a).toHaveClass(/is-selected/);
  // Final app.config.json explicitly disables the source 2024-era
  // touch-selection checkbox feature. This is not a device heuristic.
  await expect(win.locator('[data-test-item-checkbox]')).toHaveCount(0);
  const touch=await page.evaluate(()=>
    window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0);
  if(!touch){
    // Existing ordinary multi-selection still works when checkboxes
    // are disabled by the source feature flag.
    await b.click({modifiers:["Control"]});
    await expect(a).toHaveClass(/is-selected/);
    await expect(b).toHaveClass(/is-selected/);
    await expect(win.getByText("2 selected",{exact:false})).toBeVisible();
    await expect(win.locator('[data-test-item-checkbox]')).toHaveCount(0);
  }
  await expect(win.getByRole("textbox",{name:"Folder address"})).toHaveValue("Computer");
});
