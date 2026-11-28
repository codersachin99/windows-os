import {expect,test} from "@playwright/test";
const original=[
  ["winvista","/assets/images/winvista.d80b2f4f.webp"],
  ["macos","/assets/images/macos.54af5cd4.webp"],
  ["chromeos","/assets/images/chromeos.eaca6e72.webp"],
  ["ubuntu","/assets/images/ubuntu.3588c6cf.webp"],
  ["kubuntu","/assets/images/kubuntu.618268f7.webp"],
  ["winLS","/assets/images/winLS.e359a90f.jpg"],
  ["winLP","/assets/images/winLP.dcaa8b07.jpg"],
  ["aeroNoir","/assets/images/aeroNoir.237e6377.webp"],
  ["oxygen","/assets/images/oxygen.414aed47.svg"],
  ["winW","/assets/images/winW.6a3e313e.webp"],
  ["winxpG","/assets/images/autumn.41774694.webp"],
  ["winxpR","/assets/images/follows.3e030a12.webp"],
  ["winxpS","/assets/images/azul.3af33f73.webp"],
  ["winxpZ","/assets/images/ascent.7c62e722.webp"]
] as const;

for(const [theme,path] of original){
  test("source "+theme+" Guest desktop paints its own original wallpaper",async({page})=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const desktop=page.locator('[data-test-main-screen]');
    await expect(desktop).toHaveAttribute("data-theme",theme);
    const background=desktop.locator("[data-test-desktop-background]");
    await expect(background).toHaveAttribute("data-test-desktop-background",path);
    const painted=await background.evaluate(el=>getComputedStyle(el).backgroundImage);
    expect(painted).toContain(path);
    expect((await page.request.get(path)).ok()).toBeTruthy();
    await page.reload();
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    await expect(background).toHaveAttribute("data-test-desktop-background",path);
  });
}
for(const [theme,color,computed] of [
  ["base","#fffd","rgba(255, 255, 255, 0.867)"],
  ["onebit","#352b30","rgb(53, 43, 48)"],
  ["win31","#bfbdc0","rgb(191, 189, 192)"],
  ["win95","#007d7b","rgb(0, 125, 123)"],
  ["win98","#57a8a8","rgb(87, 168, 168)"],
  ["win2k","#3b6ea4","rgb(59, 110, 164)"]
] as const){
  test("source "+theme+" desktop uses exact solid default",async({page})=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const background=page.locator("[data-test-desktop-background]");
    await expect(background).toHaveAttribute("data-test-desktop-background",color);
    await expect(background).toHaveCSS("background-image","none");
    await expect(background).toHaveCSS("background-color",computed);
  });
}
