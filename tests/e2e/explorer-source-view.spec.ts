import { expect, test } from "@playwright/test";

async function openSourceExplorer(page: import("@playwright/test").Page, app: "computer" | "bin") {
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="' + app + '"]').dblclick();
  const window=page.locator('[data-test-window="' + app + '"]');
  await expect(window).toBeVisible();
  return window;
}

const modes=[
  "Extra large icons","Large icons","Medium icons","Small icons",
  "List","Details","Tiles","Content"
];

test("Win7 Computer uses source View popup with eight modes and 0-7 slider", async ({page}) => {
  const computer=await openSourceExplorer(page,"computer");
  const view=computer.getByRole("button",{name:"View",exact:true});
  await expect(view).toBeVisible();
  await expect(computer.getByRole("combobox",{name:"Explorer view"})).toHaveCount(0);
  await view.click();
  const popup=computer.getByRole("menu",{name:"View options"});
  await expect(popup).toBeVisible();
  await expect(popup.getByRole("menuitemradio")).toHaveText(modes);
  const slider=popup.getByRole("slider",{name:"View size"});
  await expect(slider).toHaveAttribute("min","0");
  await expect(slider).toHaveAttribute("max","7");
  await expect(slider).toHaveValue("5"); // original Details entry is slot five
  await expect(popup.getByRole("menuitemradio",{name:"Details"}))
    .toHaveAttribute("aria-checked","true");
  await popup.getByRole("menuitemradio",{name:"Extra large icons"}).click();
  await expect(computer.locator(".explorer-list")).toHaveClass(/is-extra/);
  await expect(popup).toHaveCount(0);
  await view.click();
  await expect(slider).toHaveValue("0");
  await slider.press("End");
  await expect(slider).toHaveValue("7");
  await expect(computer.locator(".explorer-list")).toHaveClass(/has-content/);
  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  await expect(view).toBeFocused();
});

test("Win7 Bin inherits View popup and retains safe Recycle Bin actions", async ({page}) => {
  const bin=await openSourceExplorer(page,"bin");
  const view=bin.getByRole("button",{name:"View",exact:true});
  await view.click();
  const popup=bin.getByRole("menu",{name:"View options"});
  await expect(popup.getByRole("menuitemradio")).toHaveText(modes);
  await popup.getByRole("menuitemradio",{name:"Tiles"}).click();
  await expect(bin.locator(".explorer-list")).toHaveClass(/has-tiles/);
  await expect(bin.getByRole("button",{name:"Empty Recycle Bin"})).toBeDisabled();
  await view.click();
  await expect(popup).toBeVisible();
  await bin.getByRole("searchbox",{name:"Search files"}).click();
  await expect(popup).toHaveCount(0);
});

test("other migrated themes retain prior functional select during separate source work", async ({page}) => {
  await page.goto("/?theme=winxp");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]');
  const select=computer.getByRole("combobox",{name:"Explorer view"});
  await expect(select).toBeVisible();
  await expect(computer.getByRole("button",{name:"View",exact:true})).toHaveCount(0);
  await select.selectOption("tiles");
  await expect(computer.locator(".explorer-list")).toHaveClass(/has-tiles/);
});
