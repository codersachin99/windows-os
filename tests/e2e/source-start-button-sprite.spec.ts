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

for(const theme of ["win7","aero-1","aero-2","aero-3","aero-4","basic-1"] as const){
  test(theme+" source orb crops normal, hover and open frames",async({page},info)=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const shell=page.locator('[data-test-main-screen][data-theme="'+theme+'"]');
    const button=shell.locator('[data-test-start-button]');
    const sprite=button.locator('[data-test-source-start-sprite]');
    await expect(sprite).toBeVisible();
    await expect(button).toHaveCSS("width","54px");
    await expect(sprite).toHaveCSS("background-image",/start-button\.b35eae12\.webp/);
    await expect(sprite).toHaveCSS("background-position-y","-7px");
    const overlay=()=>sprite.evaluate(el=>{
      const s=getComputedStyle(el,"::after");
      return {y:s.backgroundPositionY,x:s.backgroundPositionX,opacity:s.opacity};
    });
    expect((await overlay()).y).toBe("-61px");
    if(info.project.name==="chromium-desktop"){
      await button.hover();
      await expect.poll(async()=>(await overlay()).opacity).toBe("1");
    }
    await button.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded","true");
    await expect(sprite).toHaveCSS("background-position-y","-115px");
    await expect.poll(async()=>(await overlay()).opacity).toBe("0");
    await button.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded","false");
    await expect(sprite).toHaveCSS("background-position-y","-7px");
    await page.evaluate(()=>{document.documentElement.dir="rtl";});
    await expect(sprite).toHaveCSS("background-position-x","100%");
    expect((await overlay()).x).toBe("100%");
  });
}

test("Classic Basic themes retain their independent original Start logo",async({page})=>{
  for(const theme of ["basic-2","basic-3","basic-4"]){
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const button=page.locator('[data-test-start-button]');
    await expect(button.locator('[data-test-source-start-sprite]')).toHaveCount(0);
    await expect(button.locator("img")).toHaveAttribute("src","/assets/images/start-button-classic.ec7b0b9f.webp");
  }
});
