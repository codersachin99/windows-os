import { expect, test } from "@playwright/test";

async function computer(page: import("@playwright/test").Page, theme: "win7" | "winxp") {
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  await expect(explorer).toBeVisible();
  return explorer;
}

test("source Win7 Computer addressbar has only 2 history buttons and no Up", async ({page}) => {
  const explorer=await computer(page,"win7");
  const address=explorer.locator(".explorer-address");
  const history=address.getByRole("navigation",{name:"Folder history"});
  await expect(history.getByRole("button")).toHaveCount(2);
  await expect(history.getByRole("button",{name:"Back"})).toBeDisabled();
  await expect(history.getByRole("button",{name:"Forward"})).toBeDisabled();
  await expect(address.getByRole("button",{name:"Up",exact:true})).toHaveCount(0);
  // Do not remove the underlying parent navigation: original Computer
  // exposes the hierarchy through clickable addressbar breadcrumbs.
  await explorer.getByRole("button",{name:"System (C:)",exact:true}).click();
  await expect(address.getByRole("button",{name:"Up",exact:true})).toHaveCount(0);
  await expect(history.getByRole("button",{name:"Back"})).toBeEnabled();
  await explorer.getByRole("navigation",{name:"Folder path"})
    .getByRole("button",{name:"Computer",exact:true}).click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue("/EXTERNAL/computer");
  await history.getByRole("button",{name:"Back"}).click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue("/EXTERNAL/computer/drive0");
});

test("other migration theme retains functional Up while Win7 hides it", async ({page}) => {
  const explorer=await computer(page,"winxp");
  const address=explorer.locator(".explorer-address");
  const up=address.getByRole("button",{name:"Up",exact:true});
  await expect(up).toBeVisible();
  await expect(explorer.getByRole("navigation",{name:"Folder history"})).toHaveCount(0);
  await explorer.getByRole("button",{name:"New folder"}).click();
  const prompt=explorer.getByRole("dialog",{name:"New folder"});
  await prompt.getByRole("textbox",{name:"New folder name"}).fill("UpCompatibilityProbe");
  await prompt.getByRole("button",{name:"OK"}).click();
  await explorer.locator('[data-test-explorer-item="UpCompatibilityProbe"]').dblclick();
  await expect(explorer.getByRole("textbox",{name:"Folder address"})).toHaveValue("/UpCompatibilityProbe");
  await up.click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"})).toHaveValue("Computer");
});
