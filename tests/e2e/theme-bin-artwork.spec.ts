import {expect,test,type Page} from "@playwright/test";

const SOURCE_DESKTOP="/EXTERNAL/computer/drive0/Users/Guest/Desktop";
const artwork={
  winxp:{
    empty:"/assets/images/bin-winxp.7d0403fd.webp",
    full:"/assets/images/bin-full-winxp.ba3f6193.webp"
  },
  win11:{
    empty:"/assets/images/bin-win11.73608517.webp",
    full:"/assets/images/bin-full-win11.de576bf3.webp"
  }
} as const;

async function sourceThemeDesktop(page:Page,theme:keyof typeof artwork){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]')).toHaveAttribute("data-theme",theme);
}

for(const theme of ["winxp","win11"] as const){
  test("original "+theme+" Recycle Bin artwork follows the actual Guest trash lifecycle",async({page})=>{
    await sourceThemeDesktop(page,theme);
    const icon=page.locator('[data-test-desktop-icon="bin"]');
    const image=icon.locator(".desktop__icon-icon");
    await expect(image).toHaveAttribute("src",artwork[theme].empty);

    const name="Source "+theme+" Bin Art.txt";
    await page.locator("[data-test-desktop-upload-input]").setInputFiles({
      name,mimeType:"text/plain",buffer:Buffer.from("original image lifecycle")
    });
    const file=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+"/"+name+'"]');
    await expect(file).toBeVisible();
    await file.click({button:"right"});
    await page.locator('[data-test-desktop-item-action="delete"]').click();
    const deletion=page.getByRole("alertdialog",{name:"Confirm desktop deletion"});
    await deletion.getByRole("button",{name:"Yes"}).click();
    await expect(file).toHaveCount(0);
    await expect(image).toHaveAttribute("src",artwork[theme].full);

    await icon.dblclick();
    const bin=page.locator('[data-test-window="bin"]').last();
    await expect(bin.locator('[data-test-explorer-item="'+name+'"]')).toBeVisible();
    await expect(bin.locator(".explorer-navigation__home img").first())
      .toHaveAttribute("src",artwork[theme].full);
    await bin.getByRole("button",{name:/^Close /}).click();

    await icon.click({button:"right"});
    await page.locator('[data-test-desktop-item-action="empty-bin"]').click();
    const empty=page.getByRole("alertdialog",{name:"Confirm empty Recycle Bin"});
    await empty.getByRole("button",{name:"Yes"}).click();
    await expect(image).toHaveAttribute("src",artwork[theme].empty);
  });
}
