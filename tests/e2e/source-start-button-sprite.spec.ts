import {test,expect} from "@playwright/test";

for(const theme of ["aeroNoir","oxygen"] as const){
  test(theme+" inherited source Start sprite uses first and last frames",async({page},info)=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-source-logon-avatar="'+theme+'"]').click({timeout:12000});
    const shell=page.locator('[data-test-main-screen][data-theme="'+theme+'"]');
    const button=shell.locator('[data-test-start-button]');
    const sprite=button.locator('[data-test-source-start-sprite]');
    await expect(sprite).toBeVisible();
    await expect(sprite).toHaveCSS("background-image",/start-button\.b35eae12\.webp/);
    await expect(sprite).toHaveCSS("background-size","100% 300%");
    await expect(button).toHaveCSS("width","56px");
    await expect(sprite).toHaveCSS("background-position-y","0%");
    const dimensions=await sprite.evaluate(async el=>{
      const url=getComputedStyle(el).backgroundImage.slice(5,-2);
      const image=new Image();image.src=url;await image.decode();
      return [image.naturalWidth,image.naturalHeight];
    });
    expect(dimensions).toEqual([108,324]);
    if(info.project.name==="chromium-desktop"){
      await button.hover();
      await expect(sprite).toHaveCSS("background-position-y","100%");
      await page.mouse.move(200,100);
      await expect(sprite).toHaveCSS("background-position-y","0%");
    }
    // Keyboard activation works independently of hover.
    await button.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded","true");
    await expect(sprite).toHaveCSS("background-position-y","100%");
    await button.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded","false");
  });
}
