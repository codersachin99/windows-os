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

test("source fa65 checkbox only appears after touch selection; toggles Guest multi-select",async({page})=>{
  const win=await openExplorer(page);
  const a=await createFolder(win,"SourceCheckA");
  const b=await createFolder(win,"SourceCheckB");
  await expect(win.locator('[data-test-item-checkbox]')).toHaveCount(0);
  await a.click();
  await expect(a).toHaveClass(/is-selected/);
  const touch=await page.evaluate(()=>
    window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0);
  if(!touch){
    // Source Computer.showCheckboxes requires isTouch === true.
    await expect(win.locator('[data-test-item-checkbox]')).toHaveCount(0);
    return;
  }
  const first=a.locator('[data-test-item-checkbox]');
  const second=b.locator('[data-test-item-checkbox]');
  await expect(first).toHaveAttribute("aria-checked","true");
  await expect(second).toHaveAttribute("aria-checked","false");
  await expect(first).toHaveAttribute("aria-label","SourceCheckA");
  await expect(second).toHaveAttribute("data-test-item-checkbox","");
  await second.click();
  await expect(second).toHaveAttribute("aria-checked","true");
  await expect(b).toHaveClass(/is-selected/);
  await expect(a).toHaveClass(/is-selected/);
  await expect(win.getByText("2 selected",{exact:false})).toBeVisible();
  await first.click();
  await expect(a).not.toHaveClass(/is-selected/);
  await expect(b).toHaveClass(/is-selected/);
  await expect(second).toHaveAttribute("aria-checked","true");
  // The migrated checkbox is also keyboard accessible; the original click
  // activation still must not navigate into the folder.
  await second.focus();
  await second.press("Space");
  await expect(win.locator('[data-test-item-checkbox]')).toHaveCount(0);
  await expect(win.getByRole("textbox",{name:"Folder address"})).toHaveValue("Computer");
});
