import {test,expect} from "@playwright/test";

for(const [theme,color] of [
  ["ubuntu","#f0b85b"],["kubuntu","#5986ca"],["oxygen","#b3e165"],["aeroNoir","#6bc35b"]
] as const){
  test("source registry default accent: "+theme,async({page})=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-source-logon-avatar="'+theme+'"]').click({timeout:12000});
    const shell=page.locator('[data-test-main-screen][data-theme="'+theme+'"]');
    await expect(shell).toBeVisible();
    const palette=await shell.evaluate(el=>({
      accent:getComputedStyle(el).getPropertyValue("--theme-color").trim(),
      inactive:getComputedStyle(el).getPropertyValue("--theme-color--inactive").trim(),
      glass:el.hasAttribute("data-effect-enable-glass")
    }));
    if(theme==="aeroNoir"&&palette.glass){
      expect(palette.accent.replace(/\s/g,"")).toMatch(/^rgba\(107,195,91,0?\.65\)$/);
      expect(palette.inactive.replace(/\s/g,"")).toMatch(/^rgba\(107,195,91,0?\.3\)$/);
    }else expect(palette.accent).toBe(color);
  });
}
