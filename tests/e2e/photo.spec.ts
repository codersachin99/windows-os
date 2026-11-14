import { expect, test } from "@playwright/test";

// A real 3×2 PNG in the migration's virtual filesystem; no network media,
// host-disk access or synthetic app mock.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAE0lEQVR4nGPkDVj6nwEKmBiQAAAt0AIFWif3NgAAAABJRU5ErkJggg==", "base64");

test("source Windows Photo Viewer opens actual Computer pictures, navigates, rotates and saves",async({page})=>{
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  await expect(explorer).toBeVisible();

  await explorer.getByLabel("Upload files").setInputFiles([
    {name:"a.png",mimeType:"image/png",buffer:PNG},
    {name:"b.png",mimeType:"image/png",buffer:PNG}
  ]);
  const first=explorer.locator('[data-test-explorer-item="a.png"]');
  const second=explorer.locator('[data-test-explorer-item="b.png"]');
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();

  await first.dblclick();
  const photo=page.locator('[data-test-window="photo"]');
  await expect(photo).toBeVisible();
  await expect(photo.locator('[data-test-photo-image]')).toHaveAttribute("alt","a.png");
  await expect(photo.locator('[data-test-photo-image]')).toHaveJSProperty("naturalWidth",3);
  await expect(photo.getByRole("button",{name:"File",exact:true})).toBeDisabled();
  await expect(photo.getByRole("button",{name:"Print",exact:true})).toBeDisabled();
  await expect(photo.getByRole("button",{name:"Open",exact:true})).toBeDisabled();
  await expect(photo.getByRole("button",{name:"Previous picture"})).toBeEnabled();
  await expect(photo.getByRole("button",{name:"Next picture"})).toBeEnabled();

  await photo.getByRole("button",{name:"Rotate clockwise"}).click();
  await expect(photo.locator('[data-test-photo-image]')).toHaveAttribute("style",/rotate\(90deg\)/);
  await photo.getByRole("button",{name:"Next picture"}).click();
  await expect(photo.locator('[data-test-photo-image]')).toHaveAttribute("alt","b.png");
  await photo.getByRole("button",{name:"Next picture"}).click(); // source wraps to first
  await expect(photo.locator('[data-test-photo-image]')).toHaveAttribute("alt","a.png");
  await expect(photo.locator('[data-test-photo-image]')).toHaveJSProperty("naturalWidth",2);
  await expect(photo.locator('[data-test-photo-image]')).toHaveJSProperty("naturalHeight",3);

  const zoom=photo.getByRole("slider",{name:"Zoom"});
  await zoom.focus();
  await zoom.press("ArrowRight");
  await expect(zoom).toHaveValue("120");
  await page.getByRole("button",{name:"Close a.png"}).click();
  await expect(photo).toHaveCount(0);
  await expect(first).toBeVisible();
});
